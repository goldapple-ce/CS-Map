# Frontend

CS Map의 화면, 탐색과 콘텐츠 표시 기능을 구현하는 React 애플리케이션이다.

## 실행

`frontend` 디렉터리에서 다음 순서로 실행한다.

1. `npm install`: 필요한 패키지 설치
2. `npm run dev`: 콘텐츠 생성 후 개발 서버 실행

배포 파일은 `npm run build`, 생성 결과 확인은 `npm run preview`를 사용한다. 콘텐츠 형식만 확인하려면 `npm run content:validate`를 실행한다.

## 주요 디렉터리

- `content`: Scene, Topic, Concept와 퀴즈
- `scripts`: 콘텐츠를 검증하고 Layout과 Index를 생성하는 Node.js 도구
- `src`: 브라우저에서 실행되는 애플리케이션
  - `app`: Route, Provider와 애플리케이션 조립
  - `content`: 콘텐츠 타입, Schema, Repository와 생성된 Index
  - `features/explorer`: Scene 렌더링, Layout, Camera와 탐색 상태
  - `features/explanation`: 설명 Markdown과 퀴즈 표시
  - `components/ui`: 여러 기능에서 재사용하는 기본 UI
  - `lib`: 특정 기능에 속하지 않는 작은 공통 함수

## Scripts와 애플리케이션

`scripts`는 브라우저 애플리케이션 런타임에 포함되지 않는다. 개발 서버나 빌드가 시작되기 전에 Node.js에서 실행되고, 생성 파일을 `src/content/generated`에 작성한 뒤 종료된다.

실행 흐름은 `scripts 실행 → 생성 파일 작성 → src 애플리케이션 실행` 순서다. `scripts`는 필요한 순수 타입과 Layout 계산 함수를 `src`에서 가져올 수 있지만, `src`는 `scripts`를 가져오지 않는다.

## 관련 문서

- [제품 요구사항](../docs/REQUIREMENTS.md)
- [기술 설계](../docs/TECHNICAL_DESIGN.md)
- [코드 작성 가이드](../docs/CODE_GUIDE.md)
- [콘텐츠 작성 가이드](../docs/CONTENT_GUIDE.md)
