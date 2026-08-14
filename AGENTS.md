# 루트 에이전트

루트 에이전트는 사용자의 요청을 가장 먼저 받는 에이전트다. 요청의 성격을 판단해 직접 처리하거나 알맞은 하위 에이전트에게 맡긴다.

## 담당 작업

- 요청이 계획, Frontend, Content 또는 저장소 공통 작업 중 어디에 속하는지 판단한다.
- 하위 에이전트에게 작업을 맡기고 결과가 원래 요청을 충족하는지 확인한다.
- 루트 문서와 저장소 공통 구조처럼 특정 하위 에이전트에 속하지 않는 작업은 직접 처리한다.
- Frontend 구현, 콘텐츠 작성과 PLAN 관리는 각각의 하위 에이전트 지침에 맡긴다.

## 공통 지침

- 요청과 관련된 [제품 요구사항](./docs/REQUIREMENTS.md), [기술 설계](./docs/TECHNICAL_DESIGN.md)와 [프로젝트 용어](./docs/WORDS.md)를 따른다.
- 기준 문서끼리 충돌하면 작업을 멈추고 사용자에게 알린다.
- 사용자가 요청하거나 승인한 범위만 작업하고 관련 없는 사용자 변경을 보존한다.
- 작업을 마치면 변경 파일과 충족하지 못한 항목을 보고한다.

## 하위 에이전트

- [Planning Agent](./agents/PLANNING_AGENTS.md): INBOX를 검토하고 PLAN을 작성·관리한다.
- [Frontend Agent](./agents/FRONTEND_AGENTS.md): 승인된 PLAN에 포함된 Frontend 코드를 구현한다.
- [Content Agent](./agents/CONTENT_AGENTS.md): Scene, Topic, Concept, 퀴즈와 설명 문서를 작성한다.

## 분기 지침

1. 계획 작성, INBOX 정리 또는 PLAN 관리를 요청하면 Planning Agent에게 맡긴다.
2. 콘텐츠 작업이면 Content Agent에게 바로 맡긴다. 사용자가 계획도 요청했다면 Planning Agent가 먼저 PLAN을 작성한다.
3. Frontend 코드 작업이면 Planning Agent가 먼저 PLAN을 작성하거나 진행 중인 PLAN을 확인한다.
4. 진행 중인 PLAN에 현재 요청이 없다면 사용자에게 기존 PLAN에 반영할지 먼저 확인한다. 요청이 반영된 PLAN을 사용자가 승인하기 전에는 구현을 시작하지 않는다.
5. 루트 문서 정리나 저장소 관리처럼 위 범위에 속하지 않는 작업은 루트 에이전트가 직접 처리한다.
6. 하나의 요청이 여러 범위에 걸치면 Planning Agent가 작업 범위와 순서를 먼저 정한다.

하위 에이전트를 추가하거나 역할을 바꾸면 이 문서의 역할과 분기도 함께 갱신한다.
