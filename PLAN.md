# 독립 퀴즈 페이지

## 목표

기존 Scene 탐색과 별도로 `/quiz`에서 여러 Scene의 확인 문제를 연속해서 풀 수 있게 한다. 사용자는 기존 Scene 계층으로 출제 범위를 고르고, 그 범위에 이미 작성된 문제를 모두 한 번씩 푼다. 한 문제씩 답을 떠올린 뒤 정답을 확인해 `알겠어요` 또는 `다시 볼래요`로 스스로 평가하고, 세션이 끝나면 다시 볼 문제와 출처 Scene을 확인할 수 있다.

홈페이지에는 기존 퀴즈 중 대표 문제 하나를 미리 풀어 보는 소개 영역을 두어 독립 퀴즈 페이지의 목적과 진입점을 자연스럽게 알린다.

이 기능은 학습 내용을 다시 확인하는 일회성 세션이다. 객관식이나 입력 답안의 자동 채점, 점수, 학습 진도와 결과 이력 저장은 제공하지 않는다.

## 선택한 요청

- Header에서 독립 퀴즈 페이지로 이동할 수 있게 한다.
- `/quiz`는 World Viewport나 Explanation Panel 안의 탭이 아닌 별도 페이지로 제공한다.
- 각 Scene의 기존 `quiz.ko.yaml`에서 생성된 `selfCheckQuiz`를 그대로 모아 출제한다. 퀴즈 콘텐츠, Schema와 Content Build는 변경하지 않고 문제를 복사하거나 별도 문제 파일도 만들지 않는다.
- 범위는 제품에 새로운 CS 카테고리를 추가하지 않고 기존 Scene 부모·자식 계층을 사용한다.
- 사용자는 전체 범위 또는 하나의 Scene 가지를 고를 수 있다. Scene 가지를 선택하면 해당 Scene과 모든 하위 Scene의 기존 문제를 전부 푼다.
- 세션을 시작할 때 선택한 범위의 문제 전체를 중복 없이 한 번씩 포함하고 순서만 섞는다.
- 섞은 문제와 순서는 세션을 시작한 뒤 고정하며 React 재렌더링으로 다시 섞이지 않는다.
- 문제는 한 번에 하나씩 표시한다. 사용자가 답을 생각한 뒤 정답을 열고 `알겠어요` 또는 `다시 볼래요`를 선택해 다음 문제로 이동한다.
- 결과에서는 자동 계산한 점수나 정답률 대신 완료 사실과 `다시 볼래요`로 표시한 문제를 보여준다.
- 각 문제와 결과의 복습 목록에는 출처 Scene 제목과 해당 Explorer 경로를 제공한다.
- 같은 범위의 모든 문제를 다시 섞어 풀거나 범위 선택으로 돌아갈 수 있게 한다.
- 세션 상태와 결과는 브라우저 저장소나 서버에 저장하지 않는다. 페이지를 새로 열거나 새로고침하면 새 세션을 준비하는 초기 상태에서 시작한다.
- 기존 Scene의 `ExplanationPanel`과 `QuizPanel` 동작은 유지한다.
- `HomeRoute`에 상위 prop을 추가하지 않고 `<QuizPreview />`를 배치한다.
- `QuizPreview`는 기존 generated 퀴즈로 만든 Quiz Bank를 내부에서 직접 읽고, 안정된 순서의 첫 문제를 대표 문제로 선택한다. 렌더링이나 새로고침마다 무작위로 바꾸지 않는다.
- 홈페이지 대표 문제는 질문을 먼저 보여 주고 사용자가 정답을 열어 확인할 수 있게 하며, `/quiz`에서 전체 퀴즈를 시작하는 CTA를 제공한다.
- 사용할 퀴즈가 하나도 없으면 오류나 빈 카드를 표시하지 않고 `QuizPreview` 영역을 안전하게 숨긴다.

## 데이터와 상태 설계

### Quiz Bank

generated content의 Route와 Scene을 조합해 화면에서 사용할 문제 목록을 만든다.

