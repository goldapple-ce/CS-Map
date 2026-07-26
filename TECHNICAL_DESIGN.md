# CS Zoom Map 기술 설계서

- 상태: Proposed v0.4
- 기준 요구사항: `REQUIREMENTS.md` Draft v0.5
- 목표: `google.com` 접속 시나리오의 클릭 기반 Semantic Zoom MVP

## 1. 설계 목표

이 설계는 다음 품질을 우선한다.

1. 하나의 Viewport가 유지되는 연속적인 탐색 경험
2. 데이터 구조와 탐색 엔진의 무제한 재귀 깊이
3. 지도와 구조화된 긴 설명의 동시 제공
4. 공통 개념과 맥락별 사용 위치의 분리
5. 파일 추가만으로 콘텐츠를 확장할 수 있는 구조
6. 정적 배포로 시작하고 추후 CMS·백엔드로 교체 가능한 경계
7. 키보드와 동작 감소 설정을 포함한 접근성

## 2. 기술 결정

### 2.1 MVP 기본 스택

| 영역             | 선택                                        | 이유                                                                  |
| ---------------- | ------------------------------------------- | --------------------------------------------------------------------- |
| 언어             | TypeScript                                  | 콘텐츠 스키마와 탐색 상태를 정적으로 검증하기 쉬움                    |
| UI               | React                                       | 장면·패널·상태 기반 상호작용 구성                                     |
| 빌드 도구        | Vite                                        | 브라우저 중심 SPA를 단순하게 개발·빌드하고 정적 배포 가능             |
| 라우팅           | React Router                                | History API 기반 딥 링크, catch-all 경로 및 뒤로·앞으로 가기 처리     |
| 스타일링         | Tailwind CSS                                | AI가 utility 기반으로 빠르게 구현하고 별도 컴포넌트 CSS를 만들지 않음 |
| UI 원시 컴포넌트 | shadcn/ui                                   | 접근 가능한 UI 기반과 의미 기반 theme token 제공                      |
| variant          | class-variance-authority                    | 노드와 패널의 반복 상태를 중앙화                                      |
| 장면 렌더링      | SVG + HTML overlay                          | 선·도형과 접근 가능한 텍스트·버튼을 함께 처리                         |
| 장면 배치        | ELK layered + 5×5 논리 격자 (빌드 시 실행) | 일반 Scene 자동 배치와 정밀 Scene의 제한된 위치 제어를 함께 제공      |
| 격자 edge routing | elkjs-libavoid (빌드 시 실행)               | 고정 Topic을 움직이지 않고 직교 edge의 장애물 회피와 lane 분리를 계산 |
| 전환             | CSS transform 우선, 필요 시 Motion          | 프로토타입은 단순하게 시작하고 shared layout 전환을 선택적으로 사용   |
| 상태 관리        | 명시적 reducer + 얇은 store adapter         | 탐색 상태 머신을 라이브러리와 분리                                    |
| 콘텐츠           | YAML 구조 + Markdown 본문 + SVG/이미지 자산 | 사람이 작성·리뷰하기 쉽고 코드와 분리됨                               |
| 검증             | Zod 계열 런타임 스키마                      | 외부 파일의 형태 검증과 TypeScript 타입 추론                          |
| 단위 테스트      | Vitest 계열                                 | 도메인·검증·상태 reducer 테스트                                       |
| 컴포넌트 테스트  | Testing Library                             | 사용자 중심 UI 동작 검증                                              |
| E2E              | Playwright + axe 연동                       | URL, 뒤로 가기, 포커스, 접근성 및 시각 회귀 검증                      |
| 백엔드           | 없음                                        | MVP는 게시 콘텐츠 읽기만 필요함                                       |
| 배포             | SPA fallback을 지원하는 정적 호스팅         | 운영 복잡도를 줄이고 CDN 배포 가능                                    |

정확한 패키지 버전은 프로젝트 생성 시점의 안정 버전으로 잠그고 lockfile을 커밋한다.

### 2.2 중요한 제한

