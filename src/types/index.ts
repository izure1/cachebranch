import { CacheBranchAsync } from '../CacheBranchAsync'
import { CacheBranchSync } from '../CacheBranchSync'

export type NullableCacheDataGeneratorAsync<
  T extends Record<string, any>,
  K extends keyof T
> = (branch: CacheBranchAsync<T>) => Promise<T[K]|undefined>
export type NullableCacheDataGeneratorSync<
  T extends Record<string, any>,
  K extends keyof T
> = (branch: CacheBranchSync<T>) => T[K]|undefined
export type NullableCacheDataGenerator<
  T extends Record<string, any>,
  K extends keyof T
> = NullableCacheDataGeneratorSync<T, K>|NullableCacheDataGeneratorAsync<T, K>
export type CacheDataGeneratorAsync<
  T extends Record<string, any>,
  K extends keyof T
> = (branch: CacheBranchAsync<T>) => Promise<T[K]>
export type CacheDataGeneratorSync<
  T extends Record<string, any>,
  K extends keyof T
> = (branch: CacheBranchSync<T>) => T[K]
export type CacheDataGenerator<
  T extends Record<string, any>,
  K extends keyof T
> = CacheDataGeneratorSync<T, K>|CacheDataGeneratorAsync<T, K>
export type CacheDataCopy<
  T extends Record<string, any>,
  K extends keyof T
> = (raw: T[K]) => T[K]
export type CacheDirection = 'top-down'|'bottom-up'
export type Deferred<T> = T|Promise<T>
