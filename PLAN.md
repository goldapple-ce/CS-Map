# PLAN

## 이번 목표

하나의 5×5 Scene 안에서 여러 Topic의 소속 범위를 보여주는 비상호작용 `Area`를 지원한다.

## 포함한 요청

- 큰 `Spring Security` 또는 `JVM` 박스 안에 여러 Topic을 동시에 표시하고 싶다.
- Area는 하위 Scene 미리보기나 Semantic Zoom 대상이 아니라 현재 Scene의 배경 영역이어야 한다.
- Area 안의 실제 Topic은 기존처럼 각각 클릭할 수 있어야 한다.

이번 요청은 `INBOX.md`가 아니라 사용자가 대화에서 직접 확정한 요청이다. 따라서 INBOX에서 제거할 항목은 없다.

## 완료 조건

- Scene YAML에 선택적인 `areas` 컬렉션을 작성할 수 있다.
- 각 Area는 `label`, `row`, `col`, `rowSpan`, `colSpan`으로 5×5 격자 안의 범위를 지정한다.
- 격자 범위를 벗어나거나 크기가 올바르지 않은 Area는 콘텐츠 검증에서 거부된다.
- Area는 Topic과 edge 뒤에 테두리와 제목이 있는 배경 영역으로 표시된다.
- Area 자체는 클릭, 포커스, URL 변경 또는 카메라 이동을 발생시키지 않는다.
- Area 안의 Topic과 edge는 기존 탐색 및 연결 동작을 그대로 유지한다.
- Area는 edge routing 장애물로 취급하지 않는다.
- 기존 Scene YAML은 `areas` 없이 동일하게 동작한다.
- Area가 정식 콘텐츠 모델임을 요구사항, 기술 설계, 용어 및 프로젝트 규칙에 반영한다.

## 작업 순서

- [x] 1. Area의 제품 의미, YAML 형식과 기존 Group 금지 규칙의 예외 범위를 문서에 반영
- [x] 2. Area 작성 스키마, 격자 범위 검증 및 런타임 타입 추가
- [x] 3. Area 배경 렌더러를 추가하고 일반 Scene과 World 렌더링 순서에 연결
- [x] 4. 기존 콘텐츠·탐색·edge routing과 분리되어 동작하는지 구현 점검
- [ ] 5. 사용자가 Area 작성, 표시와 Topic 클릭 동작을 확인

## 필요한 요구사항 및 설계 변경

- `AGENTS.md`: Scene YAML 허용 필드에 `title`과 `areas`를 반영하고, 금지 대상은 임의 Group 컬렉션이되 격자 기반 비상호작용 Area는 허용하도록 정정한다.
- `REQUIREMENTS.md`: 현재 Scene의 Topic 소속 범위를 나타내는 Area 요구사항과 비상호작용 원칙을 추가한다.
- `TECHNICAL_DESIGN.md`: Area 스키마, 격자 좌표 변환, 렌더링 순서 및 edge router 비관여를 추가한다.
- `GLOSSARY.md`: `Scene Area — Scene 영역` 용어를 추가한다.

## 수정 예정 파일

- `AGENTS.md`
- `REQUIREMENTS.md`
- `TECHNICAL_DESIGN.md`
- `GLOSSARY.md`
- `frontend/src/domain/content-types.ts`
- `frontend/src/content/schemas.ts`
- `frontend/src/components/scene/SceneArea.tsx` 신규
- `frontend/src/components/scene/SceneRenderer.tsx`
- `frontend/src/components/scene/WorldRenderer.tsx`
- `PLAN.md`

사용자가 작업 중인 `frontend/content/scenes/google-com/server/java/**` 콘텐츠는 수정하지 않는다.

## 검증 및 테스트 방법

테스트 실행은 사용자가 담당한다.

- Area가 없는 기존 Scene이 이전과 동일하게 표시되는지 확인한다.
- 5×5 안에 Area를 작성하고 지정한 Topic 뒤에 박스와 제목이 표시되는지 확인한다.
- Area 내부 Topic 클릭 시 기존 설명 또는 Semantic Zoom 동작이 유지되는지 확인한다.
- Area 빈 공간을 클릭해도 URL, 카메라와 Explanation Panel이 바뀌지 않는지 확인한다.
- Area 안의 edge가 박스 경계를 장애물로 우회하지 않고 기존 경로를 유지하는지 확인한다.
- `row + rowSpan - 1` 또는 `col + colSpan - 1`이 5를 넘는 잘못된 Area가 거부되는지 확인한다.

## 현재 진행 상태

▶ 현재: 5. 사용자 검증 대기
