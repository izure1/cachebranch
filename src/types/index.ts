export type NullableCacheDataGeneratorSync<T> = () => T|undefined
export type NullableCacheDataGeneratorAsync<T> = () => Promise<T|undefined>
export type NullableCacheDataGenerator<T> = NullableCacheDataGeneratorSync<T>|NullableCacheDataGeneratorAsync<T>
export type CacheDataGeneratorSync<T> = () => T
export type CacheDataGeneratorAsync<T> = () => Promise<T>
export type CacheDataCopy<T> = (raw: T) => T
export type CacheDataGenerator<T> = CacheDataGeneratorSync<T>|CacheDataGeneratorAsync<T>
export type CacheDirection = 'top-down'|'bottom-up'
export type Deferred<T> = T|Promise<T>
