# Frontend

CS Map의 화면, 탐색과 콘텐츠 표시 기능을 구현하는 React 애플리케이션이다.

## 실행

`frontend` 디렉터리에서 다음 순서로 실행한다.

1. `npm install`: 필요한 패키지 설치
2. `npm run dev`: 콘텐츠 생성 후 개발 서버 실행

배포 파일은 `npm run build`, 생성 결과 확인은 `npm run preview`를 사용한다. 콘텐츠 형식만 확인하려면 `npm run content:validate`를 실행한다.

## 주요 디렉터리

- `content`: Scene, Topic, Concept와 퀴즈
- `scripts`: YAML과 Markdown을 검증하고 실행용 콘텐츠를 생성하는 Node.js 도구
- `shared`: Content Build와 브라우저가 함께 사용하는 순수 타입과 Layout 계약
- `src`: 브라우저에서 실행되는 애플리케이션
  - `app`: Route, Provider와 애플리케이션 조립
  - `content`: 생성 콘텐츠를 조회하는 Repository와 생성 결과
  - `features/explorer`: Scene 렌더링, Layout, Camera와 탐색 상태
  - `features/explanation`: 설명 Markdown과 퀴즈 표시
  - `components/ui`: 여러 기능에서 재사용하는 기본 UI
  - `lib`: 특정 기능에 속하지 않는 작은 공통 함수
- `tests`: Content Build, Repository와 Layout의 회귀 테스트

## Scripts와 애플리케이션

`scripts`는 개발 서버나 배포 빌드가 시작되기 전에 Node.js에서 실행된다. Content Build는 작성 YAML을 Zod로 검증하고 Scene 관계, Route와 Layout을 계산한 뒤 Markdown과 퀴즈를 포함한 완성 데이터를 `src/content/generated/content-data.ts` 하나에 작성한다.

브라우저는 원본 YAML이나 Markdown을 다시 읽지 않는다. `content-repository.ts`가 생성된 정적 데이터를 기존 비동기 Repository API로 조회하고 Explorer와 Explanation 기능에 전달한다. 생성 파일은 직접 수정하지 않고 `npm run content:build`로 갱신한다.

의존 방향은 다음과 같다.

```text
scripts ──생성──> generated/content-data.ts
scripts ───────> shared
src ───────────> generated/content-data.ts ──> shared
src ───────────> shared
```

`scripts`와 `src`는 서로 가져오지 않는다. Zod Schema, YAML 파싱과 콘텐츠 정규화는 `scripts/content-build`에만 있고, `shared`에는 양쪽에서 사용하는 순수 타입·상수·함수만 둔다.

## 관련 문서

- [제품 요구사항](../docs/REQUIREMENTS.md)
- [아키텍처](../docs/ARCHITECTURE.md)
- [코드 작성 가이드](../docs/CODE_GUIDE.md)
- [콘텐츠 작성 가이드](../docs/CONTENT_GUIDE.md)
