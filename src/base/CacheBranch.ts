import type { NullableCacheDataGenerator, CacheDataGenerator, Deferred, CacheDirection } from '../types'
import { CacheData } from './CacheData'

export abstract class CacheBranch<T> {
  protected abstract readonly root: CacheBranch<T>
  protected readonly data: CacheData<T>
  protected readonly branches: Map<string, CacheBranch<T>>

  constructor(data: CacheData<T>) {
    this.data = data
    this.branches = new Map()
  }

  /**
   * The method splits the provided key value into tokens and returns them as an array.
   * For instance, if you pass `'user/name/middle'` as the parameter, it will return `['user', 'name', 'middle']` as the split values.
   * @param key The key value to split.
   */
  protected tokens(key: string): string[] {
    return key.split('/')
  }

  protected to(
    key: string,
    getNextBranch: (
      branch: CacheBranch<T>,
      key: string,
      index: number,
      last: boolean
    ) => CacheBranch<T>|null
  ): CacheBranch<T>|undefined {
    const tokens = this.tokens(key)
    let current: CacheBranch<T> = this
    for (let i = 0, len = tokens.length; i < len; i++) {
      const last = i === len - 1
      const key = tokens[i]
      const next = getNextBranch(current, key, i, last)
      if (next === null) {
        return undefined
      }
      current = next
    }
    return current
  }

  /**
   * The method splits the provided key into tokens and traverses the cache's sub-layers according to these tokens.
   * If any intermediate layer is not yet created, it creates them and continues the traversal.
   * 
   * For example, if `'user/name/middle'` is passed as the parameter and `'user'` exists but `'name'` and its sub-layer `'middle'` do not,
   * it creates both and returns the structure.
   * @param key The key value to structure.
   * @param generator The default cache value creation function to be used for each layer.
   * This function is used to initialize cache values for automatically generated layers.
   * However, until a value is specified using the `ensure` or set method,
   * this value remains uninitialized and inaccessible to the user.
   */
  protected abstract ensureBranch(
    key: string,
    generator: NullableCacheDataGenerator<T>
  ): CacheBranch<T>

  /**
   * The method splits the provided key into tokens and traverses the cache's sub-layers according to these tokens.
   * If any intermediate layer is not yet created, it returns `undefined`.
   * @param key The key value to structure.
   */
  protected abstract getBranch(key: string): CacheBranch<T>|undefined

  /**
   * The method re-caches the hierarchical cache data for the given key.
   * It re-executes the function passed when creating the layer to update the cached value.
   * @param key The key value of the hierarchy to be re-cached.
   * @param recursive You can specify the caching order as either `'top-down'` or `'bottom-up'`.
   * 
   * If `'top-down'` is passed as the value, the current layer is cached first, followed by caching of the sub-layers.  
   * For example, if there are `'user'` and `'user/age'` layers, `'user'` will be cached first, followed by `'user/age'`.
   * 
   * If `'bottom-up'` is passed, sub-layers are cached first, followed by caching of the parent layers.
   * 
   * If this parameter is not specified, only the current layer is cached.
   */
  abstract cache(key: string, recursive?: CacheDirection): Deferred<this>

  /**
   * If there is no cache generated for the specified key value, it creates one; otherwise, it returns the existing cache data.
   * @param key The key value for which to create or retrieve the cache.
   * @param generator The cache creation function.
   * If there is no cache, it calls this function and stores the returned value as the cache.
   */
  abstract ensure(key: string, generator: CacheDataGenerator<T>): Deferred<CacheData<T>>

  /**
   * It retrieves the cache for the specified key value. If the cache does not exist, it returns `undefined`.
   * @param key The key value for which to retrieve the cache.
   */
  abstract get(key: string): Deferred<CacheData<T>|undefined>

  /**
   * It reassigns the cache for the specified key value.
   * You can pass a cache creation function to update the existing cache or create a new one.
   * @param key The key value for which to reassign the cache.
   * @param generator This is the cache creation function. It is called to obtain a value that will be stored as the cache.
   */
  abstract set(key: string, generator: CacheDataGenerator<T>): Deferred<this>

  /**
   * This deletes the cache associated with the specified key.
   * Please note that caches of sub-levels under the key will also be deleted.
   * For example, if there is a hierarchy like `'user/name/middle'`, deleting `'user/name'` will also remove the sub-level `'user/name/middle'`.
   * @param key The key value to delete.
   */
  abstract delete(key: string): Deferred<this>
}
