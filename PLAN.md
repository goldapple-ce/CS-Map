# PLAN

## 현재 상태

**2단계 구현 완료 — 3단계 콘텐츠 마이그레이션 대기**

## 이번 목표

Scene 작성자가 구조와 흐름에 필요한 정보만 적도록 Scene YAML을 최소화한다. 중복 관계와 필수 메타데이터를 제거하고, 퀴즈는 선택적인 질문·답변 전용 파일로 분리하면서 기존 Semantic Zoom, URL, 목차 검색과 Explanation Panel 동작을 유지한다.

## 포함한 요청

- Scene YAML을 `id`, `summary`, `nodes`, `edges` 중심으로 단순화한다.
- `title`, `slug`, `scenarioId`, `parentId`, `status`, `ariaLabel`, `layout`, `contentRef`, `author`, `updatedAt`, `sources`와 사용하지 않는 빈 배열을 Scene YAML 필수 형식에서 제거한다.
- 꼭 필요한 참고 정보는 Markdown에 작성할 수 있게 하고 콘텐츠 메타데이터를 강제하는 규칙은 제거한다.
- Annotation, Group과 별도 Relationship 배열을 제거하고 node와 edge에서 공간 관계와 흐름을 표현한다.
- 퀴즈는 Scene YAML에서 분리한 선택적 `quiz.ko.yaml`에 질문과 답변만 작성한다.

## 새 Scene 작성 형식

```yaml
id: google-search-root
summary: 브라우저에 google.com을 입력하면 발생하는 흐름입니다.

nodes:
  user-browser:
    label: 사용자 / 브라우저
    row: 3
    col: 1
    childSceneId: google-com-user-browser

  server:
    label: Server
    row: 3
    col: 5
    childSceneId: google-com-server

edges:
  - from: user-browser
    to: server
    label: 요청 전달
```

- `nodes`의 key가 Scene 내부 node ID다.
- `childSceneId`는 현재 node 안에 중첩되는 자식 Scene을 가리킨다.
- `navigateToSceneId`는 월드의 다른 위치에 이미 존재하는 Scene으로 이동할 때만 사용한다.
- node `label`은 화면 표시 이름이며, `row`와 `col`은 1~5 논리 격자 셀이다.
- `edges`는 화면 연결선과 흐름 의미의 단일 원본이다.
- edge는 필요할 때만 `variant`, `fromSide`, `toSide` 힌트를 추가할 수 있다.
- Scene의 표시 제목은 같은 디렉터리 `content.ko.md`의 첫 번째 H1에서 읽는다.

## 새 퀴즈 작성 형식

Scene 디렉터리에 퀴즈가 있을 때만 `quiz.ko.yaml`을 추가한다.

```yaml
- question: Root DNS는 최종 서버 IP를 직접 반환하나요?
  answer: 일반적으로 다음으로 질의할 TLD DNS 정보를 안내합니다.

- question: 브라우저는 인증서에서 무엇을 확인하나요?
  answer: 인증서 체인, 도메인, 유효기간과 신뢰 여부를 확인합니다.
```

- 질문과 답변은 모두 필수다.
- 질문 ID, 선택지, 정답 선택지 ID와 별도 해설은 사용하지 않는다.
- `quiz.ko.yaml`이 없으면 해당 Scene에는 퀴즈가 없는 것으로 처리한다.

## 범위 결정

