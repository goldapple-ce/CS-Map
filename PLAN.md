# Scene Light Flow 및 설명 가능한 Scene Area

## 목표

Scene 작성자가 기존 Edge를 이어 Light Flow를 정의하고, 사용자가 World Viewport 상단의 버튼을 누르면 `첫 출발 Node 점등 → Edge pulse 1회 이동 → 도착 Node 점등`이 전기처럼 이어지는 흐름 시각화를 제공한다. 다음 stage가 직전 도착 Node에서 이어지면 출발 점등을 반복하지 않고 바로 Edge pulse를 보내며, 비연속 stage에서만 출발 Node를 다시 점등한다. 같은 단계의 Edge pulse는 동시에 한 번만 이동해 분기와 합류를 표현하며, Light Flow가 없는 Scene의 화면은 바꾸지 않는다.

## 선택한 요청

- Scene YAML에 선택적인 `lightFlows`를 작성한다.
- Light Flow는 순서가 있는 `stages`를 갖고, 각 stage는 현재 Scene에 존재하는 Edge를 `[from, to]` 쌍 또는 명시적 Edge ID로 하나 이상 참조한다.
- 첫 stage와 비연속으로 다시 시작하는 stage는 source Node를 먼저 점등하고, 같은 stage의 모든 Edge에서 pulse를 정확히 한 번 동시에 이동시킨 뒤 target Node를 점등한다.
- 다음 stage의 모든 source Node가 직전 stage의 target Node 집합에 포함되면 연속 stage로 판단하고 source phase를 생략한 채 바로 Edge pulse를 보낸다. 하나라도 직전 target에 없는 source Node가 있으면 비연속 restart로 보고 source phase를 재생한다.
- 분기에서는 한 source Node에서 여러 pulse가 갈라져 각 target Node에 도착하고, 합류에서는 여러 source Node의 pulse가 하나의 target Node로 모인다.
- 같은 Edge 안에서 pulse를 반복 재생하지 않는다.
- Light Flow가 하나면 `흐름 보기` 버튼을 보이고, 재생 완료 후 `다시 보기`로 다시 실행할 수 있게 한다.
- Light Flow가 여러 개면 각 Flow의 `label`을 서로 구분되는 실행 버튼 이름으로 사용한다.
- Light Flow가 없는 Scene에서는 버튼과 애니메이션 요소를 렌더링하지 않는다.
- Light Flow는 기존 Edge layout을 따라가는 요청 시점의 연출이며, Edge 관계나 Scene 탐색 상태를 바꾸지 않는다.

## 추가 승인 범위: 설명 가능한 Scene Area

### 목표

Scene 작성자가 Area에 선택적인 `contentRef`를 연결하고, 사용자가 색칠된 Area 사각형 전체를 큰 Area Node처럼 선택하면 Camera와 URL을 바꾸지 않은 채 Explanation Panel에서 Area 설명을 읽을 수 있게 한다. Area 안의 Node는 Area보다 먼저 기존 선택 동작을 받고, Node가 없는 Area 배경을 선택하면 Area 설명을 연다. `contentRef`가 없는 기존 Area의 동작과 모습은 바꾸지 않는다.

Redis Scene에서는 `Keyspace` Area가 Keyspace 전체에 관한 설명을 맡고, 내부 Node 문서는 각 구성 요소의 책임만 설명하도록 분리한다.

### 작성 계약

```yaml
areas:
  keyspace:
    label: Keyspace
    row: 3
    col: 3
    rowSpan: 1
    colSpan: 2
    contentRef: keyspace.ko.md
```