```ts
type QuizBankQuestion = {
  id: string;
  sceneId: string;
  sceneTitle: string;
  scenePath: string;
  question: string;
  answer: string;
};
```

- `id`는 저장용 영구 식별자가 아니라 현재 generated 데이터 안에서 문제를 구분하기 위한 값이다. `sceneId`와 Scene 안의 문제 순서를 조합해 만든다.
- `scenePath`는 generated Route에서 가져오며 콘텐츠 작성 데이터에 URL을 중복 저장하지 않는다.
- 퀴즈가 없는 Scene은 Quiz Bank의 문제 목록에서는 제외한다.
- 범위 목록은 실제 문제가 한 개 이상 존재하는 Scene 가지만 보여준다. 가지 이름과 포함 문제 수를 함께 표시해 빈 세션을 시작하지 않게 한다.
- 선택한 Scene의 하위 범위는 Route의 `parentId` 관계로 계산한다.

### Quiz Session

페이지는 다음 세 상태를 가진다.

1. `setup`: 전체 또는 Scene 가지와 그 범위에 포함된 문제 수를 확인하고 세션을 시작한다.
2. `solving`: 고정된 문제 배열, 현재 문제 위치, 정답 공개 여부와 자기 평가 결과를 관리한다.
3. `result`: 다시 볼 문제를 보여주고 재시작 동작을 제공한다.

- 정답을 공개하기 전에는 자기 평가 버튼을 표시하지 않는다.
- `알겠어요`와 `다시 볼래요`는 사용자의 자기 평가일 뿐 정오답이나 점수로 표현하지 않는다.
- 같은 범위 다시 풀기는 그 범위의 모든 문제를 다시 섞어 새 세션을 만든다.
- 상태는 Quiz Route의 메모리에만 유지하고 URL query, local storage와 generated content에는 기록하지 않는다.

### Homepage Quiz Preview

- `HomeRoute`는 데이터 조회나 정답 공개 상태를 소유하지 않고 `<QuizPreview />`만 배치한다.
- `QuizPreview`가 기존 Quiz Bank를 직접 읽어 첫 문제를 대표 문제로 선택한다. 별도 대표 문제 콘텐츠나 복사된 퀴즈 데이터는 만들지 않는다.
- 정답 공개 상태는 `QuizPreview` 내부의 일시적인 화면 상태로만 관리한다.
- CTA는 React Router를 사용해 `/quiz`로 이동한다.
- Quiz Bank가 비어 있으면 `QuizPreview`는 아무것도 렌더링하지 않는다.

## 범위에서 제외하는 작업

- `quiz.ko.yaml`, `SelfCheckQuestion`과 Content Build Schema 변경
- 객관식 선택지, 답안 입력과 자동 채점
- 점수, 정답률, 사용자 진도, 오답 이력과 브라우저·서버 저장
- 로그인, 개인화 추천과 문제 난이도
- 문제별 영구 ID와 퀴즈 전용 콘텐츠 편집 방식
- 기존 Scene `QuizPanel` 제거 또는 독립 페이지 UI로 교체
- 새로운 CS 카테고리나 Scene 구조 추가
- 홈페이지 퀴즈를 위한 새 콘텐츠, generated 데이터 계약, Context와 `HomeRoute` 상위 컴포넌트의 prop 추가

## 완료 조건

### Quiz Bank와 범위 선택

- [x] generated Route와 Scene의 `selfCheckQuiz`를 조합해 출처 정보가 포함된 Quiz Bank를 만든다.
- [x] 문제 ID가 현재 generated 데이터 안에서 유일하고 같은 문제를 한 세션에 중복 출제하지 않는다.
- [x] 전체 범위는 퀴즈가 있는 모든 게시 Scene의 문제를 포함한다.
- [x] Scene 가지 범위는 선택한 Scene과 모든 하위 Scene의 문제만 포함한다.
- [x] 퀴즈가 없는 가지는 범위 선택에서 제외하고, 각 범위에서 출제 가능한 문제 수를 알 수 있게 한다.
- [x] 세션 시작 시 선택한 범위의 모든 문제를 중복 없이 한 번씩 포함하고 순서만 섞는다.
- [x] 섞은 문제와 순서는 세션 동안 고정된다.

