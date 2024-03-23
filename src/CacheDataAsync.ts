import type { NullableCacheDataGeneratorAsync } from './types'
import { CacheData } from './base/CacheData'

export class CacheDataAsync<T> extends CacheData<T> {
  static readonly EmptyDataGenerator = async () => undefined

  static async Update<T>(
    data: CacheDataAsync<T>,
    generator: NullableCacheDataGeneratorAsync<T>
  ): Promise<CacheDataAsync<T>> {
    data._raw = await generator()
    data.generator = generator
    data.dirty = true
    return data
  }

  static async Cache<T>(data: CacheDataAsync<T>): Promise<CacheDataAsync<T>> {
    data._raw = await data.generator()
    return data
  }
}

