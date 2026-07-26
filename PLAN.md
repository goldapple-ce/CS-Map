# PLAN

## 현재 상태

**문서 반영 및 성능 확인 완료 — 탐색 회귀 사용자 확인 대기**

## 이번 목표

현재 Scene 탐색에 필요한 콘텐츠만 로드하고, 중복 요청을 방지하며, 다음 이동 대상은 미리 준비하고, 화면 밖 Scene은 렌더링과 활성 데이터에서 제외한다. 최적화 전후를 비교할 수 있는 개발 측정값도 함께 제공한다.

## 포함한 요청

- 실제 콘텐츠 규모와 측정 결과를 확인한 뒤 성능 최적화를 진행하고 싶다.
- 현재 장면 중심 lazy loading을 적용하고 싶다.
- 인접 장면 prefetch를 적용하고 싶다.
- 화면 밖 장면 제거를 적용하고 싶다.
- Scene·Concept 중복 로드 방지와 cache 정책을 정하고 싶다.

## 통합 이유

현재 Scene 중심 로딩, 인접 Scene prefetch와 화면 밖 Scene 제거는 동일한 활성 Scene 집합을 기준으로 동작해야 한다. Scene·Concept 캐시는 lazy loading과 prefetch가 같은 모듈을 중복 요청하지 않게 하는 기반이며, 측정은 이 변경의 효과를 확인하는 기준이므로 다섯 요청을 하나의 작업으로 묶는다.

## 완료 조건

- 첫 진입 시 모든 route의 Scene을 일괄 로드하지 않는다.
- 직접 URL 접근 시 루트부터 현재 Scene까지의 조상 경로와 현재 Scene만 우선 로드해 같은 월드 위치를 복원한다.
- Scene YAML·Markdown·quiz와 Concept YAML·Markdown 요청은 진행 중 Promise와 완료 결과를 재사용한다.
- 실패한 요청은 cache에서 제거하여 다시 시도할 수 있다.
- 현재 Scene에서 이동 가능한 자식과 교차 이동 대상은 hover·keyboard focus 또는 브라우저 유휴 시간에 선택적으로 prefetch한다.
- prefetch는 화면 전환이나 카메라 이동을 일으키지 않는다.
- 현재 Viewport에 필요하지 않은 Scene은 DOM/SVG와 활성 Scene 집합에서 제외하되, 뒤로 가기 snapshot과 repository cache는 유지한다.
- 개발 환경에서 초기 Scene 요청 수, cache hit, prefetch와 현재 Scene 준비 시간을 비교할 수 있다.
- Semantic Zoom, 직접 URL, 뒤로 가기와 Explanation Panel 동작은 유지된다.

## 작업 순서

### 1단계 — 기준 측정과 로딩 경계 분리

- [x] 현재 콘텐츠 규모와 초기 일괄 로딩 기준값을 정리하고 개발 측정 지점을 추가한다.
- [x] route index의 부모 경로를 이용해 직접 URL에 필요한 조상 Scene과 현재 Scene만 계산한다.
- [x] 월드 배치가 전체 Scene 선로드에 의존하지 않고 현재 활성 Scene 집합으로 갱신되게 한다.

### 2단계 — cache와 현재 Scene 중심 lazy loading

- [x] Scene·Concept loader에 진행 중 Promise와 완료 결과를 공유하는 cache를 추가한다.
- [x] 실패 cache 제거와 개발용 cache/load 측정값을 추가한다.
- [x] `SceneViewport`와 `ExplanationPanel`이 동일한 repository 결과를 재사용하게 한다.

### 3단계 — 인접 Scene prefetch와 화면 밖 제거

- [x] 현재 Scene의 자식·교차 이동 대상에 hover·focus 및 유휴 prefetch를 연결한다.
- [x] 집중 Scene, 필요한 조상과 Viewport에 실제로 보이는 Scene만 렌더링하고 활성 집합에서 나머지를 제거한다.
- [x] prefetch된 데이터와 뒤로 가기 snapshot은 화면 밖 제거와 독립적으로 유지한다.

### 4단계 — 문서 반영과 사용자 확인

- [x] `REQUIREMENTS.md`와 `TECHNICAL_DESIGN.md`에 실제 로딩·cache·prefetch·가상화 정책을 반영한다.
- [x] 사용자가 초기 진입, 하위 Scene 이동, 직접 URL, 뒤로 가기와 설명 패널을 확인한다.
- [x] 사용자가 개발 측정값으로 초기 요청 감소와 중복 로드 방지를 확인한다.

## 필요한 요구사항 및 설계 변경

- `REQUIREMENTS.md`
  - 기존 성능 요구사항을 유지하고 cache 실패 재시도와 측정 가능 조건을 보완한다.
- `TECHNICAL_DESIGN.md`
  - 현재 경로 기반 활성 Scene 집합, Promise cache, 인접 Scene 정의, prefetch 시점, 화면 밖 Scene 제거와 개발 측정 방식을 구체화한다.

## 검증 및 확인 방법

- AI는 자동 테스트, 수동 테스트, 타입 검사, 빌드와 브라우저 검증을 실행하지 않는다.
- AI는 초기 `Promise.all(all routes)` 제거, cache 공유, 실패 제거, prefetch의 무상태성, 활성 Scene 집합 계산을 정적으로 확인한다.
- 사용자는 개발 화면과 브라우저 개발 도구에서 첫 진입 요청 수, Scene 준비 시간, cache hit와 prefetch를 확인한다.
- 사용자는 루트 탐색, 6단계 직접 URL, 연속 진입, 뒤로 가기와 Explanation Panel을 직접 확인한다.
- 사용자 확인 전에는 사용자 확인 체크박스를 완료 처리하지 않는다.

## 제외 범위

- 서버 또는 CDN cache 도입
- Service Worker와 오프라인 cache
- 이미지 최적화
- 애니메이션 시간과 시각 디자인 변경
- INBOX `메모`에 기록된 요청
