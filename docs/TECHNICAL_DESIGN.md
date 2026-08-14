# CS Map 기술 설계

요구사항을 구현하기 위해 콘텐츠가 화면에 전달되는 구조를 설명한다. 제품 동작은 [제품 요구사항](./REQUIREMENTS.md), 코드 작성 방법은 [코드 작성 가이드](./CODE_GUIDE.md)를 따른다.

## 한눈에 보기

1. 작성 파일에 Scene과 설명을 저장한다.
2. Node.js에서 실행되는 Content Build가 파일을 검증하고 Index를 생성한다.
3. Content Repository가 필요한 데이터만 읽는다.
4. Explorer가 Scene을 그리고 탐색 상태를 관리한다.

## 기술 구성

- 애플리케이션
  - TypeScript, React, Vite
  - React Router
- 화면
  - Tailwind CSS, shadcn/ui
  - SVG Edge와 HTML Topic
- 콘텐츠
  - YAML, Markdown
  - Zod 검증
- 배포
  - 백엔드 없는 정적 애플리케이션
  - SPA Fallback을 지원하는 호스팅

## 설계 경계

- 콘텐츠 타입과 Repository는 `src/content`에서 관리한다.
- UI는 작성 파일을 직접 읽지 않고 Content Repository를 사용한다.
- Renderer는 콘텐츠 저장 위치와 URL 생성 방법을 알지 않는다.
- 작성 파일에는 화면에서 계산할 수 있는 좌표와 경로를 저장하지 않는다.
- 생성된 Index는 사람이 수정하지 않는다.
- `scripts`는 브라우저 런타임 밖에서 실행되며 `src`는 `scripts`를 가져오지 않는다.

## 콘텐츠 처리

### 작성 데이터

- `Scenario`: `rootSceneId`로 탐색 시작점을 지정한다.
- `Scene YAML`: Scene, Area, Node와 Edge를 작성한다.
- `Markdown`: Scene과 Topic 설명을 작성한다.
- `Quiz YAML`: 질문과 답변을 작성한다.

Scene 관계는 다음 참조에서 파생한다.

- `childSceneId`: Parent Scene과 Child Scene 관계
- `navigateToSceneId`: 중첩되지 않는 Scene 이동
- `edges`: 현재 Scene 안의 흐름
- `areas`: 현재 Scene 안의 시각적 소속
- `description`, `contentRef`: Topic 설명

### Content Build

`frontend/scripts`의 Content Build는 개발 서버와 빌드가 시작되기 전에 Node.js에서 실행된다. 필요한 순수 타입과 Layout 계산 함수는 `src`에서 가져올 수 있지만, 브라우저 애플리케이션은 `scripts`에 의존하지 않는다.

Content Build는 다음 순서로 실행한다.

1. YAML과 Markdown을 읽고 검증한다.
2. Root Scene에서 도달 가능한 Scene을 찾는다.
3. URL과 Parent 관계를 계산한다.
4. Grid를 좌표로 바꾸고 Edge 경로를 계산한다.
5. Content, Route와 Layout Index를 생성한다.

생성 파일을 `src/content/generated`에 작성하면 Content Build는 종료되고 브라우저 애플리케이션이 시작된다.

### Content Repository

- 생성된 Index를 통해 Scene을 찾는다.
- Scene 지도, 긴 설명과 Topic 설명을 나누어 읽는다.
- 진행 중인 요청과 완료된 결과를 캐시에서 공유한다.
- 실패한 요청은 캐시에서 제거해 다시 시도할 수 있게 한다.

## Explorer 처리

### Scene 렌더링

- Layout Index가 Scene 내부의 Topic 좌표와 Edge 경로를 제공한다.
- World Layout이 Parent Scene과 Child Scene의 좌표를 하나의 공간으로 합친다.
- Camera가 World 좌표를 World Viewport의 화면 좌표로 변환한다.
- World Renderer는 현재 화면에 필요한 Scene만 SVG와 HTML로 그린다.
- 화면에 투영된 Scene 배율에 따라 Topic의 라벨 크기를 조정한다.

### 탐색 상태

- Route Index가 URL과 Scene ID를 연결한다.
- Explorer Shell이 URL, 현재 Scene과 Explanation Panel을 조립한다.
- Scene Viewport가 Camera, 선택 Topic과 전환 상태를 관리한다.
- 이동 전에 현재 Camera와 Panel 상태를 Snapshot으로 저장한다.
- 뒤로 가기는 저장된 Snapshot을 다시 적용한다.

### Explanation Panel

- 현재 Scene 또는 선택 Topic을 기준으로 Content Repository에 설명을 요청한다.
- Scene 설명, Topic 설명과 Quiz를 같은 Panel 상태에서 전환한다.
- Panel의 열림 상태, 표시 방식과 스크롤 위치는 Scene 탐색 상태와 함께 저장한다.

## 구현 기준

- 콘텐츠: [schemas.ts](../frontend/src/content/schemas.ts), [build-content-index.ts](../frontend/scripts/build-content-index.ts), [repository.ts](../frontend/src/content/repository.ts)
- 화면 배치: [elk-scene-layout.ts](../frontend/scripts/elk-scene-layout.ts), [world-layout.ts](../frontend/src/features/explorer/layout/world-layout.ts), [WorldRenderer.tsx](../frontend/src/features/explorer/components/WorldRenderer.tsx)
- 탐색: [camera.ts](../frontend/src/features/explorer/camera.ts), [exploration-memory.ts](../frontend/src/features/explorer/exploration-memory.ts), [SceneViewport.tsx](../frontend/src/features/explorer/SceneViewport.tsx)
- 화면 조립: [ExplorerShell.tsx](../frontend/src/features/explorer/ExplorerShell.tsx), [ExplanationPanel.tsx](../frontend/src/features/explanation/ExplanationPanel.tsx)

정확한 타입, 상수와 처리 순서는 위 코드를 기준으로 한다. 구조가 바뀌면 이 문서도 함께 갱신한다.
