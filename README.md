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
  const nickname = await branch.ensure('user/nickname', async () => 'Anonymous')
  const html = await branch.ensure('user/nickname/html', async () => <div>Loading...</div>)
  return {
    nickname: nickname.raw,
    html: html.raw,
  }
})
await branch.set('user/nickname', async () => {
  const res = await fetch('...')
  const nickname = await res.text()
  return nickname
})
await branch.set('user/nickname/html', async () => {
  const nickname = await branch.ensure('user/nickname', async () => 'Anonymous')
  return (
    <div>{nickname.raw}</div>
  )
})


// Re-cache 'user', 'user/nickname', 'user/nickname/color'
await branch.cache('user')

const user = await branch.ensure('user').then(cache => cache.clone())

/**
 * {
 *   nickname: 'user-nickname',
 *   html: <div>user-nickname</div>
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

## Conceptualization

### Hierarchical Structure

**cachebranch** operates similarly to organizing files in directories. Just as deleting a directory removes its subdirectories and files, deleting a cache in **cachebranch** also removes its sub-level caches.

For example, if you delete the **'user'** cache, the sub-level cache **'user/age'** will also be deleted. Keep this structure in mind when setting keys. There is no limit to the depth of hierarchy, so you can have structures as deep as **'user/1/2/3/4/5/6...'** and beyond.

### Cache Creation Function

In the **cachebranch** function that creates the cache, you should not directly assign values to the keys. Instead, you must pass a function that returns the value.

```typescript
branch.set('user/age', () => 21)
```

Now when a situation arises where you need to re-cache due to dependency issues, the library will automatically help modify the value by recalling the corresponding function.

### Cache Update Following Hierarchical Structure

You may want to update all cached content related to **'user'**. Try using it like this:

```typescript
branch.cache('user')
```

This code will update not only **'user'**, but also caches in the lower hierarchy such as **'user/age'**, **'user/nickname'**, etc. If you only want to update **'user'**, pass **false** as the second argument.

```typescript
const recursive = false
branch.cache('user', recursive)
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

## License

MIT license
