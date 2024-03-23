import type { NullableCacheDataGeneratorSync } from './types'
import { CacheData } from './base/CacheData'

export class CacheDataSync<T> extends CacheData<T> {
  static readonly EmptyDataGenerator = () => undefined

  static Update<T>(
    data: CacheDataSync<T>,
    generator: NullableCacheDataGeneratorSync<T>
  ): CacheDataSync<T> {
    data._raw = generator()
    data.generator = generator
    data.dirty = true
    return data
  }

  static Cache<T>(data: CacheDataSync<T>): CacheDataSync<T> {
    data._raw = data.generator()
    return data
  }
}

