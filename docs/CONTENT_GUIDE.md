# 콘텐츠 작성 가이드

`frontend/content`에 Scene, Topic 설명과 퀴즈를 작성하는 방법과 파일 형식을 설명한다.

## 무엇을 수정하면 되나요?

- Scene의 그림: `scene.yaml`
- Scene 전체 설명: `content.ko.md`
- Child Scene이 없는 Topic 설명: `<topic>.ko.md`
- Scene 퀴즈: `quiz.ko.yaml`
- Topic의 내부 구조: Child Scene 디렉터리와 `childSceneId`

## 작성 순서

1. 비슷한 기존 Scene을 찾는다.
2. YAML에 Topic과 Edge를 작성한다.
3. Markdown에 설명을 작성한다.
4. Parent Scene과 Child Scene 연결을 확인한다.
5. `frontend`에서 `npm run content:validate`를 실행한다.

제품 동작은 [제품 요구사항](./REQUIREMENTS.md), 용어는 [사용하는 단어](./WORDS.md)를 따른다.

## 파일 구조

```text
frontend/content/
├─ scenarios/<scenario>/scenario.yaml
└─ scenes/<scenario>/<scene-path>/
   ├─ scene.yaml
   ├─ content.ko.md
   ├─ quiz.ko.yaml
   └─ <topic>.ko.md
```

`quiz.ko.yaml`과 `<topic>.ko.md`는 필요할 때만 만든다. ID와 디렉터리 이름은 영문 소문자 kebab-case를 사용한다.

## Scenario 형식

Scenario는 처음 보여줄 Root Scene을 지정한다.

```yaml
id: google-com
rootSceneId: google-search-root
```

## Scene YAML 형식

```yaml
id: example-scene
title: Example 흐름
summary: 이 Scene이 보여주는 내용을 한 문장으로 설명합니다.

nodes:
  leaf-topic:
    label: 말단 Topic
    row: 3
    col: 1
    contentRef: leaf-topic.ko.md
  child-topic:
    label: Child Topic
    row: 3
    col: 2
    childSceneId: example-child-scene

edges:
  - from: leaf-topic
    to: child-topic
    label: 전달

areas:
  example-area:
    label: Example 영역
    row: 2
    col: 1
    rowSpan: 2
    colSpan: 2
```

- `id`: 중복되지 않는 영구 ID
- `title`: 화면에 표시할 Scene 제목
- `summary`: Scene을 설명하는 한 문장
- `nodes`: 화면에 배치할 Topic
- `edges`: Topic 사이의 흐름
- `areas`: 여러 Topic을 배경으로 묶을 때만 사용

Scene 제목은 `title`에만 작성하고 `content.ko.md`에서 반복하지 않는다.

### Topic

`row`, `col`은 1부터 5까지 사용한다. Topic을 넓게 표시할 때만 `rowSpan`, `colSpan`을 추가한다. Topic끼리 같은 Grid 영역을 차지할 수 없다.

Node에는 아래 항목 중 하나만 사용한다.

- `childSceneId`: 현재 Topic의 내부 Scene
- `navigateToSceneId`: 다른 위치에 있는 Scene
- `contentRef`: 같은 디렉터리의 Topic Markdown
- `description`: 별도 파일이 필요 없는 짧은 설명
- 아무 참조 없음: 설명 없음 상태

이동 필드와 설명 필드를 함께 사용하지 않는다. `contentRef`와 `description`도 함께 사용하지 않는다.

### Edge

- `from`, `to`: 연결할 Topic
- `label`: 한글 6자 안팎의 짧은 설명
- `variant`: 기본 흐름과 다를 때 `supporting` 또는 `return`
- `fromSide`, `toSide`, `labelSide`: 자동 배치가 어색할 때만 사용하는 방향

Side 값은 `top`, `right`, `bottom`, `left` 중 하나다. Edge는 화면에서 읽는 순서대로 작성한다.

### Scene Area

Scene Area는 `label`, `row`, `col`, `rowSpan`, `colSpan`을 가진다. 같은 범위의 Topic을 배경으로 묶을 때만 사용하며 클릭이나 이동 대상이 아니다.

## Markdown 형식

```markdown
# 한눈에 보기

이 Scene이 무엇을 보여주는지 짧게 설명합니다.

---

# 기본 개념

뒤의 흐름을 이해하기 위해 필요한 개념을 설명합니다.

---

# 구성 요소

- `Topic`: 현재 Scene에서 맡는 역할을 설명합니다.

---

# 동작 과정

1. 그림에 보이는 순서대로 설명합니다.

---

# 참고 자료

- [공식 문서](https://example.com)
```

- `# 한눈에 보기`는 항상 처음에 둔다.
- 필요하지 않은 Section은 생략한다.
- 흐름 제목은 `전체 흐름`, `처리 과정`처럼 바꿀 수 있다.
- Scene 설명은 그림 전체와 Topic의 관계를 설명한다.
- Topic 설명은 해당 Topic 하나에 집중한다.
- `# 참고 자료` 바로 위에는 `---`을 둔다.
- Markdown 표와 Raw HTML은 사용하지 않는다.
- Fenced Code Block은 실제 코드를 보여줘야 할 때만 사용한다.

## 퀴즈 형식

```yaml
- question: Key Share는 Session Key 자체인가요?
  answer: 아니요. Session Key를 만들기 위해 서로 공개하는 재료입니다.
```

- 질문 하나에는 내용 하나만 담는다.
- 답변은 결론부터 한두 문장으로 작성한다.
- 본문에 없는 핵심 정보를 퀴즈에서 처음 소개하지 않는다.

## 검증

`frontend` 디렉터리에서 `npm run content:validate`를 실행한다. 오류가 발생하면 안내된 파일과 필드를 먼저 확인한다.
