import type { NullableCacheDataGeneratorAsync } from './types'
import { CacheData } from './base/CacheData'
import { CacheBranchAsync } from './CacheBranchAsync'

export class CacheDataAsync<
  T extends Record<string, any>,
  K extends keyof T
> extends CacheData<T, K> {
  static readonly EmptyDataGenerator = async () => undefined

  static async Update<
    T extends Record<string, any>,
    K extends keyof T
  >(
      branch: CacheBranchAsync<T>,
      data: CacheDataAsync<T, K>,
      generator: NullableCacheDataGeneratorAsync<T, K>
    ): Promise<CacheDataAsync<T, K>> {
    data._raw = await generator(branch)
    data.generator = generator
    data.dirty = true
    return data
  }

  static async Cache<
    T extends Record<string, any>,
    K extends keyof T
  >(
    branch: CacheBranchAsync<T>,
    data: CacheDataAsync<T, K>
  ): Promise<CacheDataAsync<T, K>> {
    data._raw = await data.generator(branch)
    return data
  }

  declare protected generator: NullableCacheDataGeneratorAsync<T, K>
}
