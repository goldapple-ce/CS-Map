# INBOX

## 다음 PLAN 후보

## 메모

- 토픽과 화살표 사이가 너무 붙어있어. 좀 떨어뜨려놔.
- lightFLow 자동 넣을까 고민중.

- 기존 Zod 오류 계약과 콘텐츠 신뢰 경계를 유지할 수 있는 범위에서 `parse*` wrapper를 축소한다.
- 실제 초기 로딩 병목이 측정되면 Scene별 generated module, dynamic import, module Promise cache와 인접 Scene prefetch를 복구하고 압축된 초기 JavaScript 크기와 실제 로딩 시간을 전후 비교한다.

- 카메라 애니메이션 중 `setCamera`로 `WorldRenderer` 전체를 매 프레임 다시 렌더링하는 구조를 개선한다. Scene 트리는 안정적으로 유지하고 `requestAnimationFrame`에서 SVG World `<g>`의 transform만 갱신하며, 애니메이션 중 임계값 기반 Scene mount/unmount를 막고 종료 시 React 카메라 상태를 동기화한다. 변경 전후 frame time과 dropped frame을 측정해 효과를 확인한다.