- React Flow 등 특정 그래프 라이브러리의 노드 모델을 도메인 모델로 사용하지 않는다.
- 모든 장면은 하나의 논리적 월드에 존재하되, Viewport와 LOD에 필요한 부분만 DOM/SVG로 가상화한다.
- 장면 깊이를 URL 세그먼트 개수나 타입의 숫자 단계로 제한하지 않는다.
- MVP에 사용자 DB, 인증, CMS를 도입하지 않는다.
- Markdown/MDX에서 임의 JavaScript 실행을 허용하지 않는다.
- MUI, CSS Modules, Sass, styled-components 또는 두 번째 스타일 시스템을 도입하지 않는다.

### 2.3 스타일 아키텍처

```text
shadcn/ui primitives
  Button, Tooltip, ScrollArea, Collapsible, Resizable, Sheet...
        │
        ▼
project components
  SceneNode, PlannedNode, ExplanationPanel, ExplorerShell...
        │
        ▼
Tailwind semantic utilities + cva variants
        │
        ▼
computed layout geometry only
  renderer-owned coordinates and transforms
```

- `src/components/ui`에는 shadcn CLI가 추가한 원시 컴포넌트를 둔다.
- 프로젝트 전용 컴포넌트는 `src/components/scene` 또는 각 feature 디렉터리에 둔다.
- 원시 UI에 변경이 필요하면 wrapper를 우선하고, 생성 코드 수정이 불가피한 경우 이유를 기록한다.
- `bg-background`, `text-foreground`, `border-border`, `text-muted-foreground`, `ring-ring` 같은 의미 기반 token을 사용한다.
- `bg-blue-500`처럼 색상 의도가 드러나지 않는 원시 palette utility를 feature 전반에 흩뿌리지 않는다.
- `interactive`, `planned`, `static`, `selected` 등 반복 상태는 `cva` variant로 관리한다.
- Tailwind가 빌드 시 발견할 수 없는 런타임 class 문자열을 조립하지 않는다.
- 실행 중 계산되는 장면 좌표와 transform만 React `style`로 전달한다.
- `src/index.css`는 Tailwind/shadcn import, theme variable, document-level 기본값만 가진다.

## 3. 전체 아키텍처

```text
Static content files
  ├─ scenarios
  ├─ scenes
  ├─ concepts
  └─ assets
        │
        ▼
Content build pipeline
  parse → schema validation → graph validation → Scene layout/routing → generated indexes
        │
        ▼
Application
  ├─ Route adapter
  ├─ Exploration state machine
  ├─ Scene repository
  ├─ Scene renderer
  ├─ Transition coordinator
  ├─ Explanation panel
  └─ Accessibility layer
```

### 3.1 계층 경계

```text
domain/
  콘텐츠 타입, 탐색 상태, 관계 검증

content/
  파일 파싱, 인덱싱, repository 구현

features/explorer/
  Viewport, 전환, URL 동기화, history

features/explanation/
  전체 설명, 섹션 목차, 독립 스크롤, 읽기 모드

components/scene/
  장면과 요소 렌더링

app/
  React root, React Router와 조립 코드
```

도메인 계층은 React, React Router, Vite, SVG 및 상태 관리 라이브러리를 import하지 않는다.

## 4. 권장 프로젝트 구조

```text
project/
├─ AGENTS.md
├─ REQUIREMENTS.md
├─ TECHNICAL_DESIGN.md
├─ PLAN.md
├─ components.json
├─ index.html
├─ vite.config.ts
├─ src/
│  ├─ main.tsx
│  ├─ index.css
│  ├─ app/
│  │  ├─ App.tsx
│  │  ├─ router.tsx
│  │  └─ routes/
│  │     ├─ HomeRoute.tsx
│  │     ├─ ExploreRoute.tsx
│  │     └─ NotFoundRoute.tsx
│  ├─ domain/
│  │  ├─ content-types.ts
│  │  ├─ exploration-state.ts
│  │  └─ relationship-validation.ts
│  ├─ content/
│  │  ├─ schemas.ts
│  │  ├─ repository.ts
│  │  ├─ file-repository.ts
│  │  └─ build-index.ts
│  ├─ features/
│  │  ├─ explorer/
│  │  │  ├─ ExplorerShell.tsx
│  │  │  ├─ SceneViewport.tsx
│  │  │  ├─ TransitionCoordinator.tsx
│  │  │  ├─ Breadcrumbs.tsx
│  │  │  └─ useExplorationStore.ts
│  │  └─ explanation/
│  │     ├─ ExplanationPanel.tsx
│  │     ├─ QuizPanel.tsx
│  │     ├─ ContentSection.tsx
│  │     └─ TableOfContents.tsx
│  ├─ components/
│  │  ├─ ui/
│  │  │  ├─ button.tsx
│  │  │  ├─ scroll-area.tsx
│  │  │  ├─ tabs.tsx
│  │  │  └─ tooltip.tsx
│  │  └─ scene/
│  │     ├─ SceneRenderer.tsx
│  │     ├─ SceneNode.tsx
│  │     ├─ SceneEdge.tsx
│  │     └─ PlannedNode.tsx
│  └─ lib/
│     └─ utils.ts
├─ content/
│  ├─ scenarios/
│  ├─ scenes/
│  ├─ concepts/
│  └─ assets/
├─ scripts/
│  └─ validate-content.ts
├─ tests/
│  ├─ fixtures/
│  └─ e2e/
└─ public/
```