- Area의 `contentRef`는 선택 사항이며 현재 Scene 디렉터리의 Markdown 파일만 참조한다.
- `contentRef`가 있는 Area는 Label을 포함한 색칠된 사각형 전체를 선택할 수 있다.
- Area 선택은 Child Scene 진입이나 다른 Scene 이동이 아니다. URL과 Camera를 유지하고 Explanation Panel에 Area Markdown을 표시한다.
- Area 내부 Node는 Area보다 우선해서 pointer event를 받고 기존 Node 탐색·설명 동작을 그대로 사용한다.
- `contentRef`가 없는 Area는 기존처럼 시각적 그룹 배경이며 비상호작용 상태를 유지한다.
- 작성 파일 경로는 브라우저 runtime에 노출하지 않는다. Content Build가 Area Markdown을 읽어 생성 데이터의 Area 설명 record로 만들고, runtime Area에는 Area의 선택 가능 여부만 전달한다.

현재 World Viewport에는 pointer drag/pan 기능이 없으므로 이동 거리 임계값과 drag 뒤 클릭 방지는 이번 변경에 적용되지 않는다. 이 기능을 새로 추가하는 일은 승인된 Area 설명 범위를 넘어가므로 별도 요청으로 다룬다.

### 완료 조건

#### 콘텐츠 계약과 생성 데이터

- [x] Scene Area Schema가 선택적 `contentRef`를 같은 Scene 디렉터리의 Markdown 파일명으로 검증한다.
- [x] Content Build가 Area Markdown의 존재 여부와 로컬 이미지 참조를 기존 Topic Markdown과 같은 규칙으로 검증·처리한다.
- [x] 공용 `SceneArea` runtime 타입은 파일 경로 없이 설명 제공 여부를 표현하고, generated Scene 콘텐츠는 Node 설명과 구분된 Area 설명 record를 제공한다.
- [x] Content Repository가 Scene 안에 실제로 존재하는 Area만 조회하도록 검증하고 Area 설명 또는 설명 없음 상태를 일관되게 반환한다.

#### Area 선택과 Explanation Panel

- [x] `SceneArea`는 `contentRef`가 있는 focused Scene의 Label과 색칠된 사각형 전체에 선택 동작을 제공한다.
- [x] Area를 선택하면 URL·Camera·Scene을 바꾸지 않고 접힌 Explanation Panel을 열어 Area 제목과 Markdown을 표시한다.
- [x] Node와 Area 선택을 구분하는 selection 계약을 사용해 Repository 조회와 Panel Header가 올바른 콘텐츠 종류를 표시한다.
- [x] Area 내부 Node가 Area보다 우선해 기존 Topic 설명과 Child Scene 탐색을 수행한다.
- [x] `contentRef`가 없는 Area는 클릭 가능한 스타일과 선택 handler를 갖지 않는다.

#### Redis Keyspace 콘텐츠 분리

- [x] Redis `Keyspace` Area에 `keyspace.ko.md`를 연결한다.
- [x] `keyspace.ko.md`는 Keyspace의 범위, TTL, Passive/Active Expiration, Hot Key, Big Key와 전체 조회를 피하는 `SCAN` 사용 이유를 설명한다.
- [x] `hashtable.ko.md`는 Key Hash 계산과 Entry 조회 구조, Redis `Hash` Data Type과의 차이에 집중하고 Keyspace 운영 내용을 중복하지 않는다.
- [x] `redisobject.ko.md`는 Value의 Data Type, 내부 Encoding과 Memory 표현에 집중한다.
- [x] Redis Scene의 기존 Node·Edge·Light Flow와 사용자가 직접 작성 중인 Scene 전체 설명은 이 분리에 필요한 범위를 벗어나 변경하지 않는다.

#### 기준 문서와 검증

