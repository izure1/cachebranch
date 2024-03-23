# cachebranch

캐시를 계층 구조로 분리하여 관리하세요. 이는 디렉토리에 파일을 저장하는 개념과 비슷합니다!
비동기와 동기 모두 지원합니다.

```tsx
import { CacheBranchAsync } from 'cachebranch'

const branch = new CacheBranchAsync()

// Set cache
await branch.set('user', async () => {
  const nickname = await branch.ensure('user/nickname', async () => 'Anonymous')
  const html = await branch.ensure('user/nickname/html', async () => <div>Loading...</div>)
  return {
    nickname: nickname.raw,
    html: html.raw,
  }
})
await branch.set('user/nickname', async () => {
  const res = await fetch('...')
  const nickname = await res.text()
  return nickname
})
await branch.set('user/nickname/html', async () => {
  const nickname = await branch.ensure('user/nickname', async () => 'Anonymous')
  return (
    <div>{nickname.raw}</div>
  )
})


// Re-cache 'user', 'user/nickname', 'user/nickname/color'
await branch.cache('user')

const user = await branch.ensure('user').then(cache => cache.clone())

/**
 * {
 *   nickname: 'user-nickname',
 *   html: <div>user-nickname</div>
 * }
 * 
 */
console.log(user) 
```

## 왜 사용해야 하나요?

애플리케이션 개발을 하다보면, 성능을 위해 값을 캐시해야하는 상황이 옵니다. 그리고 캐시된 값은 다른 캐시된 값을 참조하여 종속성을 가지는 경우가 종종 있습니다.

이 경우, cachebranch 라이브러리가 당신을 도와줄 수 있습니다.

## 어떻게 동작하나요?

캐시 간의 종속성 문제를 해결하기 위해, cachebranch는 캐시를 계층 구조로 나누어 관리합니다.
가령 user 캐시가 age 캐시를 이용하고 있다면, 각각 user, user/age 키로 캐시를 생성하면 됩니다.

이 경우, user을 재캐싱한다면 user/age는 하위 계층이므로, 다시 캐시됩니다.
이러한 구조는 종속성 문제를 빠르게 해결할 수 있도록 도와줍니다.

## 개념화

### 계층 구조

cachebranch는 디렉토리에 파일을 보관하는 것과 비슷합니다. 디렉토리가 삭제되면 하위 디렉토리 및 파일이 삭제되듯이, cachebranch 역시 캐시를 삭제하면, 하위 계층의 캐시 또한 삭제됩니다.

가령 user 캐시를 삭제하면, 하위 계층인 user/age 캐시도 함께 삭제됩니다. 이러한 구조를 염두하고 키값을 설정하십시오. 계층에는 제한이 없습니다. 따라서 user/1/2/3/4/5/6... 와 같이 얼마든지 깊은 구조를 가질 수 있게 됩니다.

### 캐시 생성 함수

cachebranch에서는 캐시를 생성할 때, 키에 값을 직접 지정하지 않으며, 값을 반환하는 함수를 전달해야 합니다.

```typescript
branch.set('user/age', () => 21)
```

이제 종속성 문제로 인해 새롭게 리캐싱을 해야할 상황이 올 때, 라이브러리가 해당 함수를 재호출하여 자동으로 값을 수정하도록 도와줍니다.

### 캐시된 값의 오염 방지

이런 캐시값은 원시타입만 있는 것이 아닙니다. 객체일수도, 배열일수도 있습니다. 캐시된 값은 신뢰성을 위해 값이 수정되면 안되지만, 개발자의 실수로 더럽혀질 수도 있습니다. 아래 예시를 보십시오.

```typescript
const user = branch.get('user').raw

user.name = 'test' // 오류! 값을 오염시켜선 안됩니다!
```

이건 값이 얕은 복사를 하기 때문에 생겨나는 일입니다. 이러한 문제를 해결하기 위해, cachebranch는 clone 메서드를 지원합니다. 이 메서드는 값을 깊은 복사하여 반환합니다. 아래와 같이 사용할 수 있습니다.

```typescript
const user = branch.get('user').clone()

user.name = 'test' // 깊은 복사가 된 객체이므로, 캐시된 값을 수정하지 않습니다.
```

## 사용하기

```bash
npm i cachebranch
```

```typescript
import { CacheBranchSync, CacheBranchAsync } from 'cachebranch'
```

## 라이선스

MIT 라이선스를 따릅니다.
