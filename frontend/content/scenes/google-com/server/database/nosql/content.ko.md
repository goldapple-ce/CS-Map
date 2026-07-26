## 개요

NoSQL은 관계형 table 모델 이외의 여러 데이터 모델을 묶어 부르는 넓은 표현입니다. 이 Scene은 그중 MongoDB 같은 문서형 Database를 예로 들어 BSON document의 저장과 조회를 설명합니다.

## 필요한 이유

문서형 모델은 서로 관련된 field, 중첩 document와 array를 하나의 document에 함께 표현할 수 있습니다. 애플리케이션이 다루는 데이터 단위와 document 경계를 가깝게 설계할 때 유용할 수 있습니다.

## 동작 과정

1. 애플리케이션이 field 조건을 담은 query filter를 보냅니다.
2. Database가 대상 collection과 사용할 수 있는 index를 확인합니다.
3. 조건에 맞는 BSON document를 찾거나 변경합니다.
4. document 또는 작업 결과를 애플리케이션에 반환합니다.

## 내부 구조

MongoDB document는 field와 value 쌍으로 구성되며 중첩 document와 array를 포함할 수 있습니다. NoSQL에는 key-value, wide-column, graph 등 다른 모델도 있으므로 문서형의 특성을 NoSQL 전체의 공통 규칙으로 일반화하면 안 됩니다.

## 실패 상황

- query filter나 field 경로가 의도와 다를 수 있습니다.
- 적절한 index가 없어 많은 document를 검사할 수 있습니다.
- document 경계와 데이터 중복 전략이 실제 변경 패턴에 맞지 않을 수 있습니다.
- document 크기와 제품별 제한을 넘을 수 있습니다.

## 실무 맥락

문서형 Database를 선택할 때는 읽기·쓰기 패턴, 함께 변경되는 데이터의 경계, index 비용, 일관성 및 transaction 요구를 기준으로 모델을 설계해야 합니다.

## 출처

- MongoDB Manual, _Documents_
- MongoDB Manual, _Query Documents_

## 지도 참고

- 이 흐름은 NoSQL 전체가 아니라 MongoDB 같은 문서형 Database의 대표 예시입니다.

## 참고 자료

- [MongoDB Manual — Documents](https://www.mongodb.com/docs/manual/core/document/)
- [MongoDB Manual — Query Documents](https://www.mongodb.com/docs/manual/tutorial/query-documents/)
