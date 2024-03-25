import type { NullableCacheDataGeneratorAsync } from './types'
import { CacheData } from './base/CacheData'
import { CacheBranchAsync } from './CacheBranchAsync'

export class CacheDataAsync<T> extends CacheData<T> {
  static readonly EmptyDataGenerator = async () => undefined

  static async Update<T>(
    branch: CacheBranchAsync<T>,
    data: CacheDataAsync<T>,
    generator: NullableCacheDataGeneratorAsync<T>
  ): Promise<CacheDataAsync<T>> {
    data._raw = await generator(branch)
    data.generator = generator
    data.dirty = true
    return data
  }

  static async Cache<T>(branch: CacheBranchAsync<T>, data: CacheDataAsync<T>): Promise<CacheDataAsync<T>> {
    data._raw = await data.generator(branch)
    return data
  }

  declare protected generator: NullableCacheDataGeneratorAsync<T>
}

