import type { NullableCacheDataGeneratorAsync, CacheDataGeneratorAsync, CacheDirection } from './types'
import { CacheBranch } from './base/CacheBranch'
import { CacheDataAsync } from './CacheDataAsync'

export class CacheBranchAsync<T> extends CacheBranch<T> {
  declare protected readonly data: CacheDataAsync<T>
  declare protected readonly branches: Map<string, CacheBranchAsync<T>>

  constructor(
    generator: NullableCacheDataGeneratorAsync<T> = CacheDataAsync.EmptyDataGenerator
  ) {
    super(new CacheDataAsync(generator))
  }

  protected ensureBranch(
    key: string,
    generator: NullableCacheDataGeneratorAsync<T>
  ): CacheBranchAsync<T> {
    return this.to(key, (b, k) => {
      const branch = b as CacheBranchAsync<T>
      if (!branch.branches.has(k)) {
        branch.branches.set(k, new CacheBranchAsync<T>(generator))
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
    const root = this.getBranch(key)
    if (!root) {
      return this
    }
    if (recursive === 'bottom-up') {
      for (const key of root.branches.keys()) {
        await root.cache(key, recursive)
      }
    }
    await CacheDataAsync.Cache(root.data)
    if (recursive === 'top-down') {
      for (const key of root.branches.keys()) {
        await root.cache(key, recursive)
      }
    }
    return this
  }

  async ensure(key: string, generator: CacheDataGeneratorAsync<T>): Promise<CacheDataAsync<T>> {
    const branch = this.ensureBranch(key, CacheDataAsync.EmptyDataGenerator)
    if (!CacheDataAsync.IsDirty(branch.data)) {
      await CacheDataAsync.Update(branch.data, generator)
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
    await CacheDataAsync.Update(branch.data, generator)
    return this
  }

  async delete(key: string): Promise<this> {
    const branch = this.getBranch(key)
    if (branch) {
      branch.branches.clear()
      await CacheDataAsync.Update(branch.data, CacheDataAsync.EmptyDataGenerator)
      CacheDataAsync.SetDirty(branch.data)
    }
    return this
  }
}