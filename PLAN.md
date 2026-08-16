# PLAN

## 이번 목표

사용자가 말한 `build-context-index.ts`는 현재 파일명 기준 `frontend/scripts/build-content-index.ts`로 해석한다.

322줄 entry가 맡고 있는 source 파일 I/O와 generated 파일 lifecycle을 실제 책임 모듈로 옮기고, entry는 Content Build의 검증·Layout·data 조립 순서를 위에서 아래로 읽을 수 있는 orchestration 중심 파일로 축소한다.

동작, 검증 오류의 문구·순서, 생성 `content-data.ts` bytes, `--check`와 obsolete generated 처리 결과는 완전히 유지한다. 이번 요청은 사용자가 대화에서 직접 요청했으며 `INBOX.md`는 수정하지 않는다.

## 현재 책임 진단

`build-content-index.ts`에는 다음 세 종류의 변경 이유가 섞여 있다.

1. Source content I/O
   - Scenario/Scene/Concept 파일 탐색
   - YAML read·parse·Zod 결과 수집
   - Scene Markdown·Quiz·Topic 설명 준비
   - Concept Markdown 준비
2. Generated file lifecycle
   - `content-data.ts` write/byte check
   - known obsolete generated 파일 탐지·삭제
3. Build orchestration
   - Scenario 단일성, graph/reachability 검증과 오류 집계
   - 게시 Scene 선별, Layout·Route·runtime data 조립
   - 직렬화와 generated sync 순서

기존 `content-build/schemas.ts`, `scene-graph.ts`, `relationship-validation.ts`와 `elk-scene-layout.ts`는 각각 schema/normalize, Scene 관계 계산, 교차 참조 검증과 Layout이라는 안정된 책임을 이미 가진다. 새 모듈은 이 로직을 복사하거나 감싸지 않는다.

`content-build/indexes.ts`는 현재 Index 전반이 아니라 Route 계산과 단일 `GeneratedContentData` 직렬화만 맡으므로 이름이 실제 책임을 충분히 설명하지 못한다.

## 확정 파일 경계

### `scripts/content-build/source-content.ts` 신규

작성 파일을 filesystem에서 읽어 검증·조립 단계가 사용할 값과 오류로 준비하는 I/O 경계다.

- 소유할 코드:
  - `ContentFile`, `PreparedSceneFile`처럼 source file path를 포함하는 I/O 결과 타입
  - 재귀 파일 탐색
  - YAML read·parse·schema error 수집
  - optional Quiz read·validation
  - Scene Markdown, Topic inline/Markdown 설명과 normalized Scene 준비
  - Concept Markdown과 generated Concept record 준비
- 기존 모듈 재사용:
  - schema와 normalize는 `schemas.ts`
  - Child owner와 metadata resolver는 `scene-graph.ts`
- 소유하지 않을 코드:
  - Scenario 단일성 최종 판단
  - reachability/relationship validation 실행 순서
  - Layout, Route, `GeneratedContentData` 조립
  - generated file write/check/delete

### `scripts/content-build/generated-file.ts` 신규

정확히 하나인 generated output의 filesystem lifecycle만 맡는다.

- 소유할 코드:
  - `content-data.ts` byte 동기화
  - build mode write
  - `--check` mode stale 오류
  - known obsolete `content-index.ts`, `route-index.ts`, `scene-layout-index.ts` 탐지·삭제 또는 check 오류
- generic file writer, config/factory와 임의 output registry로 확장하지 않는다.
- 오류 경로와 메시지는 기존 bytes 그대로 유지한다.

### `scripts/content-build/indexes.ts` → `generated-content.ts` 이름 변경

Route 계산과 완성 data의 TypeScript 직렬화라는 현재 책임을 코드 변경 없이 정직하게 드러낸다.

- `buildRouteIndex`와 `renderContentData`를 유지한다.
- source read, graph validation, Layout과 file write 책임을 추가하지 않는다.
- 호환 re-export 파일은 남기지 않고 import/test를 새 경로로 직접 갱신한다.

### `scripts/build-content-index.ts` 유지

entry는 다음 순서만 눈에 보이게 조율한다.

1. source 파일 discovery·parse 결과 요청
2. Scenario 단일성 확인
3. Scene·Concept 준비 결과와 오류 병합
4. reachability와 relationship validation
5. 게시 Scene 선별
6. Layout·Route·`GeneratedContentData` 조립
7. 직렬화 결과 sync와 obsolete 정리

예외를 최종 stderr 한 줄 계약으로 바꾸는 top-level catch는 entry에 유지한다.

## 과분할 금지

