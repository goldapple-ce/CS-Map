# CS Map 용어집

이 문서는 사용자와 AI가 제품의 화면, 공간 탐색, 콘텐츠 구조를 같은 용어로 설명하기 위한 공통 사전이다. 제품 동작은 `REQUIREMENTS.md`, 기술 구조는 `TECHNICAL_DESIGN.md`가 최종 기준이며, 이 문서는 두 문서의 용어를 짧고 일관되게 풀어 쓴다.

## 사용 원칙

- 대화와 새 문서에서는 아래의 **권장 표현**을 우선 사용한다.
- 코드 식별자를 말할 때는 영문 이름을 그대로 쓸 수 있다.
- `페이지`, `슬라이드`, `depth 화면`처럼 화면 교체를 연상시키는 말은 실제 라우트나 문서를 뜻할 때만 사용한다.
- 여기서 `캔버스`는 자유롭게 노드를 끌어다 놓는 무한 캔버스를 뜻하지 않는다. 공간 전체를 말할 때는 **논리적 월드**를 권장한다.
- 이 문서와 요구사항 또는 기술 설계가 다르면 요구사항과 기술 설계를 따른다.

## 제품과 화면

### Explorer — 탐색 화면

지도 탐색 경험 전체를 뜻한다. World Viewport, Explanation Panel, 상단 탐색 UI를 함께 포함한다.

- 권장 표현: `Explorer`, `탐색 화면`
- 구분: World Viewport만을 뜻하지 않는다.

### Topic Outline — 전체 Topic 목차

Topic을 차례대로 진입하지 않아도 게시된 Scene의 부모·자식 구조를 훑어볼 수 있는 Explorer 보조 UI다. 목차의 가지를 펼치거나 접는 것만으로 현재 카메라나 집중 Topic은 바뀌지 않으며, 게시된 Topic을 선택하면 같은 논리적 월드의 해당 위치로 이동한다.

- 권장 표현: `전체 Topic 목차`, 문맥이 분명할 때 `목차`
- 구분: Explanation Panel 본문의 제목을 나열하는 섹션 목차가 아니다.
- 구분: 고정 CS 카테고리 메뉴가 아니다.

### Section Outline — 본문 섹션 목차

Explanation Panel의 긴 설명 안에서 Markdown 제목 위치로 이동하기 위한 목차다. 전체 Scene 계층을 보여주는 전체 Topic 목차와 역할이 다르다.

- 권장 표현: `본문 섹션 목차`

### World Viewport — 월드 뷰포트

논리적 월드를 카메라를 통해 바라보는 지도 영역이다. 화면에서 왼쪽의 흐름도와 Topic이 보이는 부분이며, 크기가 바뀌면 카메라가 사용할 수 있는 표시 영역도 달라진다.

- 권장 표현: `World Viewport`, `월드 뷰포트`
- 구분: 논리적 월드 전체가 아니라 현재 화면에 보이는 창이다.
- 피할 표현: `현재 페이지`, `현재 depth 화면`

### Explanation Panel — 설명 패널

현재 Topic의 긴 설명과 맥락 정보를 보여주는 독립 스크롤 영역이다. 데스크톱에서는 World Viewport와 동시에 존재하며, 패널을 접거나 읽기 모드로 넓혀도 새 페이지로 이동하지 않는다.

- 권장 표현: `Explanation Panel`, `설명 패널`
- 표기: 영문 철자는 `Explanation`이다.

### Quiz Tab — 퀴즈 탭

Explanation Panel에서 현재 Topic의 이해를 확인하는 정적 문항 영역이다. `정답 보기`로 답변을 확인할 수 있지만 MVP에서는 점수, 진도와 결과 이력을 저장하지 않는다.

## 공간과 카메라

### Logical World — 논리적 월드

모든 Scene이 부모·자식 관계에 따라 중첩되어 존재하는 하나의 공간이다. Topic에 진입해도 월드는 교체되지 않고 카메라가 해당 위치로 이동한다.

- 권장 표현: `논리적 월드`, 문맥이 분명할 때 `월드`
- 구분: DOM에 모든 Scene이 항상 렌더링된다는 뜻은 아니다.
- 피할 표현: `새 페이지`, `다음 슬라이드`, `depth별 컬럼`

### World Layout — 월드 레이아웃

Scene의 부모·자식 관계와 각 Scene 내부 레이아웃을 이용해 모든 Scene의 월드 좌표, 크기, 중첩 위치를 결정한 결과다. 같은 콘텐츠에는 같은 결과가 나오는 결정적 자동 배치를 사용한다.

### Scene Layout — 장면 레이아웃