## 5. 도메인 모델

### 5.1 관계 타입

관계를 반드시 구분한다.

| 관계             | 의미                  |          순환 허용 | 중앙 지도 사용 |
| ---------------- | --------------------- | -----------------: | -------------: |
| `contains`       | 내부 장면으로 확대    |             아니오 |             예 |
| `flows-to`       | 실제 데이터·제어 흐름 | 장면 내부에서 가능 |             예 |
| `supports`       | 사전 신뢰·지원 관계   |                 예 | 구분된 점선 edge |
| `related`        | 관련 지식 연결        |                 예 |  구분된 연결선 |
| `prerequisite`   | 선수 지식 연결        |                 예 |  구분된 연결선 |
| `used-by`        | 사용 관계 연결        |                 예 |  구분된 연결선 |
| `uses-concept`   | 공통 원리 참조        |                 예 |      패널 중심 |
| `related-to`     | 비교·인과·최적화 관계 |                 예 |      패널 중심 |
| `implemented-by` | 맥락별 구현체         |             아니오 |             예 |

부모-자식 확대 그래프만 비순환이어야 한다. 관련 개념 그래프의 순환은 정상이다.

### 5.2 핵심 타입

```ts
type ContentId = string;

type Scene = {
  id: ContentId;
  slug: string;
  scenarioId: ContentId;
  parentId?: ContentId;
  title: string;
  summary: string;
  status: "draft" | "review" | "published" | "planned";
  ariaLabel: string;
  layoutHint?: "horizontal" | "branch";
  layout?: {
    type: "grid";
    columns: 5;
    rows: 5;
  };
  elements: SceneElement[];
  contentRef: string;
  conceptRefs: ConceptUsage[];
  quiz?: TopicQuiz;
  sources: Source[];
  author: Contributor;
  updatedAt: string;
};

type Concept = {
  id: ContentId;
  slug: string;
  title: string;
  aliases: string[];
  contentRef: string;
  sources: Source[];
};

type ConceptUsage = {
  conceptId: ContentId;
  occurrenceId: ContentId;
  contextSummary: string;
  contextContentRef?: string;
};

type TopicQuiz = {
  questions: QuizQuestion[];
};

type QuizQuestion = {
  id: ContentId;
  prompt: string;
  options: { id: ContentId; label: string }[];
  correctOptionId: ContentId;
  explanation: string;
};

type SceneElement = {
  id: string;
  kind: "node" | "group" | "edge" | "annotation";
  label?: string;
  groupId?: ContentId;
  fromElementId?: ContentId;
  toElementId?: ContentId;
  variant?: "flow" | "supporting" | "return";
  targetSceneId?: ContentId;
  navigateToSceneId?: ContentId;
  conceptId?: ContentId;
  status?: "published" | "planned";
};
```

`targetSceneId`는 node 안에 중첩되는 자식 Scene만 가리키며 대상 Scene의
`parentId`가 현재 Scene이어야 한다. 이미 월드의 다른 위치에 배치된 Scene으로
이동하는 교차 탐색은 `navigateToSceneId`를 사용한다. 교차 탐색은 카메라와 URL만
대상 Scene으로 이동하며 월드 중첩이나 `contains` 관계를 추가하지 않는다.

Scene edge의 `flow`는 주요 진행 방향, `supporting`은 사전 준비나 지원 관계,
`return`은 handler 선택 결과나 처리 결과처럼 호출 지점으로 되돌아오는 흐름을
뜻한다. `supporting`과 `return`은 점선으로 표시하지만 관계 의미는 구분한다.
위쪽에 있는 supporting 또는 return source가 아래쪽 Topic으로 연결되면 대상의
위쪽 중앙 port를 사용해 주요 좌우 흐름과 접속선을 분리한다.

