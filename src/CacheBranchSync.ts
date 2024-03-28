import type { NullableCacheDataGeneratorSync, CacheDataGeneratorSync, CacheDirection } from './types'
import { CacheBranch } from './base/CacheBranch'
import { CacheDataSync } from './CacheDataSync'

export class CacheBranchSync<
  T extends Record<string, any> = Record<string, any>
> extends CacheBranch<T> {
  declare protected readonly data: CacheDataSync<T, keyof T>
  declare protected readonly branches: Map<string, CacheBranchSync<T>>
  protected readonly root: CacheBranchSync<T>

  constructor(
    generator: NullableCacheDataGeneratorSync<T, keyof T> = CacheDataSync.EmptyDataGenerator,
    root?: CacheBranchSync<T>
  ) {
    super(new CacheDataSync(generator))
    this.root = root ?? this
  }

  protected ensureBranch<K extends keyof T>(
    key: K,
    generator: NullableCacheDataGeneratorSync<T, K>
  ): CacheBranchSync<T> {
    return this.to(key, (b, k) => {
      const branch = b as CacheBranchSync<T>
      if (!branch.branches.has(k)) {
        branch.branches.set(k, new CacheBranchSync<T>(generator, this.root))
      }
      return branch.branches.get(k)!
    }) as CacheBranchSync<T>
  }

  protected getBranch<K extends keyof T>(key: K): CacheBranchSync<T>|undefined {
    return this.to(key, (b, k) => {
      const branch = b as CacheBranchSync<T>
      if (!branch.branches.has(k)) {
        return null
      }
      return branch.branches.get(k)!
    }) as CacheBranchSync<T>
  }

  cache(key: keyof T, recursive?: CacheDirection): this {
    const branch = this.ensureBranch(key, CacheDataSync.EmptyDataGenerator)
    if (!branch) {
      return this
    }
    if (recursive === 'bottom-up') {
      for (const key of branch.branches.keys()) {
        branch.cache(key, recursive)
      }
    }
    CacheDataSync.Cache(this.root, branch.data)
    if (recursive === 'top-down') {
      for (const key of branch.branches.keys()) {
        branch.cache(key, recursive)
      }
    }
    return this
  }

  ensure<K extends keyof T>(
    key: K,
    generator: CacheDataGeneratorSync<T, K>
  ): CacheDataSync<T, K> {
    const branch = this.ensureBranch(key, CacheDataSync.EmptyDataGenerator)
    if (!CacheDataSync.IsDirty(branch.data)) {
      CacheDataSync.Update(this.root, branch.data, generator)
    }
    return branch.data as unknown as CacheDataSync<T, K>
  }

  get<K extends keyof T>(key: K): CacheDataSync<T, K>|undefined {
    const branch = this.ensureBranch(key, CacheDataSync.EmptyDataGenerator)
    if (!CacheDataSync.IsDirty(branch.data)) {
      return undefined
    }
    return branch.data as unknown as CacheDataSync<T, K>|undefined
  }

  set<K extends keyof T>(
    key: K,
    generator: CacheDataGeneratorSync<T, K>
  ): this {
    const branch = this.ensureBranch(key, CacheDataSync.EmptyDataGenerator)
    CacheDataSync.Update(this.root, branch.data, generator)
    return this
  }

  delete(key: keyof T): this {
    const branch = this.ensureBranch(key, CacheDataSync.EmptyDataGenerator)
    if (branch) {
      branch.branches.clear()
      CacheDataSync.Update(this.root, branch.data, CacheDataSync.EmptyDataGenerator)
      CacheDataSync.SetDirty(branch.data, false)
    }
    return this
  }
}