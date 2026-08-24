# Scene 검색 메타데이터 확장

## 목표

Scene YAML의 `summary`와 선택적 `keywords`를 생성 데이터까지 보존해 Search 결과의 설명·검색 별칭과 검색 대상으로 사용한다.

## 선택한 요청

- Scene의 `title`, `summary`, `keywords`를 함께 검색한다.
- YAML에 `keywords`를 작성하지 않아도 해당 Scene의 Node label(Topic 이름)을 기본 검색어에 자동으로 포함한다.
- `keywords`는 Topic 이름으로 부족한 별칭을 추가하는 선택 필드로 유지한다.
- 결과에는 `title`, `summary`, 작성한 `keywords`와 해당 Scene의 Topic 이름을 모두 표시한다.
- 검색어가 없는 기본 목차에서는 각 Scene의 `summary`만 표시하고, 작성한 `keywords`와 Topic 이름 tag/chip은 숨긴다.
- 검색 결과에서는 작성한 `keywords`와 Topic 이름 tag/chip을 계속 표시한다.
- 검색 결과와 기본 목차가 공통으로 사용하는 Scene 항목 표현은 하나의 컴포넌트로 추출한다. 검색 결과의 평탄한 목록 책임과 기본 목차의 트리 펼침·들여쓰기·가지 토글 책임은 각각 유지한다.
- 공용 Scene 항목 컴포넌트는 명시적인 prop 또는 variant로 tag/chip 표시 여부를 제어하며, 검색 결과와 기본 목차의 컴포넌트 분리를 되돌리지 않는다.
- keyword tag/chip은 작성한 `keywords`를 먼저, Topic 이름을 Scene에 정의된 순서대로 표시한다. 대소문자와 공백을 정규화해 중복을 제거하되 먼저 등장한 표시 문자열은 보존한다.
- `keywords`는 제목과 설명보다 시각적으로 강조되지 않도록 작은 tag/chip 형태의 보조 정보로 표시한다.
- 기존 25개 Scene의 `summary`는 유지한다.
- 현재 Scene YAML에는 직접 작성한 `keywords`를 두지 않고 Topic 이름을 기본 tag로 사용한다. 이후 Topic 이름으로 부족한 별칭만 선택적으로 추가할 수 있다.

## 완료 조건

- [x] runtime `Scene` 타입에 필수 `summary`와 선택적 `keywords: string[]`가 정의된다.
- [x] Zod Schema가 비어 있지 않은 keyword 배열을 검증하고, normalize·generated data가 두 필드를 보존한다.
- [x] Search가 정규화한 `title + summary + keywords`를 대상으로 검색한다.
- [x] Search가 각 Scene의 Node label을 자동 검색 대상과 결과의 tag/chip에 모두 포함한다.
- [x] 검색 결과가 Scene `summary`를 제목 아래에 표시한다.
- [x] 검색 결과가 작성한 `keywords`와 Topic 이름을 작은 tag/chip 형태의 보조 정보로 표시하며, 작성한 keyword가 없는 Scene의 레이아웃도 자연스럽게 유지된다.
- [x] 작성한 `keywords` 다음에 Topic 이름을 안정적인 순서로 표시하고, 정규화 기준 중복은 제거하면서 먼저 등장한 표시 문자열을 보존한다.
- [x] 기존 25개 Scene의 직접 작성 keyword를 제거하고 summary와 Topic 이름 기반 검색·표시는 유지한다.
- [x] 검색 별칭 제공에 맞춰 요구사항·아키텍처·콘텐츠 작성 가이드를 갱신한다.
- [x] Schema·generated content·검색 index와 결과 UI의 관련 테스트를 추가하거나 갱신한다.
- [x] Topic 이름의 자동 검색·표시와 중복 제거 계약을 관련 테스트와 요구사항·아키텍처에 반영한다.
- [x] 콘텐츠 생성·검증, 타입 검사와 관련 테스트가 통과한다.
- [x] 검색어가 없는 기본 목차의 모든 Scene 항목에는 `summary`와 현재 Topic 표시만 유지되고, 작성 keyword와 Topic 이름 tag/chip은 표시되지 않는다.
- [x] 검색 결과에는 작성 keyword와 Topic 이름 tag/chip이 기존과 동일하게 표시된다.
- [x] Scene 제목·summary·keyword tag/chip·현재 Topic 표시는 공용 Scene 항목 컴포넌트가 담당하되, 명시적인 prop 또는 variant로 tag/chip 표시 여부를 제어한다.
- [x] 공용화 이후에도 결과 항목 이동, 목차 Link 이동, 가지 펼침·접힘, 현재 Topic 표시와 접근성 이름이 유지된다.
- [x] 요구사항과 아키텍처가 기본 목차에는 summary만, 검색 결과에는 summary와 Topic 이름·선택 keyword를 표시하는 계약을 설명한다.
- [x] 기본 목차에서 tag/chip이 숨겨지고 검색 결과에서는 유지되는지 관련 테스트를 갱신하고 타입 검사를 실행한다.
- [ ] 사용자가 검색 결과와 별칭 검색을 확인한다.