### 5.3 공통 개념과 사용 위치 예시

```text
Concept: cache
  공통 원리: hit/miss, TTL, eviction, consistency

Occurrence: server-result-cache
  맥락: 검색 결과 계산 비용 절감
  children: local-cache, distributed-cache

Occurrence: distributed-cache
  children: redis
```

TCP 역시 하나의 `tcp` Concept를 공유하고, HTTPS 연결과 DB 연결은 각각 다른 `ConceptUsage`를 가진다.

## 6. 콘텐츠 저장 설계

### 6.1 장면 디렉터리

```text
content/scenes/google-search/network/dns/
├─ scene.yaml
├─ content.ko.md
└─ assets/
   └─ dns-query.svg
```

`scene.yaml`은 구조, 위치, 관계와 메타데이터를 가진다. `content.ko.md`는 긴 설명 섹션을 가진다.

현재 콘텐츠 디렉터리와 `google-search-*` 영구 ID는 기존 참조를 깨뜨리지 않기 위해 유지한다. 사용자에게 노출되는 루트 slug와 canonical URL은 새 시나리오를 반영한 `google-com`을 사용한다. 새 하위 Scene은 의미에 맞는 ID를 사용하며, 기존 ID를 일괄 변경해야 할 필요가 생기면 별도의 migration으로 처리한다.

### 6.2 공통 개념 디렉터리

```text
content/concepts/cache/
├─ concept.yaml
└─ content.ko.md

content/concepts/tcp/
├─ concept.yaml
└─ content.ko.md
```

### 6.3 Vite 콘텐츠 로딩

- `predev`와 `prebuild` 단계에서 콘텐츠 검증과 route index 생성을 실행한다.
- route index에는 장면 ID, URL path, 상태, 부모와 lazy module key만 포함하고 긴 본문은 포함하지 않는다.
- Vite의 정적인 `import.meta.glob` 패턴으로 장면 YAML과 Markdown loader map을 만든다.
- loader map은 eager import가 아니라 장면별 lazy import를 기본으로 한다.
- `SceneRepository`가 route index와 loader map을 결합하며 UI는 Vite API를 직접 사용하지 않는다.
- 생성된 index는 사람이 직접 수정하지 않으며 빌드 또는 개발 시작 시 다시 만든다.
- 콘텐츠 파일 추가 후 route index 재생성을 검증하는 테스트를 둔다.

### 6.4 Markdown 정책

- Markdown 원문은 Vite의 정적 loader map에 빌드하고, 패널은 허용 목록 기반 React 요소로만 변환한다.
- 원문 HTML은 해석하지 않고 일반 텍스트로 취급하며 `dangerouslySetInnerHTML`을 사용하지 않는다.
- 임의 JSX, script, inline event handler를 허용하지 않는다.
- 제목에 안정적인 section ID를 부여한다.
- 장면 내 링크는 일반 URL 대신 검증 가능한 콘텐츠 참조 문법을 사용한다.
- 외부 링크는 출처 목록과 연결한다.

## 7. 탐색 상태 머신

### 7.1 상태

```text
idle
  ├─ ENTER_SCENE → transitioning-in
  ├─ GO_BACK → transitioning-out
  ├─ OPEN_PANEL → idle
  └─ ENTER_READING_MODE → idle

transitioning-in
  └─ TRANSITION_END → idle

transitioning-out
  └─ TRANSITION_END → idle
```

전환 중 추가 진입 요청은 중복 실행하지 않는다. 사용자가 뒤로 가기를 요청한 경우 현재 전환을 안전하게 완료하거나 취소한 뒤 하나의 일관된 상태로 이동한다.

### 7.2 History entry

```ts
type HistoryEntry = {
  sceneId: ContentId;
  path: string[];
  focusedElementId?: string;
  camera: CameraSnapshot;
  panel: {
    open: boolean;
    mode: "split" | "reading";
    scrollTop: number;
    activeSectionId?: string;
  };
};
```

뒤로 가기는 이전 entry의 장면, 포커스, 카메라, 패널 상태와 스크롤 위치를 복원한다.

## 8. URL 설계

### 8.1 형식