- [x] `REQUIREMENTS.md`에서 설명 가능한 Area 사각형 전체의 선택과 내부 Node 우선을 명시한다.
- [x] `WORDS.md`에서 설명 가능한 Scene Area를 Label만이 아니라 사각형 전체를 선택하는 큰 Area Node형 요소로 설명한다.
- [x] `ARCHITECTURE.md`에 Area `contentRef`의 build-only 처리와 별도 설명 record를 유지하면서 Area hit area와 Node 우선순위를 반영한다.
- [x] `CONTENT_GUIDE.md`에 Area `contentRef` 작성법, 사각형 전체 선택과 Keyspace 예시를 반영한다.
- [x] Area Schema·Markdown load·Repository 조회의 기존 집중 테스트를 유지하고, 전체 hit area 선택과 내부 Node 우선을 검증하는 테스트를 추가하거나 갱신한다.
- [ ] `npm run content:build`, `npm run content:validate`, `npm run typecheck`, `npm run test`, `npm run lint`, `npm run build`와 `git diff --check`를 통과한다.
- [ ] 사용자가 Redis Scene에서 Keyspace 사각형의 Node 없는 부분을 클릭해 설명을 열고, 내부 Hash Table·Redis Object Node 선택이 Area보다 우선하는지 확인한다.

## 작성 계약

```yaml
edges:
  - id: client-hello
    from: browser
    to: server
    label: ClientHello

lightFlows:
  request-flow:
    label: 요청 흐름
    stages:
      - edges:
          - client-hello
      - edges:
          - [gateway, service-a]
          - [gateway, service-b]
      - edges:
          - [service-a, database]
          - [service-b, database]
```

- `lightFlows` key는 Scene 안에서 사용하는 kebab-case ID다.
- Edge의 `id`는 선택적인 kebab-case 작성 필드다. 같은 Scene의 Edge끼리 명시적 ID를 중복할 수 없고, ID가 없는 기존 Edge는 현재 순서 기반 runtime ID 생성 규칙을 그대로 사용한다.
- Flow가 하나면 `label`은 선택 사항이고 단일 버튼은 일관되게 `흐름 보기`로 표시한다.
- Flow가 여러 개면 모든 `label`이 필수이며 같은 Scene 안에서 중복할 수 없다.
- 문자열 참조는 같은 Scene의 명시적 Edge ID 하나를 정확히 선택한다. 없는 ID는 Content Build에서 거부한다.
- 기존 `[from, to]` 참조는 하위 호환으로 유지하며 동일한 방향의 기존 Scene Edge 하나를 모호함 없이 가리켜야 한다. 없는 Edge와 동일 Node 쌍의 중복 Edge 참조는 계속 거부한다.
- 같은 stage에서 ID와 `[from, to]`가 결과적으로 같은 Edge를 가리키는 경우를 포함해 동일 Edge를 중복 참조할 수 없다. 다른 stage에서 같은 Edge를 다시 사용하는 것은 허용한다.
- normalize 단계는 각 stage의 Edge ID만 runtime 데이터에 제공한다. 브라우저는 현재 stage의 Edge element에 이미 있는 `fromElementId`와 `toElementId`를 조회하고 중복을 제거해 source·target Node 집합을 계산한다. 계산 가능한 Node ID를 generated 데이터에 중복 저장하지 않는다.
- runtime Edge ID는 명시적 `id`가 있으면 그 값을 사용하고, 없으면 기존 `edge-{from}-{to}-{index}` 규칙을 사용한다. 명시적 ID 추가로 기존 ID 없는 Scene과 generated 계약을 바꾸지 않는다.
- 재생 시간은 출발·도착 점등이 함께 사용하는 `NODE_DURATION` 하나와 pulse 이동의 `EDGE_DURATION` 하나로 관리한다. phase 사이에 별도 settle 시간을 더하지 않으며, 이 화면 연출 값과 빛의 크기는 콘텐츠에 저장하지 않는다.

## 완료 조건

### 콘텐츠 계약과 검증

- [x] `scene.yaml` Schema가 선택적 `lightFlows` record, 선택적 `label`, 비어 있지 않은 `stages`/`edges` 배열을 위 작성 계약대로 검증한다.
- [x] 없는 Node나 Edge, 참조가 모호한 중복 Edge, 같은 stage의 중복 Edge, 여러 Flow의 누락된·중복 `label`을 정확한 YAML 경로와 함께 Content Build에서 거부한다.
- [x] normalize 단계가 작성자의 `[from, to]` 쌍을 안정적인 runtime Edge ID로 변환해 `Scene.lightFlows`에 보존한다.
- [x] shared `SceneLightFlowStage`와 generated content 계약은 `edgeIds`만 제공하며, source·target Node ID를 중복 저장하지 않는다. Edge layout 계약은 기존 경로를 재사용하므로 변경하지 않는다.
- [x] 브라우저가 현재 stage의 Edge ID로 Scene Edge를 찾고 `fromElementId`·`toElementId`를 각각 중복 제거해 source·target Node 집합을 계산한다.