- Concept YAML과 Concept 로딩 구조는 이번 PLAN에서 변경하지 않는다.
- Scene YAML에는 작성자, 검토 상태, 수정일과 구조화된 출처를 저장하거나 강제하지 않는다.
- 기존 YAML의 출처 중 설명에 계속 필요한 링크는 선택적으로 Markdown의 참고 자료 섹션으로 옮기되 필수 스키마로 검증하지 않는다.
- 기존 Annotation에 있던 필수 설명은 Markdown 본문으로 옮기고 지도 Annotation 렌더링은 제거한다.
- Group 영역과 `groupId`는 제거하며 node의 5×5 논리 격자 위치만 유지한다.
- `contains`는 `childSceneId`, 교차 이동은 `navigateToSceneId`, 흐름은 `edges`에서 자동 도출한다.
- `related`, `prerequisite`, `used-by` 등 별도 Relationship 모델은 Scene 작성 형식과 렌더링에서 제거한다.
- 모든 존재하는 Scene 파일은 탐색 가능한 콘텐츠로 간주하고, 준비 중 Topic은 자식 Scene 파일 없이 node 상태로만 표시한다.
- Scene 제목, 부모, 자식 순서와 URL은 Markdown H1, node key, `childSceneId`와 디렉터리 구조를 이용해 결정적으로 생성한다.
- 기존 `/explore/google-com` 경로와 제작된 하위 경로는 유지하고 직접 URL 접근과 목차 검색을 깨뜨리지 않는다.

## 완료 조건

### Scene YAML

- 모든 Scene YAML이 `id`, `summary`, `nodes`, `edges` 중심의 새 형식으로 변환된다.
- node ID를 별도 `id` 필드로 반복하지 않고 `nodes` mapping key로 한 번만 작성한다.
- node 위치는 중첩된 `grid` 객체 없이 `row`, `col`로 직접 작성한다.
- child Scene, 교차 이동과 edge 정보가 별도 Relationship에 중복되지 않는다.
- Annotation, Group, Relationship와 Scene 메타데이터 필드가 새 Scene 스키마와 모든 Scene YAML에서 제거된다.
- 사용하지 않는 빈 배열을 Scene YAML에 작성하지 않는다.

### 파생 데이터와 기존 동작

- Markdown 첫 H1에서 Scene 제목을 읽고, `summary`를 기본 접근성 설명으로 사용한다.
- `childSceneId`를 역으로 해석해 부모 Scene과 목차 순서를 자동 계산한다.
- node key와 콘텐츠 디렉터리 구조로 기존 canonical URL을 결정적으로 생성한다.
- 개발 중 `scene.yaml`, `content.ko.md`, `quiz.ko.yaml` 저장 시 생성 인덱스와 화면이 자동 갱신된다.
- 기존 5×5 배치, 직교 edge routing, port side hint와 카메라 bounds 계산이 유지된다.
- 기존 Topic 클릭, 교차 이동, 목차 계층·검색, 직접 URL과 뒤로 가기가 유지된다.

### 퀴즈

- 기존 객관식 퀴즈 데이터가 질문·답변 형식의 `quiz.ko.yaml`로 이동한다.
- 질문에는 `정답 보기` 동작이 제공되고 선택하면 답변이 공개된다.
- 질문별 공개 상태는 현재 화면에서만 유지하며 점수, 정답 판정과 기록을 저장하지 않는다.
- 퀴즈 파일이 없는 Scene은 기존처럼 퀴즈 없음 상태를 안전하게 표시한다.
- 키보드로 질문을 이동하고 정답을 공개할 수 있다.

### 규칙과 문서

- `AGENTS.md`에서 게시 콘텐츠의 작성자·검토 상태·수정일·출처를 강제하는 규칙을 제거한다.
- `REQUIREMENTS.md`에서 콘텐츠 상태 파이프라인, 필수 메타데이터와 객관식 퀴즈 요구사항을 새 형식에 맞게 수정한다.
- `TECHNICAL_DESIGN.md`에서 Scene 저장 구조, 파생 필드, 로딩·검증·퀴즈 구조를 새 형식에 맞게 수정한다.
- `GLOSSARY.md`의 Scene Element 설명에서 제거된 Annotation과 Group을 정리한다.

## 작업 순서

### 1단계 — 영구 문서와 최소 스키마 확정

