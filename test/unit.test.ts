import { CacheBranchSync, CacheBranchAsync } from '../'

function delay(duration: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, duration))
}

describe('unit-test', () => {
  let branch: CacheBranchSync<{
    '1': number
    '1/1': number
  }>
  beforeEach(() => {
    branch = new CacheBranchSync()
  })

  test('ensure', () => {
    expect(branch.get('1')).toBe(undefined)
    expect(branch.ensure('1', () => 1).raw).toBe(1)
    expect(branch.ensure('1', () => 2).raw).toBe(1)
  })

  test('get', () => {
    expect(branch.get('1')).toBe(undefined)
    
    branch.ensure('1', () => 1)
    expect(branch.get('1')!.raw).toBe(1) 
  })

  test('set', () => {
    expect(branch.get('1')).toBe(undefined)
    expect(branch.ensure('1', () => 1).raw).toBe(1)
    expect(branch.set('1', () => 2).get('1')!.raw).toBe(2)
  })

  test('delete', () => {
    expect(branch.get('1')).toBe(undefined)
    expect(branch.ensure('1', () => 1).raw).toBe(1)
    branch.delete('1')
    expect(branch.get('1')).toBe(undefined)

    expect(branch.ensure('1/1', () => 2).raw).toBe(2)
    expect(branch.get('1/1')!.raw).toBe(2)
    expect(branch.get('1')).toBe(undefined)
    branch.delete('1')
    expect(branch.get('1/1')).toBe(undefined)
  })

  test('clone', () => {
    const branch = new CacheBranchSync<any>()
    expect(branch.get('data')).toBe(undefined)

    expect(
      branch.ensure('data', () => ({ test: 1 })).raw === 
      branch.ensure('data', () => ({ test: 1 })).clone()
    ).toBe(false)
  })
})

describe('branch-unit-test', () => {
  let branch: CacheBranchSync<{
    'user': undefined
    'user/name': string
    'user/name/first': string
  }>
  beforeEach(() => {
    branch = new CacheBranchSync()
  })
  
  test('ensure', () => {
    expect(branch.get('user')).toBe(undefined)
    expect(branch.ensure('user/name', () => 'john').raw).toBe('john')
    expect(branch.get('user')).toBe(undefined)
    expect(branch.get('user/name')!.raw).toBe('john')
  })
  
  test('set', () => {
    expect(branch.get('user')).toBe(undefined)
    expect(branch.ensure('user/name', () => 'john').raw).toBe('john')
    expect(branch.set('user/name', () => 'lee').get('user/name')!.raw).toBe('lee')
  })

  test('delete', () => {
    expect(branch.get('user')).toBe(undefined)
    expect(branch.ensure('user/name', () => 'john').raw).toBe('john')
    expect(branch.set('user/name', () => 'lee').get('user/name')!.raw).toBe('lee')
    expect(branch.set('user/name/first', () => 'kim').get('user/name/first')!.raw).toBe('kim')

    branch.delete('user/name')
    expect(branch.get('user/name')).toBe(undefined)
    expect(branch.get('user/name/first')).toBe(undefined)
  })

  test('caching', () => {
    const branch = new CacheBranchSync<{
      'count': number
      'count/+1': number
      'count/+1/+1': number
    }>()

    let count = 0
    branch.set('count', (b) => b.ensure('count/+1', () => 0).raw+1)
    branch.set('count/+1', (b) => b.ensure('count/+1/+1', () => 0).raw+1)
    branch.set('count/+1/+1', () => count)
    branch.cache('count', 'bottom-up')

    expect(branch.get('count')!.raw).toBe(2)
    expect(branch.get('count/+1')!.raw).toBe(1)
    expect(branch.get('count/+1/+1')!.raw).toBe(0)

    count++
    branch.cache('count', 'bottom-up')

    expect(branch.get('count')!.raw).toBe(3)
    expect(branch.get('count/+1')!.raw).toBe(2)
    expect(branch.get('count/+1/+1')!.raw).toBe(1)
  })

  test('branch', () => {
    expect(branch.get('user/name/first')).toBe(undefined)
    expect(branch.get('user/name')).toBe(undefined)
    expect(branch.ensure('user/name/first', () => 'lee').raw).toBe('lee')
    expect(branch.get('user/name')).toBe(undefined)
  })
})