### 명시적 Edge ID와 혼합 참조

- [x] Scene Edge Schema에 선택적 kebab-case `id`를 추가하고, 같은 Scene의 중복 명시적 ID를 각 `edges[index].id` YAML 경로와 함께 거부한다.
- [x] 명시적 ID와 ID 없는 Edge의 fallback ID까지 합친 runtime Edge ID가 충돌하지 않도록 검증해 generated element와 layout key의 유일성을 보장한다.
- [x] Light Flow stage의 Edge 참조가 명시적 Edge ID 문자열과 기존 `[from, to]` tuple을 함께 허용한다.
- [x] 문자열 참조는 정확히 같은 명시적 ID의 Edge로 해석하고, 없는 ID는 해당 `lightFlows.{flow}.stages[index].edges[index]` 경로에서 거부한다.
- [x] tuple 참조의 기존 Node 존재·Edge 존재·중복 방향 모호성 검증을 유지하고, 혼합 참조도 해석된 runtime Edge ID 기준으로 stage 내 중복을 거부한다.
- [x] normalize가 명시적 ID를 `SceneEdgeElement.id`와 `SceneLightFlowStage.edgeIds`에 그대로 보존하고, ID 없는 Edge의 기존 생성 규칙은 변경하지 않는다.
- [x] shared runtime type과 generated Scene 구조는 기존 `SceneEdgeElement.id`·`SceneLightFlowStage.edgeIds` 계약을 유지하고, layout 생성과 브라우저 lookup은 명시적 ID를 별도 분기 없이 기존 key로 사용한다.

### HTTPS Light Flow 콘텐츠

- [x] HTTPS Scene의 다섯 Browser↔Server handshake Edge에 순서가 드러나는 명시적 ID `tcp-handshake`, `tcp-connected`, `client-hello-key-share`, `server-hello-key-share`, `certificate-proof`를 부여한다.
- [x] HTTPS Scene에 단일 `https-handshake` Light Flow를 추가하고 다섯 Edge ID를 표시 번호 순서대로 각각의 stage에서 참조한다.
- [x] CA의 `Root CA 신뢰 기준`과 `Certificate 서명 발급` Edge는 handshake 메시지 순서가 아닌 지원 관계이므로 HTTPS Light Flow에 포함하지 않는다.
- [x] 반복되는 `browser → server`와 `server → browser` Edge 중 지정한 ID의 실제 layout 경로만 각 stage에서 점등·재생된다.

### 재생 상태와 UI

