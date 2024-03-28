import type { NullableCacheDataGeneratorSync } from './types'
import { CacheData } from './base/CacheData'
import { CacheBranchSync } from './CacheBranchSync'

export class CacheDataSync<
  T extends Record<string, any>,
  K extends keyof T
> extends CacheData<T, K> {
  static readonly EmptyDataGenerator = () => undefined

  static Update<
    T extends Record<string, any>,
    K extends keyof T
  >(
    branch: CacheBranchSync<T>,
    data: CacheDataSync<T, K>,
    generator: NullableCacheDataGeneratorSync<T, K>
  ): CacheDataSync<T, K> {
    data._raw = generator(branch)
    data.generator = generator
    data.dirty = true
    return data
  }

  static Cache<
    T extends Record<string, any>,
    K extends keyof T
  >(
    branch: CacheBranchSync<T>,
    data: CacheDataSync<T, K>
  ): CacheDataSync<T, K> {
    data._raw = data.generator(branch)
    return data
  }

  declare protected generator: NullableCacheDataGeneratorSync<T, keyof T>
}
