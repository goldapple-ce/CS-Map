# Content Repository API 축소

## 목표

생성 데이터를 단순히 다시 감싸는 API를 없애고, 조회·검증 책임이 있는 API만 남긴다.

## 범위와 완료 조건

- [x] `getSceneMap`, `getRootSceneId`, `listRoutes`를 제거하고 사용처를 `getScene` 또는 generated data 접근으로 전환한다.
- [x] `findRoute`, `getScene`, `getTopicExplanation`은 URL 조회, unknown Scene·Topic 검증 책임으로 유지한다.
- [x] Content Repository 설명과 실제 API가 일치하도록 아키텍처 문서를 수정한다.
- [x] 관련 테스트를 축소된 API에 맞게 수정하고 타입 검사로 확인한다.

## 구현 순서

1. 중복 API 사용처를 전환한다.
2. Repository와 테스트에서 불필요한 API를 제거한다.
3. 아키텍처 문서를 갱신하고 타입 검사를 실행한다.

## 현재 상태

완료