```text
/                                      # 소개 홈페이지
/explore/google-com
/explore/google-com/dns
/explore/google-com/dns/udp-query
/explore/google-com/router
/explore/google-com/user-browser
/explore/google-com/server
/explore/google-com/server/nginx
/explore/google-com/server/spring
/explore/google-com/server/spring/tomcat
/explore/google-com/server/spring/ecosystem
/explore/google-com/server/spring/ecosystem/security
/explore/google-com/server/spring/ecosystem/mvc
/explore/google-com/server/spring/ecosystem/container
/explore/google-com/server/database
/explore/google-com/server/database/sql
/explore/google-com/server/database/nosql
```

- `/`는 서비스 소개와 이용 방법을 제공하고 루트 Scene의 `SceneViewport`를 재사용하는 `HomeRoute`를 표시한다.
- 홈페이지의 `SceneViewport`는 같은 콘텐츠 repository와 World renderer를 사용하며, 게시된 Topic 클릭을 해당 `/explore/*` 경로로 연결한다.
- 홈페이지에서는 `SceneViewport`의 embedded presentation을 사용해 Explorer 전용 chrome을 렌더링하지 않으며, 접근성 제목과 실제 흐름 renderer는 유지한다.
- embedded presentation은 홈페이지 콘텐츠 영역의 너비를 유지하고, Scene 전체 높이를 맞추지 않은 채 월드 bounds의 가로 너비를 그 영역에 맞춰 카메라 배율을 계산한다. 홈페이지 영역을 벗어나는 세로 여백과 부가 annotation은 잘릴 수 있다. Explorer presentation은 기존 전체 bounds와 padding 맞춤을 유지한다.
- 전체 화면 탐색 행동은 `/explore/google-com`으로 클라이언트 측 이동한다.
- URL path는 현재 맥락을 표현한다.
- 내부 데이터 참조는 변경에 강한 영구 ID를 사용한다.
- slug가 변경되면 alias 목록 또는 redirect manifest로 기존 URL을 보존한다.
- 기존 `/explore/google-search`와 제작된 하위 경로는 router의 명시적 alias에서 대응하는 `/explore/google-com` 경로로 교체 이동한다.
- 같은 공통 개념이라도 서로 다른 사용 맥락은 다른 탐색 URL을 가질 수 있다.
- 공통 설명 데이터는 중복하지 않고 같은 Concept를 참조한다.

### 8.2 정적 SPA 배포

- Vite는 단일 SPA entry와 분할된 정적 자산을 `dist`에 생성한다.
- React Router의 `/` route는 `HomeRoute`를, `/explore/*` route는 임의 깊이의 장면 path를 해석하는 `ExploreRoute`를 사용한다.
- 게시된 모든 장면 경로를 콘텐츠 route index에 포함한다.
- 정적 호스팅은 `/explore/*` 직접 요청을 `/index.html`로 되돌리는 SPA fallback을 제공해야 한다.
- route index에 없거나 게시되지 않은 경로는 애플리케이션 내부 not-found로 처리한다.
- 신규 콘텐츠를 게시하면 정적 사이트를 다시 빌드한다.
- 향후 콘텐츠가 빌드 시간 한계를 넘으면 같은 repository 인터페이스 뒤에 서버 또는 CDN JSON 제공 방식을 추가한다.
- MVP는 장면별 HTML 사전 렌더링과 검색 엔진 최적화를 범위에서 제외한다.

## 9. Viewport와 Semantic Zoom

### 9.1 렌더링 전략