describe('unit-test:async', () => {
  let branch: CacheBranchAsync<{
    '1': number
    '1/1': number
  }>
  beforeEach(() => {
    branch = new CacheBranchAsync()
  })

  test('ensure', async () => {
    expect(branch.get('1')).toBe(undefined)
    expect((await branch.ensure('1', async () => 1)).raw).toBe(1)
    expect((await branch.ensure('1', async () => 2)).raw).toBe(1)
  })

  test('get', async () => {
    expect(branch.get('1')).toBe(undefined)
    
    await branch.ensure('1', async () => 1)
    expect((branch.get('1'))!.raw).toBe(1) 
  })

  test('set', async () => {
    expect(branch.get('1')).toBe(undefined)
    expect((await branch.ensure('1', async () => 1)).raw).toBe(1)
    expect((await branch.set('1', async () => 2)).get('1')!.raw).toBe(2)
  })

  test('delete', async () => {
    expect(branch.get('1')).toBe(undefined)
    expect((await branch.ensure('1', async () => 1)).raw).toBe(1)
    await branch.delete('1')
    expect(branch.get('1')).toBe(undefined)

    expect((await branch.ensure('1/1', async () => 2)).raw).toBe(2)
    expect(branch.get('1/1')!.raw).toBe(2)
    expect(branch.get('1')).toBe(undefined)
    await branch.delete('1')
    expect(branch.get('1/1')).toBe(undefined)
  })

  test('clone', async () => {
    const branch = new CacheBranchAsync<{
      data: { test: number }
    }>()
    expect(branch.get('data')).toBe(undefined)

    expect(
      (await branch.ensure('data', async () => ({ test: 1 }))).raw === 
      (await branch.ensure('data', async () => ({ test: 1 }))).clone()
    ).toBe(false)
  })
})

describe('branch-unit-test:async', () => {
  let branch: CacheBranchAsync<{
    'user': undefined
    'user/name': string
    'user/name/first': string
  }>
  beforeEach(() => {
    branch = new CacheBranchAsync()
  })
  
  test('ensure', async () => {
    expect(branch.get('user')).toBe(undefined)
    expect((await branch.ensure('user/name', async () => 'john')).raw).toBe('john')
    expect(branch.get('user')).toBe(undefined)
    expect(branch.get('user/name')!.raw).toBe('john')
  })
  
  test('set', async () => {
    expect(branch.get('user')).toBe(undefined)
    expect((await branch.ensure('user/name', async () => 'john')).raw).toBe('john')
    expect((await branch.set('user/name', async () => 'lee')).get('user/name')!.raw).toBe('lee')
  })

  test('delete', async () => {
    expect(branch.get('user')).toBe(undefined)
    expect((await branch.ensure('user/name', async () => 'john')).raw).toBe('john')
    expect((await branch.set('user/name', async () => 'lee')).get('user/name')!.raw).toBe('lee')
    expect((await branch.set('user/name/first', async () => 'kim')).get('user/name/first')!.raw).toBe('kim')

    await branch.delete('user/name')
    expect(branch.get('user/name')).toBe(undefined)
    expect(branch.get('user/name/first')).toBe(undefined)
  })

  test('caching', async () => {
    const branch = new CacheBranchAsync<{
      'count': number
      'count/+1': number
      'count/+1/+1': number
    }>()

    let count = 0
    await branch.set('count', (b) => b.ensure('count/+1', async () => 0).then(c => c.raw+1))
    await branch.set('count/+1', (b) => b.ensure('count/+1/+1', async () => 0).then(c => c.raw+1))
    await branch.set('count/+1/+1', async () => count)
    await branch.cache('count', 'bottom-up')

    expect(branch.get('count')!.raw).toBe(2)
    expect(branch.get('count/+1')!.raw).toBe(1)
    expect(branch.get('count/+1/+1')!.raw).toBe(0)

    count++
    await delay(1000)
    await branch.cache('count', 'bottom-up')

    expect(branch.get('count')!.raw).toBe(3)
    expect(branch.get('count/+1')!.raw).toBe(2)
    expect(branch.get('count/+1/+1')!.raw).toBe(1)
  })

  test('branch', async () => {
    expect(branch.get('user/name/first')).toBe(undefined)
    expect(branch.get('user/name')).toBe(undefined)
    expect((await branch.ensure('user/name/first', async () => 'lee')).raw).toBe('lee')
    expect(branch.get('user/name')).toBe(undefined)
  })
})