- [x] 현재 focused Scene의 Light Flow만 실행하며 Scene이 바뀌면 진행 중인 timer와 활성 stage를 취소하고 초기화한다.
- [x] 단일 Flow에서 `흐름 보기`/완료 후 `다시 보기` 버튼을 Scene 상단에 표시하고, 여러 Flow에서 각 `label`을 실행 버튼 이름으로 표시한다.
- [x] 재생 중에는 중복 실행을 막고 현재 Flow와 stage 진행 상태를 일관되게 표시한다. 흐름 재생은 Topic 선택과 URL을 변경하지 않는다.
- [x] 첫 stage와 비연속 restart는 `source 점등 → pulse 이동 → target 점등`으로 재생하고, 직전 target에서 이어지는 연속 stage는 source phase를 생략해 `pulse 이동 → target 점등`으로 재생한다.
- [x] 다음 stage의 모든 source Node가 직전 target Node 집합에 포함되는지 비교해 연속 여부를 계산한다. 일부 source만 새로 등장해도 해당 stage 전체를 비연속 restart로 처리한다.
- [x] 점등 시간은 출발·도착이 공유하는 `LIGHT_FLOW_NODE_DURATION_MS=1500`, pulse 시간은 `LIGHT_FLOW_EDGE_DURATION_MS=500`만 사용하며 별도 source/target 상수와 `+40ms` settle을 제거한다.
- [x] Edge phase는 pulse DOM이 먼저 mount되도록 animation frame을 지난 뒤 재생 timeout을 시작한다.
- [x] source 구간에는 stage의 모든 source Node를 동시에 점등하고, target 구간에는 모든 target Node를 동시에 점등한다. Node 점등 상태는 기존 선택·탐색 상태와 분리한다.
- [x] pulse 이동 구간에는 같은 stage의 모든 Edge pulse가 동시에 출발해 기존 polyline을 정확히 한 번만 따라간다. 반복 재생하지 않는다.
- [x] 분기에서는 source Node 하나에서 여러 pulse가 갈라지고, 합류에서는 여러 pulse가 target Node 하나로 모이는 결과가 runtime Node ID 집합과 Edge ID 집합대로 표시된다.
- [x] `SceneEdge`는 Content Build가 계산한 기존 polyline을 그대로 재사용해 원본 Edge 위에 moving light, halo와 glowing line을 덮어 그린다. pulse는 `repeatCount=1`로 한 번만 이동하고, 재생 token으로 remount해 다시 보기에서도 처음부터 재생한다. 별도 그래프 탐색은 추가하지 않는다.
- [x] Light Flow가 없는 Scene에는 기존 헤더·Edge DOM과 시각 결과에 불필요한 변화가 없다.
- [x] 흐름 재생은 Camera 이동 애니메이션과 충돌하지 않도록 Scene 이동 중 실행을 막고, 재생 중 Scene 이동을 요청하면 흐름을 취소한 뒤 기존 탐색을 정상 수행한다.
- [x] Root Scene에서 DNS 흐름 종료 뒤 `Browser → HTTPS`로 새로 시작하는 비연속 구간을 검토했다. 기존 Edge를 추가하거나 Flow를 나누지 않고, 현재 비연속 restart 규칙으로 Browser를 다시 점등해 다음 구간을 시작한다.

### 문서와 사용자 확인

- [x] `REQUIREMENTS.md`에 첫 시작·비연속 restart만 source를 점등하고 연속 stage는 source 점등을 생략하는 전이 규칙을 반영한다.
- [x] `ARCHITECTURE.md`에 runtime Edge lookup으로 source·target Node 집합과 stage 연속성을 계산하는 계약, 두 timing 상수와 Node·Edge overlay 렌더링 책임을 반영한다.
- [x] `WORDS.md`에 `Light Flow`를 Scene에 이미 있는 Edge를 단계별로 재생하는 흐름 연출로 정의한다.
- [x] `REQUIREMENTS.md`에 반복 Node 쌍의 특정 Edge를 선택할 수 있는 명시적 Edge ID와 기존 쌍 참조의 하위 호환 요구를 반영한다.
- [x] `ARCHITECTURE.md`에 optional 작성 ID, fallback runtime ID, 혼합 Light Flow 참조의 normalize·검증과 기존 generated/layout 계약 유지 방식을 반영한다.
- [x] `CONTENT_GUIDE.md`의 Edge와 Light Flow 작성 예시에 선택적 Edge ID, 문자열 참조와 기존 tuple 참조의 사용 기준을 추가한다.
- [x] `npm run content:build`, `npm run content:validate`, `npm run typecheck`, `npm run lint`, `npm run build`와 `git diff --check`를 통과한다. 새 자동 테스트 추가는 이번 범위에 포함하지 않는다.
- [ ] 사용자가 HTTPS Scene에서 다섯 handshake Edge가 번호 순서대로 각각 한 번 재생되고, 같은 방향의 다른 Edge가 함께 빛나지 않는지 확인한다.
- [x] 사용자가 브라우저에서 첫 source 점등, 연속 중간 Node의 target 점등 1회 뒤 즉시 다음 Edge 연결, 비연속 source 재점등, Edge당 pulse 1회, 분기·합류, 다시 보기와 Scene 이동 취소를 확인한다.