- 루트부터 모든 하위 장면을 하나의 재귀적 논리 좌표계에 배치한다.
- 각 하위 장면은 부모의 확대 대상 노드 영역 안에 로컬 좌표계로 중첩된다.
- SVG는 연결선과 도형을 담당한다.
- 클릭 가능한 텍스트·버튼은 SVG 접근 가능 요소 또는 위치가 동기화된 HTML overlay로 표현한다.
- 장면 데이터는 픽셀 좌표를 저장하지 않는다. 일반 Scene은 노드 순서, 그룹 소속과 관계로 자동 배치하고, 정밀한 Scene은 node마다 1~5 범위의 5×5 논리 격자 셀을 저장할 수 있다.
- 논리 격자 스키마는 모든 node의 셀 지정, 좌표 범위와 셀 중복을 검증한다. 셀 번호를 실제 좌표로 투영할 때 노드 라벨 너비, 공통 행·열 간격과 주석 영역을 반영해 Scene bounds를 결정한다.
- 콘텐츠 빌드 단계의 ELK layered adapter가 로컬 Topic 좌표, 직교 edge 경로와 edge별 port를 결정적으로 계산하고 `scene-layout-index.ts`를 생성한다.
- ELK adapter는 renderer 계층에만 속하며 Scene·Relationship 도메인 모델을 ELK 타입에 결합하지 않는다. 런타임 renderer는 생성 인덱스를 읽고, 인덱스가 없는 개발·복구 상황에서만 기존 결정적 배치를 fallback으로 사용한다.
- 생성된 로컬 Scene 배치를 기존 재귀 월드 배치가 조합해 월드 bounds와 자식 Scene 중첩 영역을 계산하므로 카메라, URL과 Semantic Zoom 상태 모델은 바뀌지 않는다.
- `SceneEdge`는 `label`이 있으면 edge 경로에서 가장 긴 선분의 중점을 선택해 보이는 라벨을 배치한다. 진행 edge는 추정 라벨 너비만큼 인접 열 간격을 확보하며 콘텐츠에는 라벨 좌표를 저장하지 않는다.
- ELK edge router는 주요 흐름, 반환, 지원 관계별 port 방향을 사용하고 수평·수직 선분만 사용하는 직교 꺾은선을 계산한다. 각 edge는 별도 port를 가져 동일 Topic 사이의 여러 선도 접점과 lane을 공유하지 않는다.
- 논리 격자 Scene은 고정 Topic 위치를 바꾸지 않는 libavoid router로 직교 edge를 계산한다. 노드 장애물 회피, 교차 비용과 평행 선분 nudging을 빌드 단계에서 적용하며 콘텐츠에는 접점과 bend point를 저장하지 않는다.
- 출발과 도착 요소가 같은 self edge는 depth 계산에서 제외하고 해당 노드 위쪽을 돌아 다시 노드로 들어오는 loop 경로로 표시한다.
- 동일한 두 Topic 사이에 edge가 여러 개 존재하면 ELK가 edge별 port, 라벨 크기와 다른 경로를 함께 고려해 별도 lane을 계산한다. 방향과 `flow`·`return`·`supporting` 시각 구분은 renderer가 유지한다.
- `supports` 관계는 주요 흐름보다 낮은 방향 우선순위와 위·아래 port를 사용하며 점선 edge로 표시한다.
- 기본 Topic 크기와 열·행 간격은 확대된 Scene에서도 라벨과 진행 방향을 구분할 수 있는 크기로 유지하며, edge 라벨 너비가 더 크면 열 간격을 추가로 확장한다.
- 보이는 edge 라벨은 배경색 halo로 선과 분리하고, edge 그룹의 접근성 이름과 SVG `title`은 그대로 유지한다.
- 배치 구현은 도메인 모델 밖의 build adapter로 둔다. 콘텐츠 작성자는 일반 Scene에서는 좌표를 쓰지 않고, 논리 격자 Scene에서는 1~5의 셀 위치만 작성한다. 픽셀 `x`, `y`, `width`, `height`, port와 bend point는 작성하지 않는다.
- 화면 투영 크기에 따른 LOD와 Viewport 교차 검사로 실제 DOM 렌더링 범위를 제한한다.

### 9.2 진입 전환

```text
1. 클릭 Topic의 월드 bounds 조회
2. 현재 카메라와 패널 history snapshot 저장
3. target Topic과 필요한 조상/자식 데이터 선로드
4. bounds가 Viewport 중앙에 맞도록 목표 camera 계산
5. 하나의 World transform을 scale/translate
6. URL과 focused Topic 확정
7. 배율에 맞는 하위 콘텐츠 LOD 공개와 포커스 이동
```

프로토타입은 CSS transform으로 시작한다. 요소 간 정확한 shared layout 연결이 필요할 때만 Motion의 layout 기능을 도입한다. 라이브러리를 쓰더라도 탐색 상태 머신은 라이브러리 밖에 둔다.

### 9.3 동작 감소

`prefers-reduced-motion: reduce`에서는 보간 애니메이션 없이 목표 카메라 위치와 배율을 즉시 적용한다. 월드는 유지하며 정보와 포커스 이동도 동일하게 유지한다.

