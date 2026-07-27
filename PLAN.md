# PLAN

## 현재 상태

**3단계 구현 및 문서 반영 완료 — 사용자 확인 대기**

## 이번 목표

하위 Scene이나 교차 이동 대상이 없는 말단 Topic에 개별 설명을 작성하고, Topic 클릭 시 URL과 카메라는 유지한 채 Explanation Panel에서 해당 설명을 표시한다.

## 포함한 요청

- 말단 Topic node에 `description` 또는 `contentRef`로 개별 설명을 작성하고 싶다.
- 작성한 말단 Topic 설명이 클릭 시 Explanation Panel에 표시되어야 한다.

## 완료 조건

- 말단 node는 짧은 Markdown 문자열인 `description` 또는 같은 Scene 디렉터리의 Markdown 파일을 가리키는 `contentRef` 중 하나를 선택적으로 가질 수 있다.
- `description`과 `contentRef`를 동시에 작성하면 콘텐츠 검증에서 명확한 오류를 제공한다.
- `contentRef`는 Scene 디렉터리를 벗어나지 않는 안전한 상대 경로만 허용한다.
- 말단 Topic을 클릭하면 URL과 카메라를 변경하지 않고 해당 설명을 Explanation Panel에 표시한다.
- 설명이 없는 말단 Topic은 기존의 명시적인 설명 없음 상태를 유지한다.
- Topic Markdown은 Scene 전체 Markdown과 같은 renderer 및 보안 정책을 사용한다.
- Topic 설명 Markdown은 해당 Topic을 선택할 때 lazy load하고 진행 중 요청과 완료 결과를 재사용한다.

## 작업 순서

### 1단계 — 작성 스키마와 런타임 모델

- [x] Scene node에 선택적 `description`과 `contentRef`를 추가하고 둘의 동시 사용 및 안전하지 않은 경로를 검증한다.
- [x] 작성 데이터를 런타임 `SceneNodeElement`로 정규화하고 기존 Scene 작성 형식과 생성 인덱스를 유지한다.

### 2단계 — Topic 설명 로딩과 표시

- [x] repository에 선택 Topic 설명 loader와 Promise cache를 추가한다.
- [x] Explanation Panel이 선택된 말단 Topic의 inline 또는 Markdown 설명을 표시하고 로딩·실패·설명 없음 상태를 구분한다.
- [x] Topic 선택 해제와 Scene 변경 시 기존 Scene 전체 설명으로 정상 복귀한다.

### 3단계 — 문서 반영

- [x] `REQUIREMENTS.md`에 말단 Topic 설명 작성과 표시 동작을 반영한다.
- [x] `TECHNICAL_DESIGN.md`에 node 설명 스키마, 상대 경로, lazy loading과 cache 정책을 반영한다.

### 4단계 — 사용자 확인

- [ ] 사용자가 `description` Topic과 `contentRef` Topic의 표시를 확인한다.
- [ ] 사용자가 설명 없음 상태, Scene 설명 복귀, URL·카메라 유지와 저장 즉시 반영을 확인한다.

## 작성 형식

짧은 설명:

```yaml
nodes:
  authorization-filter:
    label: AuthorizationFilter
    row: 2
    col: 4
    description: 요청에 필요한 권한과 현재 인증 정보를 비교합니다.
```

긴 설명:

```yaml
nodes:
  authorization-filter:
    label: AuthorizationFilter
    row: 2
    col: 4
    contentRef: authorization-filter.ko.md
```

`authorization-filter.ko.md`는 해당 `scene.yaml`과 같은 디렉터리에 둔다.

## 필요한 요구사항 및 설계 변경

- `REQUIREMENTS.md`
  - 말단 Topic은 선택적으로 개별 설명을 가질 수 있고, 클릭 시 Explanation Panel에서 표시한다.
- `TECHNICAL_DESIGN.md`
  - node의 `description`·`contentRef` 상호 배타 규칙, 안전한 상대 경로, 선택 시 lazy loading과 Promise cache를 정의한다.

## 검증 및 확인 방법

- AI는 자동 테스트, 수동 테스트, 타입 검사, 빌드와 브라우저 검증을 실행하지 않는다.
- AI는 스키마 정규화, 상대 경로 제한, loader cache와 Explanation Panel 상태 분기를 정적으로 확인한다.
- 사용자는 inline 설명, Markdown 설명, 설명 없음, 선택 해제와 저장 즉시 반영을 직접 확인한다.
- 사용자 확인 전에는 사용자 확인 체크박스를 완료 처리하지 않는다.

## 예상 변경 파일

- `frontend/src/content/schemas.ts`
- `frontend/src/domain/content-types.ts`
- `frontend/src/content/repository.ts`
- `frontend/src/content/file-repository.ts`
- `frontend/src/features/explanation/ExplanationPanel.tsx`
- `REQUIREMENTS.md`
- `TECHNICAL_DESIGN.md`
- `PLAN.md`

## 제외 범위

- 자식 또는 교차 이동 대상이 있는 Topic의 클릭 동작 변경
- Topic별 퀴즈
- raw HTML 또는 MDX 실행
- Scene YAML의 최상위 구조 변경
- INBOX `메모`에 기록된 요청
