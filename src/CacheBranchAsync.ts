import type { NullableCacheDataGeneratorAsync, CacheDataGeneratorAsync, CacheDirection } from './types'
import { CacheBranch } from './base/CacheBranch'
import { CacheDataAsync } from './CacheDataAsync'

export class CacheBranchAsync<T = any> extends CacheBranch<T> {
  declare protected readonly data: CacheDataAsync<T>
  declare protected readonly branches: Map<string, CacheBranchAsync<T>>
  protected readonly root: CacheBranchAsync<T>

  constructor(
    generator: NullableCacheDataGeneratorAsync<T> = CacheDataAsync.EmptyDataGenerator,
    root?: CacheBranchAsync<T>
  ) {
    super(new CacheDataAsync(generator))
    this.root = root ?? this
  }

  protected ensureBranch(
    key: string,
    generator: NullableCacheDataGeneratorAsync<T>
  ): CacheBranchAsync<T> {
    return this.to(key, (b, k) => {
      const branch = b as CacheBranchAsync<T>
      if (!branch.branches.has(k)) {
        branch.branches.set(k, new CacheBranchAsync<T>(generator, this.root))
      }
      return branch.branches.get(k)!
    }) as CacheBranchAsync<T>
  }

  protected getBranch(key: string): CacheBranchAsync<T>|undefined {
    return this.to(key, (b, k) => {
      const branch = b as CacheBranchAsync<T>
      if (!branch.branches.has(k)) {
        return null
      }
      return branch.branches.get(k)!
    }) as CacheBranchAsync<T>
  }

  async cache(key: string, recursive?: CacheDirection): Promise<this> {
    const branch = this.ensureBranch(key, CacheDataAsync.EmptyDataGenerator)
    if (!branch) {
      return this
    }
    if (recursive === 'bottom-up') {
      for (const key of branch.branches.keys()) {
        await branch.cache(key, recursive)
      }
    }
    await CacheDataAsync.Cache(this.root, branch.data)
    if (recursive === 'top-down') {
      for (const key of branch.branches.keys()) {
        await branch.cache(key, recursive)
      }
    }
    return this
  }

  async ensure(key: string, generator: CacheDataGeneratorAsync<T>): Promise<CacheDataAsync<T>> {
    const branch = this.ensureBranch(key, CacheDataAsync.EmptyDataGenerator)
    if (!CacheDataAsync.IsDirty(branch.data)) {
      await CacheDataAsync.Update(this.root, branch.data, generator)
    }
    return branch.data
  }

  get(key: string): CacheDataAsync<T>|undefined {
    const branch = this.ensureBranch(key, CacheDataAsync.EmptyDataGenerator)
    if (!CacheDataAsync.IsDirty(branch.data)) {
      return undefined
    }
    return branch.data
  }

  async set(key: string, generator: CacheDataGeneratorAsync<T>): Promise<this> {
    const branch = this.ensureBranch(key, CacheDataAsync.EmptyDataGenerator)
    await CacheDataAsync.Update(this.root, branch.data, generator)
    return this
  }

  async delete(key: string): Promise<this> {
    const branch = this.ensureBranch(key, CacheDataAsync.EmptyDataGenerator)
    if (branch) {
      branch.branches.clear()
      await CacheDataAsync.Update(this.root, branch.data, CacheDataAsync.EmptyDataGenerator)
      CacheDataAsync.SetDirty(branch.data, false)
    }
    return this
  }
}