## 구현 순서

1. Scene Edge Schema와 검증에 optional 명시적 ID, runtime ID 유일성과 Light Flow의 ID·tuple 혼합 참조를 추가한다.
2. normalize가 명시적 ID와 기존 fallback ID를 같은 runtime Edge ID 계약으로 조립하도록 변경하고 generated/layout 소비 경계를 확인한다.
3. HTTPS의 다섯 handshake Edge에 ID를 부여하고 순서대로 실행하는 단일 Light Flow를 작성한다.
4. 요구사항·아키텍처·콘텐츠 작성 가이드를 새 작성 계약에 맞춘다.
5. 기본 typecheck, lint, content build·validate, application build와 diff check를 실행한다.
6. Root Scene의 비연속 구간을 기존 Edge 구조와 대조하고 필요한 콘텐츠 구조 변경은 사용자 범위 안에서만 반영한다.
7. 사용자가 HTTPS의 특정 Edge 순서와 기존 Light Flow 재생·취소 동작을 브라우저에서 확인한다.
8. Area Schema와 normalize에 선택적 설명 계약을 추가하고, Area Markdown을 별도 생성 record로 읽어 검증한다.
9. Content Repository와 Explanation selection을 Node와 Area를 구분하는 계약으로 확장한다.
10. focused Scene의 설명 가능한 Area 사각형 전체를 선택 가능하게 연결하고, 내부 Node를 Area보다 나중에 렌더링해 기존 pointer event가 우선하도록 유지한다.
11. Redis Keyspace Area에 설명을 연결하고 Keyspace·Hash Table·Redis Object 문서의 책임을 분리한다.
12. 요구사항·용어·아키텍처·콘텐츠 작성 가이드를 선택적인 Area 설명 계약에 맞춘다.
13. 집중 테스트와 전체 정적·콘텐츠·애플리케이션 검증을 실행한 뒤 사용자가 Redis Scene의 Area 전체 선택과 내부 Node 우선을 확인한다.

## 현재 상태

optional Edge ID, Node·Edge·fallback runtime ID 충돌 검증, 문자열 ID와 tuple 혼합 참조, 명시적 ID의 runtime·layout 보존을 구현했다. HTTPS의 다섯 handshake Edge에 ID를 부여하고 `https-handshake` Flow를 1→5 순서로 작성했으며 관련 기준 문서와 콘텐츠 작성 가이드도 갱신했다. 기본 content build·validate, typecheck, lint, application build와 diff check를 통과했다. 사용자가 HTTPS Scene에서 버튼과 다섯 pulse의 실제 재생 순서를 확인하는 일은 그대로 남아 있다.

설명 가능한 Scene Area의 Schema·생성 데이터·Repository와 Node/Area 선택 계약을 구현하고 Redis Keyspace 콘텐츠를 분리했다. 사용자가 승인한 변경에 따라 Label과 색칠된 Area 사각형 전체를 선택 영역으로 만들고, 내부 Node를 위에 렌더링해 기존 클릭 동작이 우선하도록 했다. `contentRef`가 없는 Area는 계속 비상호작용 요소다. Area 전체 클릭과 Node 우선에 맞춰 네 기준 문서와 집중 테스트도 갱신했으며 focused UI·Repository 테스트 7개, typecheck와 lint를 통과했다. 이전 content build·validate와 production build 통과 상태도 유지된다. 전체 테스트는 기존 Search/DNS fixture의 `undefined` 문제 1개 때문에 완료하지 못했고, 실제 브라우저 확인도 남아 있다. 현재 Viewport에 pointer drag/pan 기능이 없으므로 관련 임계값 처리는 이번 범위에 추가하지 않았다.