- `utils.ts`, `config.ts`, `factory`, context class와 단일 호출 wrapper를 만들지 않는다.
- path/error helper는 실제 오류를 생성하는 책임 모듈 가까이에 두며 공유를 위한 공유 파일을 만들지 않는다.
- `source-content.ts`를 discovery/parser/markdown/quiz 파일로 다시 나누지 않는다. 이들은 모두 source filesystem 변경에 함께 반응하는 하나의 I/O 책임이다.
- `generated-file.ts`를 writer/checker/cleanup 파일로 다시 나누지 않는다. 이들은 하나의 generated lifecycle이다.
- 순수 계산을 entry에서 감추기 위해 의미 없는 `runValidation`/`buildEverything` wrapper를 추가하지 않는다.
- LOC 감소는 목표가 아니며 entry의 읽기 순서와 변경 영향 범위가 실제 완료 기준이다.

## 완료 조건

### Entry 가독성

- `build-content-index.ts`는 약 322줄에서 120~160줄 수준으로 줄어드는 것을 예상한다. 정확한 줄 수보다 import/constants → orchestration → top-level error 처리 순서가 한 화면 흐름으로 읽히는 것을 우선한다.
- entry 안에 재귀 filesystem 탐색, YAML parse loop, Markdown/Quiz read loop와 generated unlink/write loop가 남지 않는다.
- `main`은 위 확정 7단계 순서와 기존 error merge 순서를 그대로 표현한다.
- entry에서 사용하는 중간값 이름이 `sceneResult`, `preparedConcepts`, `reachability`, `publishedScenes`, `layouts`, `data`의 의미를 명확히 드러낸다.

### 동작·계약 보존

- 정상 콘텐츠에서 생성되는 `frontend/src/content/generated/content-data.ts`의 전체 bytes/hash가 변경 전과 완전히 같다.
- Scenario/Scene/Concept parse 오류, missing Markdown/Quiz, duplicate owner, root owner, reachability, relationship validation 오류의 문구와 수집 순서가 같다.
- Scenario가 없거나 유효하지 않을 때의 조기 `Content validation failed` 동작이 같다.
- `--check`는 stale/missing `content-data.ts`에서 쓰지 않고 같은 오류로 실패한다.
- build mode는 같은 파일을 쓰고, obsolete 세 파일을 같은 순서로 삭제한다.
- `--check`는 obsolete 파일을 같은 순서로 탐지하고 같은 오류를 낸다.
- generated 파일은 직접 수정하지 않고 Content Build를 통해서만 확인한다.

### 코드 품질

- 이동하거나 유지되는 모든 named 함수에 역할·계약을 설명하는 간결한 한국어 JSDoc이 있다. 익명 inline callback은 제외한다.
- 기존 `schemas`, `scene-graph`, `relationship-validation`, Layout 책임과 중복 구현이 없다.
- 새 public export는 entry와 tests가 실제 사용하는 최소 값으로 제한한다.
- 단순 이동을 정당화하기 위한 interface, dependency injection, generic filesystem abstraction을 추가하지 않는다.

## 수정 예정 파일

- `frontend/scripts/build-content-index.ts`
- `frontend/scripts/content-build/source-content.ts` 신규
- `frontend/scripts/content-build/generated-file.ts` 신규
- `frontend/scripts/content-build/indexes.ts` 삭제
- `frontend/scripts/content-build/generated-content.ts` 신규 또는 rename 결과
- `frontend/tests/scripts/content-build/indexes.test.ts` → `generated-content.test.ts`
- generated lifecycle의 `--check`/obsolete 보존을 직접 확인할 필요가 있으면 `frontend/tests/scripts/content-build/generated-file.test.ts` 하나만 추가
- import 경로가 바뀌는 기존 `frontend/tests/**`

## 테스트 방침

- source I/O 이동만 확인하는 mock-heavy test suite는 추가하지 않는다.
- Route와 serialization의 기존 `indexes.test.ts` 내용은 이름 변경 후 그대로 활용한다.
- generated lifecycle 추출로 회귀 위험이 생기는 stale/obsolete 분기만 기존 명령으로 충분히 확인할 수 없으면 temporary directory를 사용하는 test 한 파일에서 함께 검증한다.
- schema, scene graph, relationship와 Layout에는 기존 tests를 그대로 사용하고 중복 test를 만들지 않는다.

## 검증 방법

에이전트는 사용자 지시에 따라 개발 서버와 browser smoke를 실행하지 않는다.

1. 변경 전 기록
   - `wc -l frontend/scripts/build-content-index.ts`
   - `shasum frontend/src/content/generated/content-data.ts`
   - `npm run content:validate` 결과