한 Scene 안의 node와 edge를 배치한 결과다. MVP의 모든 Scene은 5×5 Logical Grid로 node 위치를 지정하고 실제 크기와 연결선 경로는 빌드 단계에서 계산한다.

### Scene Area — Scene 영역

하나의 Scene 안에서 여러 Topic이 같은 시스템 또는 구성 범위에 속한다는 것을 보여주는 격자 기반 배경 영역이다. Area는 제목과 테두리를 표시하지만 Topic이 아니므로 클릭, 포커스, 카메라 이동, URL 변경 또는 하위 Scene 진입 대상이 아니다. Area 안의 Topic과 edge는 기존처럼 각각 상호작용하고 흐름을 표현한다.

- 권장 표현: `Scene Area`, `Scene 영역`, 문맥이 분명할 때 `Area`
- 구분: 하위 Scene의 미리보기가 아니며 탐색 가능한 Group도 아니다.

### Logical Grid — 논리 격자

Scene 안의 Topic 위치를 콘텐츠 작성자가 예측 가능하게 지정하기 위한 5×5 셀 체계다. `row`는 위에서 아래, `col`은 왼쪽에서 오른쪽으로 세는 1~5의 셀 번호이며 픽셀 좌표가 아니다. 실제 좌표, Topic 크기, 간격과 연결선 경로는 빌드 단계에서 계산한다.

### Camera — 카메라

World Viewport가 논리적 월드의 어느 위치를 어떤 배율로 보여줄지 나타내는 상태다. 현재 구현에서는 월드 중심 좌표 `centerX`, `centerY`와 내부 배율 `scale`로 구성된다.

- 카메라 이동: 중심 좌표가 바뀌는 것
- 카메라 확대·축소: `scale`이 바뀌는 것
- 카메라 전환: 이동과 확대·축소를 함께 보간하는 애니메이션

### Bounds — 영역 경계

월드 또는 Scene 안에서 어떤 대상이 차지하는 직사각형 영역이다. 카메라는 집중할 Topic의 bounds를 기준으로 중심과 배율을 자동 계산한다.

### Zoom Percentage — 화면 확대율

World Viewport 상단에 표시되는 퍼센트다. 루트 Scene 전체가 현재 Viewport에 맞게 보이는 배율을 `100%`로 두고, 현재 카메라 배율이 그 기준보다 몇 배인지 나타낸다.

- 브라우저 확대율이 아니다.
- 학습 진행률이나 고정 depth가 아니다.
- Viewport 크기가 달라지면 루트 맞춤 배율도 다시 계산되므로 같은 Topic이라도 표시값이 달라질 수 있다.
- 내부 `camera.scale` 원값을 그대로 퍼센트로 표시한 값이 아니다.

### Semantic Zoom — 의미 기반 확대

단순히 글자와 도형만 크게 만드는 확대가 아니다. 카메라가 Topic으로 이동하고 확대되면서, 화면에 투영된 크기에 맞춰 그 Topic의 내부 요소와 세부 정보가 단계적으로 나타나는 탐색 방식이다.

### LOD — 상세도

`Level of Detail`의 약자다. Scene이나 요소가 화면에서 얼마나 크게 보이는지에 따라 제목만 표시할지, 요약과 내부 흐름까지 표시할지를 결정하는 기준이다.

- 권장 표현: `LOD`, 처음 설명할 때 `상세도(LOD)`
- 구분: 고정된 콘텐츠 depth 개수가 아니다.

### Viewport Virtualization — 뷰포트 가상화

논리적 월드는 유지하면서 현재 Viewport와 필요한 주변 영역에 해당하는 Scene만 DOM/SVG에 렌더링하는 방식이다. 화면 밖 Scene이 렌더링되지 않아도 월드에서 삭제된 것은 아니다.

## 탐색 대상

### Topic — 토픽

사용자가 현재 보고 있거나 클릭해 더 자세히 탐색할 수 있는 지식 대상의 사용자용 명칭이다. 모든 Topic은 클릭할 수 있으며, 하위 Scene이 없는 Topic은 Explanation Panel에서 설명 유무를 알려준다.

- 권장 표현: `Topic`, `토픽`
- 구분: Topic은 사용자 경험의 표현이고, Scene은 공간과 데이터 구조의 표현이다.

### Focused Topic — 집중 토픽

현재 URL, 카메라 목표, Explanation Panel의 기준이 되는 Topic이다. Viewport 안에 다른 상위·하위 Topic이 보여도 집중 토픽은 하나다.

- 권장 표현: `집중 Topic`, `현재 Topic`
- 피할 표현: `현재 페이지`

