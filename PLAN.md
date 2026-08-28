# Scene Light Flow

## 목표

Scene 작성자가 기존 Edge를 이어 Light Flow를 정의하고, 사용자가 World Viewport 상단의 버튼을 누르면 `첫 출발 Node 점등 → Edge pulse 1회 이동 → 도착 Node 점등`이 전기처럼 이어지는 흐름 시각화를 제공한다. 다음 stage가 직전 도착 Node에서 이어지면 출발 점등을 반복하지 않고 바로 Edge pulse를 보내며, 비연속 stage에서만 출발 Node를 다시 점등한다. 같은 단계의 Edge pulse는 동시에 한 번만 이동해 분기와 합류를 표현하며, Light Flow가 없는 Scene의 화면은 바꾸지 않는다.

## 선택한 요청

- Scene YAML에 선택적인 `lightFlows`를 작성한다.
- Light Flow는 순서가 있는 `stages`를 갖고, 각 stage는 현재 Scene에 존재하는 `[from, to]` Edge 쌍을 하나 이상 갖는다.
- 첫 stage와 비연속으로 다시 시작하는 stage는 source Node를 먼저 점등하고, 같은 stage의 모든 Edge에서 pulse를 정확히 한 번 동시에 이동시킨 뒤 target Node를 점등한다.
- 다음 stage의 모든 source Node가 직전 stage의 target Node 집합에 포함되면 연속 stage로 판단하고 source phase를 생략한 채 바로 Edge pulse를 보낸다. 하나라도 직전 target에 없는 source Node가 있으면 비연속 restart로 보고 source phase를 재생한다.
- 분기에서는 한 source Node에서 여러 pulse가 갈라져 각 target Node에 도착하고, 합류에서는 여러 source Node의 pulse가 하나의 target Node로 모인다.
- 같은 Edge 안에서 pulse를 반복 재생하지 않는다.
- Light Flow가 하나면 `흐름 보기` 버튼을 보이고, 재생 완료 후 `다시 보기`로 다시 실행할 수 있게 한다.
- Light Flow가 여러 개면 각 Flow의 `label`을 서로 구분되는 실행 버튼 이름으로 사용한다.
- Light Flow가 없는 Scene에서는 버튼과 애니메이션 요소를 렌더링하지 않는다.
- Light Flow는 기존 Edge layout을 따라가는 요청 시점의 연출이며, Edge 관계나 Scene 탐색 상태를 바꾸지 않는다.

## 작성 계약

```yaml
lightFlows:
  request-flow:
    label: 요청 흐름
    stages:
      - edges:
          - [client, gateway]
      - edges:
          - [gateway, service-a]
          - [gateway, service-b]
      - edges:
          - [service-a, database]
          - [service-b, database]
```

- `lightFlows` key는 Scene 안에서 사용하는 kebab-case ID다.
- Flow가 하나면 `label`은 선택 사항이고 단일 버튼은 일관되게 `흐름 보기`로 표시한다.
- Flow가 여러 개면 모든 `label`이 필수이며 같은 Scene 안에서 중복할 수 없다.
- 각 `[from, to]`는 동일한 방향의 기존 Scene Edge 하나를 모호함 없이 참조해야 한다. 없는 Edge와 동일 노드 쌍의 중복 Edge 참조는 Content Build에서 거부한다.
- 같은 stage에서 동일 Edge를 중복해 적을 수 없다. 다른 stage에서 같은 Edge를 다시 사용하는 것은 허용해 반복 흐름을 표현한다.
- normalize 단계는 각 stage의 Edge ID만 runtime 데이터에 제공한다. 브라우저는 현재 stage의 Edge element에 이미 있는 `fromElementId`와 `toElementId`를 조회하고 중복을 제거해 source·target Node 집합을 계산한다. 계산 가능한 Node ID를 generated 데이터에 중복 저장하지 않는다.
- 재생 시간은 출발·도착 점등이 함께 사용하는 `NODE_DURATION` 하나와 pulse 이동의 `EDGE_DURATION` 하나로 관리한다. phase 사이에 별도 settle 시간을 더하지 않으며, 이 화면 연출 값과 빛의 크기는 콘텐츠에 저장하지 않는다.