- [x] `AGENTS.md`, `REQUIREMENTS.md`, `TECHNICAL_DESIGN.md`, `GLOSSARY.md`에서 메타데이터·객관식 퀴즈·Annotation·Group·Relationship 규칙을 새 결정에 맞게 수정한다.
- [x] 최소 Scene YAML, 선택적 edge 힌트와 질문·답변 `quiz.ko.yaml` 스키마를 구현한다.

### 2단계 — 파서·생성 파이프라인 전환

- [x] Markdown H1, Scene 디렉터리, node key와 `childSceneId`에서 제목·부모·순서·URL을 파생하도록 콘텐츠 빌드와 repository를 전환한다.
- [x] 새 node·edge 형식을 기존 레이아웃과 World renderer가 사용할 정규화 데이터로 변환하고 Annotation·Group·Relationship 의존성을 제거한다.
- [x] Vite 개발 감시 대상에 `content.ko.md`와 `quiz.ko.yaml`을 포함한다.

### 3단계 — 전체 콘텐츠와 퀴즈 마이그레이션

- [ ] 모든 Scene YAML을 최소 형식으로 변환하고 기존 필수 Annotation 설명과 참고 링크를 필요한 Markdown으로 이동한다.
- [ ] 기존 퀴즈를 `quiz.ko.yaml` 질문·답변 형식으로 옮기고 Explanation Panel의 퀴즈 UI를 `정답 보기` 방식으로 변경한다.
- [ ] 기존 생성 인덱스를 새 파이프라인 결과와 맞게 갱신한다.

### 4단계 — 사용자 확인

- [ ] 사용자가 대표 Scene YAML과 퀴즈 파일이 원하는 최소 형식인지 확인한다.
- [ ] 사용자가 루트부터 하위 Topic 이동, 레이아웃, 화살표와 목차 검색을 확인한다.
- [ ] 사용자가 퀴즈 정답 보기와 직접 URL·뒤로 가기를 확인한다.

## 필요한 요구사항 및 설계 변경

- `AGENTS.md`
  - 콘텐츠 메타데이터 강제 규칙을 제거하고 Scene YAML 최소 작성 원칙을 추가한다.
- `REQUIREMENTS.md`
  - 작성자·검토 상태·수정일·출처 필수 요구사항과 상태 전환을 제거한다.
  - 객관식 채점형 퀴즈를 질문·답변 공개형 자기 점검으로 변경한다.
  - Annotation, Group과 별도 Relationship이 없는 Scene 작성 모델을 반영한다.
- `TECHNICAL_DESIGN.md`
  - Authoring Scene schema와 런타임 정규화 데이터의 경계를 정의한다.
  - Markdown H1과 Scene 구조에서 파생 데이터를 생성하는 빌드 파이프라인을 반영한다.
  - 선택적 `quiz.ko.yaml` 로딩과 질문·답변 UI 상태를 반영한다.
- 콘텐츠
  - 모든 Scene YAML과 기존 퀴즈를 새 형식으로 일괄 변환한다.
  - 필수 설명과 필요한 참고 링크는 Markdown으로 이동한다.

## 검증 및 확인 방법

- AI는 자동 테스트, 콘텐츠 검증 명령, 타입 검사, 빌드와 브라우저 검증을 실행하지 않는다.
- AI는 새 스키마 필드, 파생 관계, 참조 무결성, URL 생성과 전체 콘텐츠 변환 결과를 정적으로 확인한다.
- 사용자는 개발 화면에서 Scene 저장 즉시 반영, 대표 흐름, 목차 검색, 직접 URL, 뒤로 가기와 퀴즈 정답 공개를 직접 확인한다.
- 사용자 확인 전에는 4단계 체크박스를 완료 처리하지 않는다.

## 제외 범위

- Concept YAML과 Concept 설명 구조 변경
- 회원별 퀴즈 점수, 진도, 정답 기록과 통계
- 객관식 선택지, 자동 채점과 복수 정답
- Scene 본문 전문 검색
- INBOX `메모`에 기록된 요청