### Root Topic — 루트 토픽

탐색을 시작하는 최상위 Topic이다. 현재 MVP에서는 `google.com` 접속 전체 흐름이다. 루트로 돌아간다는 것은 새 홈페이지로 이동하는 것이 아니라 루트 Scene을 중심으로 카메라를 맞추는 것을 뜻한다.

### Scene — 장면

논리적 월드 안에 중첩되는 하나의 동작 또는 내부 구조 영역이자 그 영역을 설명하는 콘텐츠 단위다. Scene은 임의 깊이의 자식 Scene을 가질 수 있다.

- 권장 표현: `Scene`, `장면`
- 구분: 페이지 컴포넌트나 교체되는 슬라이드가 아니다.

### Scene Element — 장면 요소

Scene 내부를 구성하는 요소의 총칭이다.

- `node`: 처리 단계나 대상을 나타내며 하위 Scene 진입점이 될 수 있다.
- `edge`: 데이터 이동 또는 실행 순서를 나타내는 연결선과 화살표다.

edge의 `fromSide`와 `toSide`는 각각 출발 Topic과 도착 Topic에서 사용할 면을 지정하는 선택적 Port Side Hint다. 값은 `top`, `right`, `bottom`, `left`이며, 중간 연결선 경로를 직접 작성하는 좌표가 아니다.

edge의 `labelSide`는 계산된 연결선에서 라벨을 어느 방향에 표시할지 지정하는 선택적 Label Side Hint다. 값은 `top`, `right`, `bottom`, `left`이며, 라벨 좌표를 직접 작성하는 필드가 아니다.

### Parent Scene / Child Scene — 부모·자식 장면

공간 중첩과 주요 탐색 경로를 만드는 대표 계층이다. 자식 Scene은 부모 Scene의 특정 node 영역 안에 자동 배치된다.

### Leaf Topic — 말단 토픽

`childSceneId`와 `navigateToSceneId`가 없는 Topic이다. 클릭하면 URL이나 카메라를 바꾸지 않고 Explanation Panel에서 해당 Topic을 선택하며, 별도 설명이 없으면 이를 명시적으로 안내한다.

### Internal View Indicator — 내부 보기 표시

다른 Scene으로 이어지는 Topic의 제목 아래에 표시하는 `[내부 보기]` 문구다.

`childSceneId` 또는 `navigateToSceneId`가 있는 Topic에만 고정된 글자 크기로 표시하며, 이동 대상이 없는 말단 Topic에는 별도 표식을 추가하지 않는다. 배경의 Scene에서는 월드 transform에 따라 Topic과 함께 자연스럽게 축소된다.

## 콘텐츠 모델

### Concept — 공통 개념

특정 위치와 무관하게 여러 장면에서 재사용하는 핵심 원리다. 예: 캐시, TCP, 프로세스. 핵심 설명을 사용 위치마다 복제하지 않는다.

### Context — 맥락

공통 Concept가 현재 탐색 경로에서 왜 필요하고 어떻게 사용되는지 설명한다. 같은 Concept라도 사용되는 장면에 따라 Context는 달라질 수 있다.

### Occurrence — 구체적 사용 위치

Concept가 특정 Context와 Scene 요소에서 실제로 등장하는 지점이다. 예: 캐시 Concept의 브라우저 캐시, DNS 캐시, 서버 캐시 Occurrence.

```text
Concept: 캐시의 공통 원리
└─ Context: 검색 서버에서 계산 비용을 줄이기 위해 사용
   └─ Occurrence: 검색 결과 캐시 node에서 실제로 등장
```

### Child Scene — 자식 Scene

Scene node의 `childSceneId`가 가리키는 중첩 Scene이다. 별도 Relationship 목록을 작성하지 않고 이 참조에서 부모·자식 공간 관계를 파생한다.

### Edge — 연결선

Scene의 두 Topic 사이에 보이는 흐름이다. `from`, `to`, 선택적 `label`과 선 모양 힌트가 화면 연결선과 흐름 의미의 단일 원본이다.

## 상태 복원

### Navigation Snapshot — 탐색 스냅샷

뒤로 가기 시 이전 탐색 상태를 복원하기 위해 저장하는 값의 묶음이다. 카메라 위치와 배율, 집중 Topic, 포커스 대상, Explanation Panel 상태와 스크롤 위치를 포함할 수 있다.

### Reduced Motion — 동작 감소

운영체제의 `prefers-reduced-motion` 설정을 존중해 카메라 애니메이션을 생략하거나 짧게 만드는 동작이다. 공간 구조와 탐색 결과 자체는 바뀌지 않는다.
