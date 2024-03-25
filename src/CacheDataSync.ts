import type { NullableCacheDataGeneratorSync } from './types'
import { CacheData } from './base/CacheData'
import { CacheBranchSync } from './CacheBranchSync'

export class CacheDataSync<T> extends CacheData<T> {
  static readonly EmptyDataGenerator = () => undefined

  static Update<T>(
    branch: CacheBranchSync<T>,
    data: CacheDataSync<T>,
    generator: NullableCacheDataGeneratorSync<T>
  ): CacheDataSync<T> {
    data._raw = generator(branch)
    data.generator = generator
    data.dirty = true
    return data
  }

  static Cache<T>(branch: CacheBranchSync<T>, data: CacheDataSync<T>): CacheDataSync<T> {
    data._raw = data.generator(branch)
    return data
  }

  declare protected generator: NullableCacheDataGeneratorSync<T>
}

