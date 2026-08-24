# Scene ID를 폴더 경로에서 파생하도록 정정

## 목표

`scene.yaml`의 수동 `id` 없이도 Scene의 계층이 ID에 보존되도록, `content/scenes` 아래의 상대 폴더 경로 전체를 Scene ID로 사용한다.

## 정정된 규칙

- 기존 구현처럼 마지막 폴더명만 ID로 사용하지 않는다.
- `scene.yaml` 부모의 `content/scenes` 기준 상대 경로를 `-`로 결합한다.
  - `content/scenes/server/spring/scene.yaml` → `server-spring`
  - `content/scenes/network/dns/scene.yaml` → `network-dns`
- Root `content/scenes/scene.yaml`만 예외적으로 명시적 상수 `enter-google`을 ID로 사용한다.
- 각 경로 세그먼트는 소문자 kebab-case를 유지한다.
- 서로 다른 경로에서 같은 파생 ID가 만들어지면 관련 파일 경로를 표시하며 빌드를 실패시킨다.

## 완료 조건

- [x] Source loader가 전체 상대 경로를 결합해 Scene ID를 만들고 Root·잘못된 경로 세그먼트·중복 파생 ID를 검증한다.
- [x] 모든 `childSceneId`와 `navigateToSceneId`를 계층형 파생 ID로 정정한다.
- [x] graph, Route, generated Scene·Layout과 브라우저의 Scene 참조를 새 ID 기준으로 정정한다.
- [x] 관련 build·Repository·Layout 테스트의 fixture와 기대값을 새 ID 규칙에 맞춘다.
- [x] 콘텐츠 가이드와 아키텍처의 basename ID 설명을 전체 상대 경로 ID 규칙으로 고친다.
- [x] generated content를 다시 만들고 콘텐츠 검증, 타입 검사와 관련 테스트를 실행한다.
- [x] Root Scene의 파생 ID만 `enter-google` 상수로 변경하고 나머지 상대 경로 ID 규칙은 유지한다.
- [x] `rootSceneId`, Root Route, 관련 테스트·문서·generated content를 `enter-google` 기준으로 갱신한다.

## 구현 순서

1. ID 파생 함수와 loader 검증을 전체 상대 경로 기준으로 수정한다.
2. 콘텐츠의 Scene 참조와 코드·테스트의 기대 ID를 일괄 정정한다.
3. Route·generated data를 다시 생성하고 기준 문서를 갱신한다.
4. 콘텐츠 검증, 타입 검사와 관련 테스트로 확인한다.
5. Root Scene ID 예외를 `enter-google`로 변경하고 관련 참조와 산출물을 갱신한다.

## 현재 상태

계층형 Scene ID와 Root Scene의 `enter-google` 예외 적용, 생성 데이터 갱신 및 검증을 완료했다.