## 완료 조건

### 콘텐츠 계약과 검증

- [x] `scene.yaml` Schema가 선택적 `lightFlows` record, 선택적 `label`, 비어 있지 않은 `stages`/`edges` 배열을 위 작성 계약대로 검증한다.
- [x] 없는 Node나 Edge, 참조가 모호한 중복 Edge, 같은 stage의 중복 Edge, 여러 Flow의 누락된·중복 `label`을 정확한 YAML 경로와 함께 Content Build에서 거부한다.
- [x] normalize 단계가 작성자의 `[from, to]` 쌍을 안정적인 runtime Edge ID로 변환해 `Scene.lightFlows`에 보존한다.
- [x] shared `SceneLightFlowStage`와 generated content 계약은 `edgeIds`만 제공하며, source·target Node ID를 중복 저장하지 않는다. Edge layout 계약은 기존 경로를 재사용하므로 변경하지 않는다.
- [x] 브라우저가 현재 stage의 Edge ID로 Scene Edge를 찾고 `fromElementId`·`toElementId`를 각각 중복 제거해 source·target Node 집합을 계산한다.

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
- [ ] Root Scene에서 DNS 흐름 종료 뒤 `Browser → HTTPS`로 새로 시작하는 비연속 구간을 검토한다. 기존에 없는 연결을 애니메이션이 임의로 만들지 않으며, 실제 Edge 추가 또는 별도 Light Flow 분리는 사용자 요청 범위 안에서만 결정한다.

### 문서와 사용자 확인

- [x] `REQUIREMENTS.md`에 첫 시작·비연속 restart만 source를 점등하고 연속 stage는 source 점등을 생략하는 전이 규칙을 반영한다.
- [x] `ARCHITECTURE.md`에 runtime Edge lookup으로 source·target Node 집합과 stage 연속성을 계산하는 계약, 두 timing 상수와 Node·Edge overlay 렌더링 책임을 반영한다.
- [x] `WORDS.md`에 `Light Flow`를 Scene에 이미 있는 Edge를 단계별로 재생하는 흐름 연출로 정의한다.
- [ ] 사용자가 브라우저에서 첫 source 점등, 연속 중간 Node의 target 점등 1회 뒤 즉시 다음 Edge 연결, 비연속 source 재점등, Edge당 pulse 1회, 분기·합류, 다시 보기와 Scene 이동 취소를 확인한다.

## 구현 순서

1. 현재 stage의 Edge element에서 source·target Node ID 집합을 계산한다.
2. 첫 stage·비연속 restart와 연속 stage를 구분하고, 연속 stage의 source phase를 생략하도록 재생 전이를 바꾼다.
3. timing을 공용 Node 점등 상수와 Edge pulse 상수로 단순화하고 별도 settle 시간을 제거한다.
4. Root Scene의 비연속 구간을 기존 Edge 구조와 대조하고 필요한 콘텐츠 구조 변경은 사용자 범위 안에서만 반영한다.
5. 요구사항과 아키텍처를 실제 연속·비연속 전이 계약에 맞춘다.
6. 사용자가 브라우저에서 단일·복수 Flow와 연속 중간 Node 1회 점등, 비연속 restart, 재생·취소 동작을 확인한다.

## 현재 상태

Light Flow의 YAML 검증, Edge ID normalize, 실행 버튼, Scene 이동 취소와 다시 보기, Node·Edge·Node 표현을 구현했다. 첫 stage와 비연속 restart에서만 source를 점등하고, 직전 target에서 이어지는 stage는 source를 다시 점등하지 않고 바로 Edge pulse로 진행한다. timing은 Node 1500ms와 Edge 500ms 두 상수로 통합했고, Edge pulse가 mount된 다음 timeout을 시작하도록 맞췄다. 기준 문서를 현재 동작에 맞췄으며 Root Scene 비연속 구간 검토와 사용자 최종 확인만 남아 있다.