### 독립 페이지와 진입

- [x] `/quiz` Route가 직접 접근과 새로고침에서 정상적으로 열린다.
- [x] Header에 현재 Search와 Theme 동작을 방해하지 않는 퀴즈 페이지 진입점을 추가한다.
- [x] 퀴즈 페이지에서 전체 또는 Scene 가지 범위를 선택하고 세션을 시작할 수 있다.
- [x] 문제가 없는 예외적인 generated 데이터에서도 빈 화면이나 실행 오류 대신 안내 상태를 표시한다.

### 홈페이지 퀴즈 소개

- [x] `HomeRoute`에 prop 변경 없이 `<QuizPreview />`를 배치한다.
- [x] `QuizPreview`는 기존 Quiz Bank를 내부에서 직접 읽고 안정된 순서의 대표 문제 하나를 표시한다.
- [x] 대표 문제는 처음에는 질문만 보여 주고 사용자가 요청할 때 정답을 공개한다.
- [x] CTA를 선택하면 `/quiz` 독립 페이지로 이동한다.
- [x] 홈페이지 소개를 위해 새 퀴즈 콘텐츠, 데이터 복사, Context나 상위 prop을 추가하지 않는다.
- [x] Quiz Bank가 비어 있어도 오류를 내지 않고 소개 영역을 렌더링하지 않는다.

### 문제 진행과 결과

- [x] 진행 화면은 현재 번호와 전체 문제 수, 질문과 출처 Scene을 한 번에 한 문제씩 보여준다.
- [x] 정답은 사용자가 요청할 때만 공개한다.
- [x] 정답 공개 뒤 `알겠어요` 또는 `다시 볼래요`로 평가해야 다음 문제로 진행한다.
- [x] 마지막 문제를 평가하면 결과 화면으로 이동한다.
- [x] 결과 화면은 점수와 정답률 없이 `다시 볼래요`로 평가한 문제와 답, 출처 Scene을 보여준다.
- [x] 출처 Scene 링크는 해당 Explorer Route로 이동한다.
- [x] 같은 범위의 모든 문제를 다시 섞어 새 세션을 시작하거나 범위 선택으로 돌아갈 수 있다.
- [x] 페이지를 새로고침했을 때 이전 세션과 결과를 복원하지 않는다.
- [x] 기존 Explanation Panel의 Scene별 Quiz 탭과 답변 열기 동작은 바뀌지 않는다.

### 기준 문서

- [x] `REQUIREMENTS.md`에 독립 퀴즈 페이지의 기존 요구사항과 함께 홈페이지 대표 문제 미리보기, 정답 확인과 `/quiz` 진입을 반영한다.
- [x] `ARCHITECTURE.md`에 기존 Quiz Bank를 직접 소비하는 `QuizPreview`와 내부 정답 공개 상태의 책임을 반영한다.
- [x] `WORDS.md`와 `CONTENT_GUIDE.md`는 새 용어나 작성 계약이 생기지 않으므로 변경하지 않는다.

### 테스트와 검증

