# 콘텐츠 형식

`frontend/content`를 작성하는 사람과 AI 에이전트가 함께 따르는 형식이다.

## 파일 구조

```text
frontend/content/
├─ scenarios/<scenario>/scenario.yaml
├─ scenes/<scenario>/<scene-path>/
│  ├─ scene.yaml
│  ├─ content.ko.md
│  ├─ quiz.ko.yaml                 # 선택
│  └─ <leaf-topic>.ko.md           # 선택
└─ concepts/<concept>/
   ├─ concept.yaml
   └─ content.ko.md
```

- ID와 디렉터리 이름은 영문 소문자 kebab-case를 사용한다.
- Scene 제목은 `scene.yaml`의 `title`만 단일 원본으로 사용하며 Markdown에서 반복하지 않는다.
- `contentRef`는 같은 Scene 디렉터리의 Markdown 파일만 가리킨다.

## Scenario

```yaml
id: google-com
rootSceneId: google-search-root
```

Scenario는 탐색을 시작할 Root Scene을 지정한다.

## Scene YAML

Scene YAML에는 `id`, `title`, `summary`, 선택적인 `areas`, `nodes`, `edges`만 작성한다.

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
    label: 자식 Topic
    row: 3
    col: 2
    childSceneId: example-child-scene
edges:
  - from: leaf-topic
    fromSide: right
    to: child-topic
    toSide: left
    label: 전달
```

- `id`: 중복되지 않는 영구 ID
- `title`: 화면에 표시할 Scene 제목
- `summary`: Scene이 보여주는 내용을 설명하는 한 문장
- `nodes`: 5×5 논리 격자에 배치하는 Topic
- `edges`: Topic 사이의 흐름이나 관계
- `areas`: 여러 Topic의 시각적인 소속 범위

### Topic

`row`, `col`, 선택적인 `rowSpan`, `colSpan`은 1부터 5까지다. Topic끼리 같은 격자 칸을 차지할 수 없다.

Topic은 다음 역할 중 하나만 가진다.

- `childSceneId`: 현재 Topic의 자식 Scene
- `navigateToSceneId`: 다른 위치에 존재하는 Scene
- `contentRef`: 같은 디렉터리의 말단 Topic Markdown
- `description`: 짧은 말단 설명
- 아무 참조 없음: 설명 없음 상태

이동 필드끼리 함께 사용하거나, 이동 필드와 설명 필드를 함께 사용할 수 없다. `contentRef`와 `description`도 함께 사용할 수 없다.

### Edge와 Area

- Edge는 `from`, `to`와 선택적인 `label`, `variant`, `fromSide`, `toSide`, `labelSide`를 가진다.
- `variant`는 `flow`, `supporting`, `return` 중 하나이며 기본 흐름이면 생략할 수 있다.
- Side 값은 `top`, `right`, `bottom`, `left` 중 하나다.
- Edge는 읽는 순서대로 작성하고 라벨은 가능하면 한글 6자 안팎으로 줄인다.
- Area는 `label`, `row`, `col`, `rowSpan`, `colSpan`을 가지며 클릭이나 이동 대상이 아니다.

## Markdown

Scene 설명인 `content.ko.md`는 다음 구성을 기본으로 한다. 필요 없는 섹션은 생략하고, 추가 섹션에는 내용을 바로 알 수 있는 제목을 사용한다.

```markdown
# 한눈에 보기

Scene의 목적을 짧게 설명합니다.

---

# 기본 개념

- 흐름을 이해하기 위한 선행 개념을 설명합니다.

---

# 구성 요소

- `Topic`: 현재 Scene에서 맡는 역할을 설명합니다.

---

# 동작 과정

1. World Viewport의 흐름과 같은 순서로 설명합니다.

---

# 참고 자료

- [공식 문서](https://example.com)
```

- `# 한눈에 보기`는 항상 맨 앞에 둔다.
- 흐름 제목은 내용에 따라 `동작 과정`, `전체 흐름`, `처리 과정` 등으로 바꿀 수 있다.
- 말단 Topic Markdown도 `# 한눈에 보기`로 시작하며 Topic 하나에 맞는 섹션만 사용한다.
- `# 참고 자료` 바로 위에는 `---`을 둔다.
- Markdown 표와 Raw HTML은 사용하지 않는다.

## 퀴즈

필요한 경우 같은 Scene 디렉터리에 `quiz.ko.yaml`을 만든다.

```yaml
- question: Key Share는 Session Key 자체인가요?
  answer: 아니요. Session Key를 만들기 위해 서로 공개하는 재료입니다.
```

각 항목에는 비어 있지 않은 `question`과 `answer`가 필요하다.

## 공통 Concept

공통 Concept는 `concept.yaml`과 해당 파일이 가리키는 Markdown으로 구성한다. `concept.yaml`에는 `id`, `slug`, `title`, `aliases`, `summary`, `status`, `contentRef`, `author`, `updatedAt`, `sources`를 작성한다.

- `status`: `draft`, `review`, `published`
- `sources.type`: `official`, `primary`, `secondary`

## 형식 검증

`frontend` 디렉터리에서 실행한다.

```bash
npm run content:validate
```
