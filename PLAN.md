# Scene 탐색 스냅샷 제거

## 목표

사용자가 조작하지 않는 Camera와 동작하지 않는 Topic 포커스 복원 상태를 저장하지 않고, Scene과 현재 Viewport만으로 Camera를 계산하는 단순한 탐색 구조로 바꾼다.

## 선택한 요청

- `exploration-memory.ts`와 Scene별 Camera·포커스 snapshot을 모두 제거한다.
- 하위 Scene 진입과 뒤로가기에서 이전 Camera, 선택 Topic 또는 Scene 제목으로 포커스를 복원하지 않는다.
- Scene 이동 요청은 대상 Scene ID만 전달하고 Camera·element ID를 전달하지 않는다.
- Camera는 현재 Scene layout과 현재 Viewport 크기로 자동 배치한다.
- Scene 이동 중 중복 입력을 막는 navigation lock과 Camera 전환 animation은 유지한다.
- 사용자가 나눈 `useViewportCamera` Effect를 기준으로 snapshot 복원 분기와 보조 Ref를 제거하고, Scene 변경·Viewport 변경에 맞춰 자동 배치하는 단순한 Effect 구조로 정리한다.

## 완료 조건

- [x] `exploration-memory.ts`, `SceneSnapshot`, snapshot 조회·저장 코드가 제거된다.
- [x] `SceneNavigationRequest`를 제거하거나 대상 Scene ID만 받는 단순한 계약으로 바꾼다.
- [x] `useSceneNavigation`에서 `currentCameraRef`, `returningRef`, `previousSceneIdRef`, `captureScene`, route 깊이 비교와 DOM `focus()` 처리를 제거한다.
- [x] `SceneViewport`와 `ExplorerShell`에서 Camera 변경 callback 및 snapshot용 prop 전달을 제거한다.
- [x] `useViewportCamera`에서 snapshot 복원, `cameraSceneIdRef`, `previousViewportRef`와 주석 처리된 이전 구현을 제거한다.
- [x] Scene 변경과 Viewport 크기 변경 모두 현재 layout·Viewport 기준 Camera 자동 배치가 적용된다.
- [x] navigation lock, animation, reduced motion과 Scene 진입·검색 이동·뒤로가기 동작은 유지된다.
- [x] 요구사항과 아키텍처에서 Camera·선택 Topic·포커스 snapshot 복원 계약과 관련 책임을 제거하고 실제 동작을 설명한다.
- [x] 관련 테스트를 삭제하거나 현재 계약에 맞게 갱신하고 타입 검사와 관련 테스트를 실행한다.
- [ ] 사용자가 Scene 이동·뒤로가기·패널 크기 변경 후 Camera 자동 배치를 확인한다.

## 구현 순서

1. 탐색 snapshot 모듈과 Camera·포커스 저장 타입을 제거한다.
2. `useSceneNavigation`, `SceneViewport`, `ExplorerShell` 사이의 이동·Camera callback 계약을 단순화한다.
3. `useViewportCamera`를 현재 Scene과 Viewport 기준 자동 배치로 정리한다.
4. 요구사항·아키텍처와 관련 테스트를 현재 계약에 맞춘다.
5. 타입 검사와 관련 테스트 후 사용자가 실제 탐색과 resize 동작을 확인한다.

## 현재 상태

Camera snapshot과 Topic·제목 포커스 복원 제거를 완료했다. 타입 검사와 전체 테스트를 통과했으며, 실제 Scene 이동·뒤로가기·패널 크기 변경 확인만 남아 있다.