- [x] Quiz Bank가 퀴즈 없는 Scene을 제외하고 문제 출처와 경로를 올바르게 조합하는지 테스트한다.
- [x] 전체 범위와 Scene 가지 범위가 올바른 자손 문제를 선택하는지 테스트한다.
- [x] 셔플 결과가 선택한 범위의 모든 문제를 누락과 중복 없이 정확히 한 번씩 포함하는지 테스트한다. 난수 주입이나 고정 가능한 순수 함수를 사용해 테스트를 안정적으로 유지한다.
- [x] 퀴즈 페이지에서 범위 선택, 정답 공개 전후, 두 자기 평가 경로, 마지막 문제 뒤 결과와 재시작 흐름을 테스트한다.
- [x] Header 진입과 `/quiz` Route 직접 접근을 확인한다.
- [x] 기존 Explanation Panel Quiz 테스트가 계속 통과하는지 확인한다.
- [x] `QuizPreview`가 결정적인 대표 문제를 표시하고 정답을 공개하며 CTA로 `/quiz`에 진입하는지 테스트한다.
- [x] Quiz Bank가 비어 있을 때 `QuizPreview`가 안전하게 렌더링되지 않는지 테스트한다.
- [x] `QuizPreview` 추가 뒤 기존 HomeRoute와 독립 퀴즈 페이지 테스트가 계속 통과하는지 확인한다.
- [x] `npm run content:build`, `npm run content:validate`, `npm run typecheck`, `npm run test`, `npm run lint`, `npm run build`와 `git diff --check`를 다시 통과한다.
- [ ] 사용자가 브라우저에서 홈페이지 대표 문제의 정답 공개와 `/quiz` 진입을 확인하고, 독립 페이지에서는 범위의 모든 문제가 한 번씩 나오는지, 세션 중 순서가 고정되는지, 자기 평가, 다시 볼 문제와 출처 Scene 이동, 같은 범위 재셔플과 새로고침 시 초기화를 확인한다.

## 구현 순서

1. `REQUIREMENTS.md`와 `ARCHITECTURE.md`에 승인된 독립 퀴즈 경험과 책임 경계를 반영한다.
2. generated Route와 Scene에서 출처가 포함된 Quiz Bank를 만드는 순수 데이터 모듈을 작성하고 전체·가지 범위 계산과 모든 문제를 한 번씩 섞는 테스트를 추가한다.
3. `/quiz` Route와 Header 진입점을 추가한다.
4. 범위 선택과 빈 문제 안내를 구현한다.
5. 한 문제씩 정답을 공개하고 자기 평가하는 메모리 기반 Quiz Session을 구현한다.
6. 다시 볼 문제와 출처 Scene을 보여주는 결과 화면, 같은 범위 전체 문제 재셔플과 범위 다시 선택 동작을 구현한다.
7. Route와 사용자 진행 흐름 테스트를 추가하고 기존 Explanation Panel Quiz 회귀 테스트를 확인한다.
8. 콘텐츠 생성·검증, 정적 검사, 전체 테스트, production build와 diff 검사를 실행한다.
9. `QuizPreview`가 기존 Quiz Bank를 직접 읽도록 구현하고 `HomeRoute`에 prop 변경 없이 배치한다.
10. 홈페이지 대표 문제의 결정적 선택, 정답 공개, `/quiz` CTA와 빈 Quiz Bank 동작을 테스트하고 기준 문서를 갱신한 뒤 전체 검증을 다시 실행한다.
11. 사용자가 브라우저에서 홈페이지 소개와 독립 퀴즈 페이지 전체 흐름, 비저장 동작을 확인한다.

## 예상 변경 파일

- `docs/REQUIREMENTS.md`
- `docs/ARCHITECTURE.md`
- `frontend/src/app/router.tsx`
- `frontend/src/app/AppHeader.tsx`
- `frontend/src/app/routes/QuizRoute.tsx`
- `frontend/src/app/routes/HomeRoute.tsx`
- `frontend/src/features/home/QuizPreview.tsx`
- `frontend/src/features/quiz/*`
- `frontend/tests/src/features/home/*`
- `frontend/tests/src/features/quiz/*`
- 필요하면 Header·Route 테스트 파일

다음 파일과 영역은 변경하지 않는다.

- `frontend/content/scenes/**/quiz.ko.yaml`
- `frontend/shared/content/types.ts`의 `SelfCheckQuestion`
- `frontend/scripts/content-build/**`
- `frontend/src/features/explanation/QuizPanel.tsx`의 기존 Scene 퀴즈 동작

## 현재 상태

독립 퀴즈 페이지와 홈페이지 `QuizPreview` 구현 및 자동 검증을 완료했다. 사용자의 브라우저 확인만 남아 있다.
