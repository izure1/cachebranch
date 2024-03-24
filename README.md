# cachebranch

[![](https://data.jsdelivr.com/v1/package/npm/cachebranch/badge)](https://www.jsdelivr.com/package/npm/cachebranch)
![Node.js workflow](https://github.com/izure1/cachebranch/actions/workflows/node.js.yml/badge.svg)

Manage your cache in a hierarchical structure, similar to storing files in directories!  
Supports both asynchronous and synchronous operations.

```tsx
import { CacheBranchAsync } from 'cachebranch'

const branch = new CacheBranchAsync()

// Set cache
await branch.set('user', async () => {
  const name = await branch.ensure('user/name', async () => 'Unknown').raw
  const html = await branch.ensure('user/name/html', async () => <div>Loading...</div>).clone()
  return {
    name,
    html,
  }
})

await branch.set('user/name', async () => (
  await fetch('...').then(res => res.text())
))

await branch.set('user/name/html', async (b) => {
  const name = await branch.ensure('user/name', async () => 'Unknown').raw
  return (
    <div>{name}</div>
  )
})


// Re-cache 'user', 'user/name', 'user/name/html'
await branch.cache('user', 'bottom-up')

const user = await branch
  .ensure('user', getUser)
  .then(cache => cache.clone())

/**
 * {
 *   name: 'user-name',
 *   html: <div>user-name</div>
 * }
 * 
 */
console.log(user) 
```

## Why should I use it?

In application development, there are situations where caching values becomes necessary for performance reasons. Often, cached values have dependencies on other cached values.

In such cases, the **cachebranch** library can assist you in managing these dependencies effectively.

## How does it work?

To address cache dependency issues, **cachebranch** manages caches in a hierarchical structure. For example, if the **user** cache utilizes the **age** cache, you can create caches with keys **'user'** and **'user/age'**.

In this scenario, when you re-cache user, **'user/age'** being a sub-branch will also be re-cached automatically. This hierarchical structure facilitates swift resolution of dependency problems.

## Usage

### Node.js (cjs)

```bash
npm i cachebranch
```

```typescript
import { CacheBranchSync, CacheBranchAsync } from 'cachebranch'
```

### Browser (esm)

```html
<script type="module">
  import {
    CacheBranchSync,
    CacheBranchAsync
  } from 'https://cdn.jsdelivr.net/npm/cachebranch@1.x.x/dist/esm/index.min.js'
</script>
```

## Conceptualization

### Hierarchical Structure

**cachebranch** operates similarly to organizing files in directories. Just as deleting a directory removes its subdirectories and files, deleting a cache in **cachebranch** also removes its sub-level caches.

For example, if you delete the **'user'** cache, the sub-level cache **'user/age'** will also be deleted. Keep this structure in mind when setting keys. There is no limit to the depth of hierarchy, so you can have structures as deep as **'user/1/2/3/4/5/6...'** and beyond.

### Cache Creation Function

The **cachebranch** library operates slightly differently from other caching libraries.
You **should no**t assign values directly to keys for caching. Instead, you need to assign a function that returns the value to be cached.

```typescript
branch.set('user/age', async () => {
  const age = await fetch('get-your-age.com').then(res => res.text())
  return age
})
```

Now when a situation arises where you need to re-cache due to dependency issues, the library will automatically help modify the value by recalling the corresponding function.

### Cache Update Following Hierarchical Structure

You may want to update all cached content related to **'user'**. Try using it like this:

```typescript
branch.cache('user', 'bottom-up')
```

This code will update not only **'user'**, but also caches in the lower hierarchy such as **'user/age'**, **'user/nickname'**, etc. If you only want to update **'user'**, omit the second argument.

```typescript
branch.cache('user')
```

### Preventing Pollution of Cached Values

These cached values are not just primitive types. They can also be objects or arrays. Cached values should not be modified to maintain reliability, but they can become polluted due to developer mistakes. See the example below.

```typescript
const user = branch.get('user').raw

user.name = 'test' // Error! You must not pollute the value!
```

This happens because the value is shallowly copied. To solve this issue, **cachebranch** supports a **clone** method. This method deeply copies the value and returns it. You can use it like this:

```typescript
const user = branch.get('user').clone()

user.name = 'test' // Since this is a deeply copied object, it does not modify the cached value.
```

## Good practice

Here are some efficient ways to use **cachebranch**. Reading through them in order will help understanding.

### Use the **ensure** method instead of the **get** method

If the cache creation function has not been assigned yet, the **get** method may return **undefined**. This is not null-safe, and if caches are interdependent, it can lead to application errors. Always use the **ensure** method, which can always return a value.

```typescript
const age = await branch.get('user/age').raw // If the value is not present, an error may occur!
const age = await branch.ensure('user/age', getAge).raw // Instead, use it like this.
```

### Do not overuse the **set** method

The **set** method overrides the existing cache creation function and creates a new cache value. However, it's not designed to 'update' cache values and should only be used when you want to change the cache creation function. It's mostly used to overwrite cache creation functions with **ensure** methods for null safety. See the example below.

```typescript
await branch.set('user', async () => {
  // Here, a temporary function is created for null safety
  const age = await branch.ensure('user/age', () => 0).raw
  return {
    age
  }
})

// ...and then it is overwritten with a function created for null safety
await branch.set('user/age', async () => {
  const age = await fetch('get-your-age.com').then(res => res.text())
  return age
})
```

Also, the **set** method cannot update caches in other layers that it depends on. Therefore, for cache updates, use the **cache** method.

### Be mindful of the order when calling the **cache** method

When using the **cache** method to update cache values, pay attention to the selection between **top-down** and **bottom-up**.

**top-down** re-caches from the current layer down to the sub-layers.
**bottom-up** re-caches from the lowest layer up to the current layer.

Let's see an example below.

```typescript
const user = await branch.set('user', async () => {
  const name = await branch.ensure('user/name', async () => 'Unknown').raw
  const age = await branch.ensure('user/age', async () => 0).raw
  return {
    name,
    age,
  }
})

user.cache('user', 'bottom-up')
```

In this example, **'user'** depends on **'user/name'** and **'user/age'**.
Therefore, to obtain the latest values, **'user/name'** and **'user/age'** should be updated first. Therefore, caching should be done in the **bottom-up** manner.

## License

MIT license