## 10. 설명 패널

### 10.1 데스크톱 레이아웃

```text
┌────────────────────────────┬────────────────────┐
│ Persistent Scene Viewport  │ Explanation Panel  │
│                            │ independent scroll │
│ diagram and zoom targets   │ structured content │
└────────────────────────────┴────────────────────┘
```

- 기본 상태는 지도와 설명을 동시에 보여주는 split mode이다.
- 패널은 독립 스크롤 영역이다.
- 패널을 접어 지도를 넓힐 수 있다.
- reading mode에서는 같은 페이지 안에서 설명 영역을 넓힌다.
- 장면이 바뀌면 새 설명의 첫 섹션으로 이동한다.
- 뒤로 가면 이전 장면의 scrollTop과 active section을 복원한다.

### 10.2 콘텐츠 렌더링

지원 섹션:

```text
overview, why, flow, internals, example, tradeoff,
failure, security, practice, related, sources, custom
```

모든 장면에 모든 섹션을 강제하지 않는다. 장면의 학습 목표에 필요한 섹션만 제공한다.

### 10.3 Topic 퀴즈

- `Scene.quiz.questions`는 선택적 데이터이며 콘텐츠 YAML에서 관리한다.
- 각 문항은 ID, 질문, 두 개 이상의 선택지, 선택지 중 하나를 가리키는 정답 ID와 해설을 가진다.
- 스키마는 Topic 안의 문항 ID, 문항 안의 선택지 ID 중복과 존재하지 않는 정답 ID를 거부한다.
- `ExplanationPanel`은 접근 가능한 tabs primitive로 설명과 퀴즈를 전환한다.
- `QuizPanel`은 답안 선택, 정답·오답의 텍스트·아이콘 표시와 해설 공개를 담당한다.
- 퀴즈 UI 상태는 현재 브라우저 메모리에만 존재하며 Topic 이동 시 초기화한다. 점수, 진도와 결과 이력을 저장하지 않는다.
- 퀴즈가 없는 Topic에는 명시적인 빈 상태를 표시한다.

## 11. 콘텐츠 검증 파이프라인

```text
read files
→ parse YAML/Markdown
→ schema validation
→ unique ID/slug validation
→ reference validation
→ parent-child cycle detection
→ published dependency validation
→ route manifest generation
→ content index generation
```

검증 오류는 파일, 필드, 참조 ID와 가능한 해결 방법을 포함해야 한다. CI에서 검증 실패 시 build와 merge를 실패시킨다.

## 12. 성능 설계

- 루트 진입 시 현재 장면과 공통 shell만 로드한다.
- 하위 게시 장면 메타데이터는 미리 가져올 수 있지만 긴 본문은 필요 시 로드한다.
- 사용자가 노드에 포커스하거나 hover한 경우 해당 target을 prefetch 후보로 삼는다.
- 화면 밖 장면은 유지하지 않는다. 단, 직전 장면 snapshot은 데이터로 보존한다.
- SVG path와 이미지 자산은 장면 단위로 분할한다.
- 장면별 번들 크기와 전환 지연을 측정할 수 있는 개발 로그를 제공한다.
- 성능 수치는 첫 프로토타입의 기준 기기와 대표 장면을 정한 뒤 예산으로 고정한다.

## 13. 접근성 설계

- 확대 대상은 native button 또는 동등한 키보드 동작을 가진다.
- Tab 순서는 장면의 의미 있는 흐름과 일치한다.
- Enter와 Space로 장면에 진입할 수 있다.
- 진입 후 장면 제목으로 포커스를 이동하고 변화 내용을 live region으로 간단히 알린다.
- 그림에는 장면 전체 텍스트 요약을 제공한다.
- 색상만으로 `published`, `planned`, `selected`를 구분하지 않는다.
- hover 미리보기와 같은 정보를 keyboard focus에서도 제공한다.
- 자동 접근성 검사는 수동 키보드·스크린 리더 검수를 대체하지 않는다.

## 14. 오류 처리

