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
└─ scenes/
   ├─ scene.yaml
   ├─ content.ko.md
   └─ <child-scene>/
      ├─ scene.yaml
      ├─ content.ko.md
      ├─ quiz.ko.yaml
      └─ <topic>.ko.md
```

`quiz.ko.yaml`과 `<topic>.ko.md`는 필요할 때만 만든다. Scene ID는 `content/scenes` 아래에서 `scene.yaml` 부모까지의 상대 폴더 경로를 `-`로 연결해 자동으로 정하므로 YAML에 따로 작성하지 않는다. 예를 들어 `scenes/server/spring/scene.yaml`의 ID는 `server-spring`이다. 각 폴더명은 영문 소문자 kebab-case여야 하며, 서로 다른 경로가 같은 ID를 만들 수 없다. 고정 시작점인 `scenes/scene.yaml`의 Root Scene ID만 `enter-google`이다.

## Scene YAML 형식

```yaml
title: Example 흐름
summary: 이 Scene이 보여주는 내용을 한 문장으로 설명합니다.
keywords: [검색 별칭, abbreviation]

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
    contentRef: example-area.ko.md
```

- `title`: 화면에 표시할 Scene 제목
- `summary`: Scene을 설명하는 한 문장
- `keywords`: 제목과 요약만으로 찾기 어려운 한글·영문·약어 검색 별칭(선택)
- `nodes`: 화면에 배치할 Topic
- `edges`: Topic 사이의 흐름
- `areas`: 여러 Topic을 배경으로 묶을 때 사용하며, 필요한 경우 Area 설명을 연결

Scene 제목은 `title`에만 작성하고 `content.ko.md`에서 반복하지 않는다.
`keywords`에는 제목이나 요약을 그대로 반복하지 않고, 실제 검색에 도움이 되는 별칭만 넣는다. 검색 결과에 tag로 표시되므로 지나치게 많거나 긴 값은 피한다.

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
- `id`: 같은 방향의 Node 쌍을 잇는 Edge가 여러 개이고 Light Flow에서 구분해야 할 때 사용하는 kebab-case ID(선택). 같은 Scene의 Node ID나 다른 Edge ID와 중복할 수 없다.
- `label`: 한글 6자 안팎의 짧은 설명
- `variant`: 기본 흐름과 다를 때 `supporting` 또는 `return`
- `fromSide`, `toSide`, `labelSide`: 자동 배치가 어색할 때만 사용하는 방향

Side 값은 `top`, `right`, `bottom`, `left` 중 하나다. Edge는 화면에서 읽는 순서대로 작성한다.

### Light Flow

`lightFlows`는 사용자가 실행 버튼을 눌렀을 때 기존 Edge를 어떤 순서로 재생할지 정의한다. 각 `stage`의 Edge는 동시에 재생되고 다음 stage는 그 뒤에 시작한다.

```yaml
edges:
  - id: client-hello
    from: browser
    to: server
    label: ClientHello
  - from: server
    to: application

lightFlows:
  handshake:
    label: Handshake
    stages:
      - edges: [client-hello]
      - edges:
          - [server, application]
```

- 같은 Node 쌍을 잇는 Edge가 하나면 `[from, to]`로 참조할 수 있다.
- 같은 방향의 Node 쌍을 잇는 Edge가 여러 개면 각 Edge에 `id`를 부여하고 문자열 ID로 참조한다.
- 한 stage에서 같은 Edge를 중복 참조하지 않는다.
- Flow가 여러 개면 버튼을 구분할 수 있도록 서로 다른 `label`을 작성한다.

### Scene Area

Scene Area는 `label`, `row`, `col`, `rowSpan`, `colSpan`을 가진다. 같은 범위의 Topic을 배경으로 묶을 때만 사용한다.

Area 전체에 설명이 필요하면 같은 Scene 디렉터리의 Markdown 파일을 선택적인 `contentRef`로 연결한다. 설명이 연결된 Area는 색칠된 영역과 Label을 선택할 수 있으며, 내부 Node를 선택하면 Node의 동작이 우선한다. Area 선택은 Child Scene 이동이 아니며 URL과 Camera를 바꾸지 않고 Explanation Panel만 연다. 설명이 필요하지 않으면 `contentRef`를 생략한다.

```yaml
areas:
  keyspace:
    label: Keyspace
    row: 3
    col: 3
    rowSpan: 1
    colSpan: 2
    contentRef: keyspace.ko.md
```

Area Markdown은 묶음 전체의 의미와 내부 Topic 사이의 관계에 집중한다. 내부 Node의 세부 설명을 반복하지 않는다.

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