## 구현 순서

1. `Scene` 타입과 Scene YAML Schema에 `summary`, 선택적 `keywords` 계약을 추가한다.
2. 정규화와 generated content 생성 경로가 두 값을 runtime까지 보존하게 한다.
3. Search index에서 Route와 Scene metadata를 결합하고 `title + summary + keywords` 검색과 결과의 summary·keyword tag/chip 표시를 구현한다.
4. Scene YAML의 직접 작성 keyword를 제거하되 선택 필드 계약은 유지한다.
5. 요구사항, 아키텍처와 콘텐츠 작성 가이드에 검색 계약과 작성 기준을 반영한다.
6. 관련 테스트를 보강하고 콘텐츠 생성·검증, 타입 검사를 실행한다.
7. Search index에 각 Scene의 Node label을 자동 검색어로 결합하고 관련 테스트·문서를 갱신한다.
8. Search 결과의 keyword tag/chip에 작성한 `keywords`와 Topic 이름을 결합한다. 작성 키워드 우선·Scene 정의 순서를 유지하고, 정규화한 값이 같은 항목은 먼저 등장한 표시 문자열만 남긴다.
9. Topic 이름의 검색·표시와 중복 제거 계약을 관련 테스트·문서에 반영한다.
10. Scene 제목·summary·keyword tag/chip·현재 Topic 표시를 공용 Scene 항목 컴포넌트로 추출한다. interactive wrapper는 각 화면에 남겨 검색 결과의 평탄한 목록과 기본 목차의 트리·Link·toggle 책임을 섞지 않는다.
11. 기본 목차도 Scene metadata가 결합된 검색 항목을 사용해 query가 없을 때 summary와 작성 keyword·Topic 이름 tag/chip을 표시한다.
12. 요구사항과 아키텍처를 갱신하고 관련 UI 테스트와 타입 검사를 실행한 뒤, 사용자가 Search의 기본 목차와 검색 결과를 확인한다.
13. 공용 `SearchItemContent`에 tag/chip 표시 여부를 제어하는 명시적인 prop 또는 variant를 추가한다. `SearchOutline`에서는 숨기고 `SearchResults`에서는 유지한다.
14. 기본 목차와 검색 결과의 서로 다른 metadata 표시 계약을 요구사항·아키텍처와 관련 UI 테스트에 반영하고 타입 검사를 실행한다.

## 현재 상태

사용자 확인 결과 기본 목차의 tag/chip은 정보가 과해 제거했다. 기존 공용 `SearchItemContent`와 목록별 책임 분리는 유지하면서, 기본 목차에는 제목·summary·현재 위치만 표시하고 검색 결과에만 작성 keyword와 Topic 이름 tag/chip을 표시한다. 관련 UI 테스트와 타입 검사를 통과했으며 사용자 확인만 남아 있다.