| 상황              | 처리                                           |
| ----------------- | ---------------------------------------------- |
| 없는 URL          | 탐색 shell 안에서 not-found와 루트 복귀 제공   |
| planned node 클릭 | 이동하지 않고 예정 내용 표시                   |
| 콘텐츠 로딩 실패  | 현재 장면 유지, 재시도와 오류 요약 제공        |
| 깨진 참조         | 빌드 실패; 운영 환경에 게시하지 않음           |
| 전환 중 중복 클릭 | 첫 전환만 처리하고 이후 입력 무시 또는 큐 제거 |
| 잘못된 history    | 가장 가까운 유효 조상 또는 루트로 복구         |

## 15. 테스트 설계

### 15.1 단위 테스트

- 스키마 parsing 성공·실패
- 중복 ID·slug 탐지
- 확대 관계 순환 탐지
- published → draft 참조 검증
- navigation reducer의 enter/back/forward
- history snapshot과 panel scroll 복원
- URL path와 scene ID 변환

### 15.2 컴포넌트 테스트

- published node 활성화
- planned node 비이동
- 키보드 진입
- 설명 패널 접기·reading mode
- 긴 설명 독립 스크롤
- reduced motion 분기

### 15.3 E2E

```text
루트 열기
→ 네트워크 클릭
→ DNS 클릭
→ 설명 패널 스크롤
→ UDP 클릭
→ 브라우저 뒤로 가기
→ DNS 장면과 읽던 위치 확인
→ URL 새 탭 열기
→ 동일 장면 확인
```

추가로 keyboard-only 경로, axe 자동 검사와 핵심 장면 screenshot 회귀를 실행한다.

## 16. 배포와 CI

PR 또는 main push 시 다음 순서로 실행한다.

```text
format/lint
→ typecheck
→ content validation
→ unit/component tests
→ static build
→ E2E smoke tests
```

게시 콘텐츠 오류는 빌드 전에 탐지되어야 한다. 배포 산출물은 정적 파일이며 콘텐츠 변경도 동일한 CI 경로를 통과한다.

## 17. 보안

- 사용자 입력과 계정이 없는 MVP는 개인정보를 수집하지 않는다.
- Markdown은 허용 목록 기반 sanitizer를 통과한다.
- 외부 기여 콘텐츠의 임의 HTML·JS 실행을 차단한다.
- 외부 링크에는 안전한 새 창 정책을 적용한다.
- 향후 CMS 도입 시 인증·역할·승인·감사 로그를 별도 설계한다.

## 18. 기술 부채를 만들지 않기 위한 경계

- `SceneRepository` 인터페이스로 파일 저장소와 향후 API 저장소를 분리한다.
- `SceneRenderer` 입력은 도메인 타입이며 YAML 원문을 직접 읽지 않는다.
- `TransitionCoordinator`는 콘텐츠를 해석하지 않는다.
- `RouteAdapter`만 React Router navigation API를 사용한다.
- 패널 컴포넌트는 Markdown 파일 경로나 저장 방식에 의존하지 않는다.
- 렌더러 변경이 Scene·Concept·Context 데이터 마이그레이션을 요구하지 않게 한다.

## 19. 구현 전 검증할 기술 스파이크

전체 구현 전에 다음 세 가지를 작은 프로토타입으로 검증한다.

1. SVG 노드를 클릭해 다른 장면으로 확대하고 반대로 복귀할 때 공간적 연속성이 충분한가?
2. React Router의 `/explore/*` URL과 브라우저 history가 내부 탐색 stack과 충돌하지 않는가?
3. 독립 스크롤 패널의 위치가 뒤로 가기 후 정확히 복원되는가?

스파이크 결과에 따라 전환 도구와 상태 store를 확정한다. 제품·도메인 모델은 스파이크 결과와 무관하게 유지한다.

## 20. 참고한 공식 문서

- [Vite Building for Production](https://vite.dev/guide/build)
- [Vite Static Deployment](https://vite.dev/guide/static-deploy)
- [React Router createBrowserRouter](https://reactrouter.com/api/data-routers/createBrowserRouter)
- [React Router Routing and Splats](https://reactrouter.com/start/data/routing)
- [Tailwind CSS with Vite](https://tailwindcss.com/docs/installation/using-vite)
- [shadcn/ui with Vite](https://ui.shadcn.com/docs/installation/vite)
- [shadcn/ui Introduction](https://ui.shadcn.com/docs)
- [Motion for React Layout Animations](https://motion.dev/docs/react-layout-animations)
- [Zod Basic Usage](https://zod.dev/basics)
- [Playwright Accessibility Testing](https://playwright.dev/docs/accessibility-testing)
