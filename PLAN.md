# 프로젝트 진행표

- 최종 수정: 2026-07-24
- 현재 상태: **설계 완료, 애플리케이션 구현 미시작**
- 현재 단계: **1단계 — 프로젝트 기반 준비**

## 진행 상태 보는 법

- `[x]`: 구현과 테스트가 끝남
- `[ ]`: 아직 시작하지 않음
- `▶`: 지금 진행할 단계

AI는 실제 구현과 테스트가 끝난 항목만 `[x]`로 바꾼다. 추측으로 완료 처리하지 않는다.

## 전체 진행률

| 단계 | 내용 | 상태 |
|---:|---|---|
| 0 | 제품·기술 설계 | 완료 |
| 1 | React 프로젝트 기반 | ▶ 현재 |
| 2 | 콘텐츠 데이터 구조 | 대기 |
| 3 | 지도·설명 기본 화면 | 대기 |
| 4 | 데이터 기반 장면 표시 | 대기 |
| 5 | 클릭 탐색과 URL | 대기 |
| 6 | 줌 전환과 뒤로 가기 복원 | 대기 |
| 7 | 긴 설명·공통 개념·준비 중 노드 | 대기 |
| 8 | 접근성·성능·최종 테스트 | 대기 |

---

## 0단계 — 제품·기술 설계

상태: **완료**

- [x] 제품 목적과 사용자 정의
- [x] 클릭 기반 Semantic Zoom 원칙 정의
- [x] 지도와 긴 설명 패널 구조 정의
- [x] Scene·Concept·Context·Occurrence 분리
- [x] React + Vite + React Router 선택
- [x] Tailwind CSS + shadcn/ui 선택
- [x] 파일 기반 콘텐츠와 무제한 재귀 깊이 설계

눈으로 확인할 결과:

- `REQUIREMENTS.md`
- `TECHNICAL_DESIGN.md`
- `AGENTS.md`

---

## 1단계 — 프로젝트 기반 준비

상태: **▶ 현재**

### 사용자가 할 일

- [ ] React + TypeScript + Vite 프로젝트 생성
- [ ] 프로젝트를 Git 저장소로 준비
- [ ] 핵심 문서 5개를 프로젝트 루트에 복사

### AI에게 맡길 일

- [ ] 기존 React 프로젝트와 패키지 매니저 확인
- [ ] React Router `/explore/*` 기본 경로 구성
- [ ] Tailwind CSS Vite plugin 구성
- [ ] shadcn/ui 초기화
- [ ] lint, typecheck, unit test, build 명령 구성
- [ ] 모든 기본 검증 통과

완료하면 눈으로 확인할 결과:

- `/`와 `/explore/google-search`가 빈 화면이라도 오류 없이 열린다.
- Tailwind와 shadcn Button이 정상적으로 표시된다.
- lint, typecheck, test, build가 통과한다.

사용자가 직접 커밋할 때의 추천 메시지:

```text
chore: set up app foundation
```

---

## 2단계 — 콘텐츠 데이터 구조

상태: **대기**

- [ ] Scene 타입과 런타임 스키마
- [ ] Concept·Context·Occurrence 타입과 스키마
- [ ] published·planned 등 콘텐츠 상태
- [ ] 부모·자식 관계와 관련 관계 구분
- [ ] 중복 ID와 없는 참조 검증
- [ ] 부모·자식 순환 탐지
- [ ] YAML·Markdown 파일 loader
- [ ] 콘텐츠 route index 생성
- [ ] 검증 테스트 통과

완료하면 눈으로 확인할 결과:

- 코드 수정 없이 콘텐츠 파일을 추가할 수 있다.
- 잘못된 콘텐츠는 파일과 원인을 표시하며 검증에 실패한다.
- 깊이를 나타내는 고정 `level` 필드가 없다.

추천 커밋 메시지:

```text
feat: add content model and validation
```

---

## 3단계 — 지도·설명 기본 화면

상태: **대기**

- [ ] 전체 화면 Explorer shell
- [ ] 왼쪽 지도 Viewport
- [ ] 오른쪽 설명 패널
- [ ] shadcn Resizable panel
- [ ] 설명 패널 독립 스크롤
- [ ] 패널 접기와 읽기 모드
- [ ] 뒤로 가기와 현재 경로 표시 위치

완료하면 눈으로 확인할 결과:

- 긴 임시 설명을 스크롤해도 왼쪽 지도가 움직이지 않는다.
- 설명 패널을 접고 넓힐 수 있다.
- MUI나 CSS Modules 없이 Tailwind와 shadcn/ui만 사용한다.

추천 커밋 메시지:

```text
feat: add explorer split layout
```

---

## 4단계 — 데이터 기반 장면 표시

상태: **대기**

- [ ] SVG + HTML 기반 Scene renderer
- [ ] node·edge·group·annotation 표시
- [ ] `cva` 기반 interactive·planned·static 상태
- [ ] 런타임 좌표만 inline style로 적용
- [ ] 구글 검색 루트 장면 표시
- [ ] 키보드로 노드 포커스 가능
- [ ] 그림의 텍스트 요약 제공

완료하면 눈으로 확인할 결과:

