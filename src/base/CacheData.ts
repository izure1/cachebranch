import type { NullableCacheDataGenerator, CacheDataCopy } from '../types'
import ungapStructuredClone from '@ungap/structured-clone'

export type CacheDataCloneStrategy = 'array-shallow-copy'|'object-shallow-copy'|'deep-copy'

export abstract class CacheData<T extends Record<string, any>, K extends keyof T> {
  static IsDirty<
    T extends Record<string, any>,
    K extends keyof T
  >(data: CacheData<T, K>): boolean {
    return data.dirty
  }

  static SetDirty<
    T extends Record<string, any>,
    K extends keyof T
  >(data: CacheData<T, K>, value: boolean): CacheData<T, K> {
    data.dirty = value
    return data
  }

  protected static readonly StructuredClone = globalThis.structuredClone ?? ungapStructuredClone

  protected _raw: ReturnType<NullableCacheDataGenerator<T, keyof T>>
  protected generator: NullableCacheDataGenerator<T, keyof T>
  protected dirty: boolean

  constructor(generator: NullableCacheDataGenerator<T, keyof T>) {
    this._raw = undefined
    this.dirty = false
    this.generator = generator
  }

  /**
   * This is cached data.
   * It was generated at the time of caching, so there is a risk of modification if it's an object due to shallow copying.
   * Therefore, if it's not a primitive type, please avoid using this value directly and use the `clone` method to use a copied version of the data.
   */
  get raw(): T[K] {
    if (!this.dirty) {
      throw new Error(`The data is not initialized and cannot be accessed. Please use the 'ensure' or 'set' method to create the data first.`)
    }
    return this._raw! as T[K]
  }

  /**
   * The method returns a copied value of the cached data.
   * You can pass a function as a parameter to copy the value. This parameter function should return the copied value.
   * 
   * If no parameter is passed, it defaults to using Javascript's or \@ungap/structured-clone's `structuredClone` function to copy the value.
   * If you prefer shallow copying instead of deep copying,
   * you can use the default options `array-shallow-copy`, `object-shallow-copy` and `deep-copy`,
   * which are replaced with functions to shallow copy arrays and objects, respectively. This is a syntactic sugar.
   * @param strategy The function that returns the copied value.
   * If you want to perform a shallow copy, simply pass the strings `array-shallow-copy` or `object-shallow-copy` for easy use.
   * The default is `structuredClone`.
   */
  clone(strategy: CacheDataCloneStrategy|CacheDataCopy<T, K> = 'deep-copy'): T[K] {
    if (strategy && typeof strategy !== 'string') {
      return strategy(this.raw)
    }
    switch (strategy) {
      case 'array-shallow-copy':
        return <T[K]>[].concat(this.raw as any)
      case 'object-shallow-copy':
        return Object.assign({}, this.raw)
      case 'deep-copy':
      default:
        return CacheData.StructuredClone(this.raw)
    }
  }
}