2. 구현 후 다음을 실행한다.
   - `npm run content:build`
   - `npm run content:validate`
   - `npm run typecheck`
   - `npm run test`
   - `npm run lint`
   - `npm run build`
3. 변경 전후 `content-data.ts` hash와 bytes가 동일한지 확인한다.
4. `--check`와 obsolete 처리의 기존 message/order를 기존 code와 focused test 또는 안전한 temporary fixture로 대조한다.
5. `git diff --check`와 diff 검토로 generated 손편집, 관련 없는 변경, generic helper와 wrapper가 없는지 확인한다.
6. entry 최종 줄 수와 새 파일별 책임을 보고하되 순 LOC를 성공 기준으로 사용하지 않는다.

## 문서 판단

- `docs/ARCHITECTURE.md`는 현재 `indexes.ts`와 entry의 파일별 책임을 명시하므로 구현에서 경계·이름이 바뀌면 해당 책임 목록만 갱신한다.
- `frontend/README.md`는 이미 Source → Build → generated 흐름과 디렉터리 수준 책임을 설명하며 새 내부 파일명을 나열하지 않는다. 구현 후 내용이 여전히 정확하면 수정하지 않는다.
- 그 밖의 요구사항, 용어, 코드 가이드 문서는 제품 동작과 작성 규칙이 바뀌지 않으므로 수정하지 않는다.
- 기존 문서의 사용자 변경을 보존하고 관련 문단만 최소 수정한다.

## 제외 범위

- `frontend/package.json`, lockfile, CSS, `frontend/src/components/ui/**`, `frontend/src/app/theme-provider.tsx`
- `frontend/content/**` 작성 파일과 generated 파일 직접 편집
- Browser Repository, Explorer, Explanation, Layout 알고리즘과 제품 동작
- 사용자가 작업 중인 문서·코드의 관련 없는 변경

## 후속 요청: Scenario 개념 제거와 고정 Root Scene

Scenario가 Root Scene ID를 한 번 감싸는 역할만 하므로 Content Build와 runtime Scene 모델에서 Scenario 개념을 완전히 제거한다. `frontend/content/scenes/scene.yaml`을 고정 Root Scene 작성 파일로 보고, 그 문서의 `id`를 generated data의 `rootSceneId`로 사용한다.

사용자는 이미 기존 `scenes/google-com` 내용을 `scenes/`로 평탄화했다. 에이전트는 `frontend/content/**`를 이동·복사·삭제·수정하지 않으며, 이전 Scenario 파일이나 디렉터리를 fallback으로 지원하지 않는다.

### 구현 경계

- `source-content.ts`에서 `scenario.yaml` 읽기, `scenarioDocument` 반환과 Scenario 관련 import를 제거한다.
- `content/scenes` 아래 모든 `scene.yaml`은 기존 `parseFiles` 한 번으로 같은 Schema와 오류 수집 절차를 거친다. 고정 Root 파일만 별도 `parseFile`로 다시 읽거나 특수 Schema로 처리하지 않는다.
- 파싱에 성공한 일반 Scene 문서 중 `filePath`가 고정 `rootScenePath`인 항목을 찾아 Root 역할을 부여하고, 그 문서의 `id`를 `rootSceneId`로 사용한다. Root는 타입과 파싱 관점에서는 다른 Scene과 같고 entry 역할만 다르다.
- 단일 Scenario 고정 경로 구현에서 추가했던 `parseFile` helper가 다른 호출부 없이 남으면 제거한다. 하위 Scene과 Concept의 재귀 탐색은 그대로 유지한다.
- 고정 Root Scene 파일이 없거나 읽기·YAML·Schema 검증에 실패하면 해당 `content/scenes/scene.yaml` 경로가 드러나는 Content validation 오류로 종료한다. 다른 위치의 `scene.yaml`을 Root로 대신 선택하지 않는다.
- `schemas.ts`에서 `scenarioDocumentSchema`와 `ScenarioDocument`를 제거한다.
- `SceneDerivedMetadata`와 shared `Scene` 타입에서 실제 runtime 미사용 필드인 `scenarioId`를 제거하고, `normalizeSceneDocument`가 생성하는 Scene에도 포함하지 않는다.
- `prepareScenes`와 `createSceneMetadataResolver`는 Scenario 문서 대신 고정 Root Scene ID만 받거나 필요한 값을 source 결과에서 직접 사용하도록 단순화한다.
- `rootOwnershipError`, `collectReachableSceneIds`와 관련 JSDoc·오류 문구에서 `configured`, `scenario`, `content/scenarios` 표현을 제거하고 고정 Root Scene 계약을 표현한다. 책임에 더 맞는 함수명으로 바꾸면 호출부도 함께 갱신한다.
- `build-content-index.ts`는 Root Scene 문서의 `id`를 Scene 준비, 소유권·도달 가능성 검증과 `GeneratedContentData.rootSceneId`에 일관되게 사용한다.
- 이후 relationship 검증, 게시 Scene 선별, Layout·Route·data 조립 순서는 바꾸지 않는다.