- 콘텐츠 파일을 읽어 구글 검색 흐름 그림이 표시된다.
- 클릭 가능·준비 중·설명 전용 요소가 구분된다.
- 화면 크기가 달라져도 장면이 Viewport 안에 맞는다.

추천 커밋 메시지:

```text
feat: render scenes from content
```

---

## 5단계 — 클릭 탐색과 URL

상태: **대기**

- [ ] 노드 클릭·Enter·Space로 하위 장면 진입
- [ ] 다음 P0 경로 연결

```text
구글 검색 → 네트워크 → DNS → UDP 질의 → Socket/Kernel
```

- [ ] 장면별 `/explore/*` URL
- [ ] URL 직접 접근과 새로고침 복원
- [ ] 브라우저 뒤로·앞으로 가기
- [ ] 없는 경로 not-found
- [ ] 빠른 중복 클릭 방지

완료하면 눈으로 확인할 결과:

- 다섯 장면을 클릭으로 연속 탐색할 수 있다.
- 각 위치의 URL을 새 탭에서 직접 열 수 있다.
- 아직 화려한 줌 애니메이션은 없어도 된다.

추천 커밋 메시지:

```text
feat: add scene navigation and deep links
```

---

## 6단계 — 줌 전환과 뒤로 가기 복원

상태: **대기**

- [ ] 클릭한 노드 중심으로 확대
- [ ] 상위 장면 복귀 시 축소
- [ ] 전환 중 중복 입력 처리
- [ ] `prefers-reduced-motion` 지원
- [ ] 이전 클릭 요소 포커스 복원
- [ ] 카메라와 장면 위치 복원
- [ ] 설명 패널 상태와 스크롤 위치 복원

완료하면 눈으로 확인할 결과:

- 페이지 교체가 아니라 노드 내부로 들어가는 느낌이 난다.
- DNS 설명을 스크롤하고 하위 장면에 갔다가 돌아오면 읽던 위치가 복원된다.
- 동작 감소 설정에서는 과도한 확대가 없다.

추천 커밋 메시지:

```text
feat: add semantic zoom and state restoration
```

---

## 7단계 — 긴 설명·공통 개념·준비 중 노드

상태: **대기**

- [ ] 구조화된 Markdown 긴 설명
- [ ] 개요·필요한 이유·동작·실패·실무·출처 섹션
- [ ] 진입 전 짧은 미리보기
- [ ] 핵심 정보는 hover에만 두지 않음
- [ ] 공통 Concept와 현재 Context 결합
- [ ] 같은 Concept를 두 Context에서 재사용
- [ ] planned node는 빈 장면으로 이동하지 않음
- [ ] 준비 중 제목과 예정 내용 표시

완료하면 눈으로 확인할 결과:

- 지도 옆에서 충분히 긴 설명을 읽을 수 있다.
- 캐시 등의 공통 설명을 맥락마다 복사하지 않는다.
- 준비 중 노드를 눌러도 URL이 변하지 않는다.

추천 커밋 메시지:

```text
feat: add long-form content and concept reuse
```

---

## 8단계 — 접근성·성능·최종 테스트

상태: **대기**

- [ ] 키보드만으로 P0 경로 탐색
- [ ] 장면 변경 포커스와 보조기술 안내
- [ ] 색상 외의 상태 표현
- [ ] 자동 접근성 검사
- [ ] 현재 장면 중심 lazy loading
- [ ] 인접 장면 prefetch
- [ ] 화면 밖 장면 제거
- [ ] P0 전체 E2E
- [ ] URL·새로고침·뒤로 가기 E2E
- [ ] 긴 설명 스크롤 복원 E2E
- [ ] production build와 정적 배포 확인

완료하면 눈으로 확인할 결과:

- `REQUIREMENTS.md`의 MVP 인수 조건을 모두 검수할 수 있다.
- 실패하거나 확인하지 못한 항목이 명확히 기록된다.
- 다른 사람이 실행·빌드·콘텐츠 추가 방법을 이해할 수 있다.

추천 커밋 메시지:

```text
test: complete mvp acceptance coverage
```

---

## AI에게 현재 단계를 맡기는 프롬프트

```text
AGENTS.md, REQUIREMENTS.md, TECHNICAL_DESIGN.md와 PLAN.md를 읽어줘.

PLAN.md에서 `▶ 현재`로 표시된 단계만 작업해.
다음 단계는 미리 구현하지 마.

중요:
- git commit, git push, tag 생성은 절대 하지 마. Git 작업은 내가 한다.
- 시작 전에 수정할 파일과 테스트 계획을 알려줘.
- 완료 후 변경 파일, 실행한 테스트, 남은 문제를 보고해줘.
- 실제 구현과 테스트가 끝난 체크박스만 PLAN.md에서 `[x]`로 바꿔줘.
- 현재 단계가 전부 끝났다면 다음 단계에 `▶ 현재`를 표시해줘.
```

## 사용자가 작업 후 확인할 것

AI가 작업을 끝내면 사용자는 다음만 확인한다.

1. 화면에서 해당 단계의 “눈으로 확인할 결과”를 직접 확인한다.
2. AI가 보고한 테스트가 실제로 통과했는지 확인한다.
3. `git diff`로 변경 범위를 확인한다.
4. 사용자가 직접 커밋한다.

