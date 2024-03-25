import type { NullableCacheDataGeneratorSync, CacheDataGeneratorSync, CacheDirection } from './types'
import { CacheBranch } from './base/CacheBranch'
import { CacheDataSync } from './CacheDataSync'

export class CacheBranchSync<T = any> extends CacheBranch<T> {
  declare protected readonly data: CacheDataSync<T>
  declare protected readonly branches: Map<string, CacheBranchSync<T>>
  protected readonly root: CacheBranchSync<T>

  constructor(
    generator: NullableCacheDataGeneratorSync<T> = CacheDataSync.EmptyDataGenerator,
    root?: CacheBranchSync<T>
  ) {
    super(new CacheDataSync(generator))
    this.root = root ?? this
  }

  protected ensureBranch(
    key: string,
    generator: NullableCacheDataGeneratorSync<T>
  ): CacheBranchSync<T> {
    return this.to(key, (b, k) => {
      const branch = b as CacheBranchSync<T>
      if (!branch.branches.has(k)) {
        branch.branches.set(k, new CacheBranchSync<T>(generator, this.root))
      }
      return branch.branches.get(k)!
    }) as CacheBranchSync<T>
  }

  protected getBranch(key: string): CacheBranchSync<T>|undefined {
    return this.to(key, (b, k) => {
      const branch = b as CacheBranchSync<T>
      if (!branch.branches.has(k)) {
        return null
      }
      return branch.branches.get(k)!
    }) as CacheBranchSync<T>
  }

  cache(key: string, recursive?: CacheDirection): this {
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

  ensure(key: string, generator: CacheDataGeneratorSync<T>): CacheDataSync<T> {
    const branch = this.ensureBranch(key, CacheDataSync.EmptyDataGenerator)
    if (!CacheDataSync.IsDirty(branch.data)) {
      CacheDataSync.Update(this.root, branch.data, generator)
    }
    return branch.data
  }

  get(key: string): CacheDataSync<T>|undefined {
    const branch = this.ensureBranch(key, CacheDataSync.EmptyDataGenerator)
    if (!CacheDataSync.IsDirty(branch.data)) {
      return undefined
    }
    return branch.data
  }

  set(key: string, generator: CacheDataGeneratorSync<T>): this {
    const branch = this.ensureBranch(key, CacheDataSync.EmptyDataGenerator)
    CacheDataSync.Update(this.root, branch.data, generator)
    return this
  }

  delete(key: string): this {
    const branch = this.ensureBranch(key, CacheDataSync.EmptyDataGenerator)
    if (branch) {
      branch.branches.clear()
      CacheDataSync.Update(this.root, branch.data, CacheDataSync.EmptyDataGenerator)
      CacheDataSync.SetDirty(branch.data, false)
    }
    return this
  }
}