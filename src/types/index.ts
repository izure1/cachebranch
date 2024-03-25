import { CacheBranchAsync } from '../CacheBranchAsync'
import { CacheBranchSync } from '../CacheBranchSync'

export type NullableCacheDataGeneratorAsync<T> = (branch: CacheBranchAsync<T>) => Promise<T|undefined>
export type NullableCacheDataGeneratorSync<T> = (branch: CacheBranchSync<T>) => T|undefined
export type NullableCacheDataGenerator<T> = NullableCacheDataGeneratorSync<T>|NullableCacheDataGeneratorAsync<T>
export type CacheDataGeneratorAsync<T> = (branch: CacheBranchAsync<T>) => Promise<T>
export type CacheDataGeneratorSync<T> = (branch: CacheBranchSync<T>) => T
export type CacheDataGenerator<T> = CacheDataGeneratorSync<T>|CacheDataGeneratorAsync<T>
export type CacheDataCopy<T> = (raw: T) => T
export type CacheDirection = 'top-down'|'bottom-up'
export type Deferred<T> = T|Promise<T>
