# PLAN

## 현재 상태

**구현 및 문서 반영 완료 — 사용자 확인 대기**

## 이번 목표

Explanation Panel의 제한적인 자체 Markdown 파서를 표준 Markdown 렌더러로 교체하여 중첩 목록을 포함한 일반적인 Markdown 문법을 그대로 표시한다.

## 포함한 요청

- 직접 작성한 Markdown 파서를 표준 Markdown 렌더러로 교체하고 싶다.
- Markdown 중첩 목록의 들여쓰기가 정상적으로 표시되어야 한다.

## 완료 조건

- `react-markdown` 기반으로 Scene·Concept Markdown을 렌더링한다.
- 중첩된 순서 있는 목록과 순서 없는 목록이 작성한 단계대로 표시된다.
- 기존 제목, 문단, 인용문, 강조, inline code, 외부 링크와 fenced code block 표시를 유지한다.
- 기존 Explanation Panel 디자인과 결정적인 heading ID를 유지한다.
- raw HTML은 실행하거나 DOM으로 삽입하지 않는다.
- 표, 취소선, 자동 링크 같은 GFM 문법을 안전하게 표시할 수 있다.

## 작업 순서

### 1단계 — 표준 Markdown 렌더러 전환

- [x] 기존 자체 block·inline parser를 제거하고 `react-markdown`과 `remark-gfm`을 추가한다.
- [x] 허용된 Markdown 요소를 프로젝트 Tailwind 스타일의 React 컴포넌트로 렌더링한다.
- [x] 중첩 목록, code block, 외부 링크와 raw HTML 차단 정책을 반영한다.

### 2단계 — 목차 호환성과 문서 반영

- [x] 기존 heading ID 생성 규칙과 Explanation Panel 목차 연결을 유지한다.
- [x] `REQUIREMENTS.md`와 `TECHNICAL_DESIGN.md`에 표준 Markdown 및 HTML 처리 정책을 반영한다.

### 3단계 — 사용자 확인

- [ ] 사용자가 중첩 목록과 기존 Markdown 콘텐츠 표시를 확인한다.
- [ ] 사용자가 제목 목차 이동과 외부 링크·code block 표시를 확인한다.

## 필요한 요구사항 및 설계 변경

- `REQUIREMENTS.md`
  - Markdown 설명에서 중첩 목록을 포함한 일반적인 문서 구조를 지원하고 raw HTML을 실행하지 않는 조건을 명시한다.
- `TECHNICAL_DESIGN.md`
  - 자체 parser 대신 `react-markdown`과 `remark-gfm`을 사용하며 출력 요소를 프로젝트 컴포넌트와 스타일로 제어하는 구조를 기록한다.

## 검증 및 확인 방법

- AI는 자동 테스트, 수동 테스트, 타입 검사, 빌드와 브라우저 검증을 실행하지 않는다.
- AI는 renderer가 기존 Markdown 기능과 heading ID를 연결하고 raw HTML plugin을 사용하지 않는지 정적으로 확인한다.
- 사용자는 실제 `content.ko.md`에서 중첩 목록, 제목 목차, 링크와 code block을 직접 확인한다.
- 사용자 확인 전에는 사용자 확인 체크박스를 완료 처리하지 않는다.

## 예상 변경 파일

- `frontend/src/features/explanation/MarkdownContent.tsx`
- `frontend/package.json`
- `frontend/package-lock.json`
- `REQUIREMENTS.md`
- `TECHNICAL_DESIGN.md`
- `PLAN.md`

## 제외 범위

- Markdown 안의 raw HTML 허용
- MDX와 JSX 실행
- Markdown 편집기 또는 미리보기 UI 추가
- Scene YAML 구조 변경
- INBOX `메모`에 기록된 요청