### 완료 조건

- Content Build 코드에 Scenario 파일 읽기, `ScenarioDocument`, Scenario Zod schema와 Scenario 관련 분기·오류 문구가 남지 않는다.
- `frontend/content/scenes/scene.yaml`의 문서 ID가 유일한 Root Scene 기준이라는 계약이 source 결과와 entry의 중간값 이름에서 드러난다.
- Root Scene을 위한 중복 file read·parse와 전용 문서 타입이 없고, `parseFile` helper가 미사용 상태로 남지 않는다.
- shared `Scene`과 생성 메타데이터에 `scenarioId`가 남지 않는다.
- 고정 Root Scene 파일을 식별하지 못하면 해당 경로를 알 수 있는 오류로 종료하며 다른 Scene을 암묵적으로 Root로 선택하지 않는다.
- 변경하는 모든 named 함수에는 기존 방침에 맞는 간결한 한국어 JSDoc을 유지한다.

### 미검증 범위

- 사용자가 완료한 콘텐츠 평탄화 결과를 전제로 코드만 변경하며, 에이전트가 콘텐츠 파일을 대신 보정하거나 임시 fallback을 추가하지 않는다.
- 사용자의 토큰 절약 지시에 따라 이번 후속 변경에서는 테스트를 추가·수정하지 않는다.
- `content:build`, `content:validate`, `typecheck`, `test`, `lint`, `build`, `git diff --check`와 generated bytes/hash 비교를 모두 실행하지 않는다.
- 개발 서버와 browser smoke도 기존 사용자 지시에 따라 실행하지 않는다.
- 기존 테스트 fixture의 `scenarioId`와 Scenario 기반 test는 이번 범위에서 수정하지 않으며, 구현 결과와 생성 파일은 자동 검증하지 않은 상태임을 완료 보고에 명시한다.

### 문서 판단

- Scenario 모델과 작성 구조를 설명하는 문서는 코드 변경 후 일부 내용이 낡게 되지만, 사용자가 문서 파일을 수정 대상에서 제외한 지시를 보존해 이번 PLAN에서는 수정하지 않는다.
- CSS, package.json, lockfile, 문서 파일과 `frontend/content/**`는 이번 후속 구현의 수정 대상에서 제외한다.

## 작업 순서

- [x] 0. entry 줄 수, generated hash와 자동 검증 baseline 기록
- [x] 1. source discovery/read/Scene·Concept preparation을 `source-content.ts`로 이동
- [x] 2. generated write/check/obsolete lifecycle을 `generated-file.ts`로 이동
- [x] 3. `indexes.ts`를 `generated-content.ts`로 rename하고 import/test 갱신
- [x] 4. entry를 validation/Layout/data assemble orchestration 순서로 축소
- [x] 5. 필요한 최소 generated lifecycle test와 한국어 JSDoc 점검
- [x] 6. 전체 자동 검증, generated bytes/error contract와 diff 확인
- [x] 7. 필요한 경우 Architecture 책임 목록만 갱신
- [x] 8. 사용자가 Scenario 제거·고정 Root Scene 방향과 미검증 진행을 승인
- [x] 9. Scenario 파일 읽기·Schema·문서 타입을 제거하고 고정 Root Scene을 source 결과로 식별
- [x] 10. shared Scene과 생성 메타데이터에서 미사용 `scenarioId` 제거
- [x] 11. Scene graph·Scene 준비·entry API와 오류 문구를 고정 Root Scene 기준으로 정리
- [x] 12. 테스트와 자동 검증을 실행하지 않은 상태로 구현 결과와 미검증 항목 보고
- [x] 13. 사용자가 Root Scene 단일 parse 정리 방향과 미검증 진행을 승인
- [x] 14. 모든 Scene을 한 번만 파싱하고 고정 `rootScenePath`와 성공 문서의 `filePath` 일치로 Root 식별
- [x] 15. 미사용 `parseFile` helper를 제거하고 Root가 일반 Scene 타입을 쓰도록 정리
- [x] 16. 테스트와 자동 검증을 실행하지 않은 상태로 구현 결과와 미검증 항목 보고
- [x] 17. 사용자가 전체 결과를 확인하고 완료 여부 결정

## 현재 진행 상태

▶ 현재: 작업 0~16 완료 — 사용자 확인 대기
