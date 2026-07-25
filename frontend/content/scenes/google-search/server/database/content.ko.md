# Database 선택과 데이터 처리

## 개요

Application Server는 데이터를 읽거나 변경하기 위해 Database를 사용할 수 있습니다. 이 Scene은 관계형 Database와 SQL, 그리고 NoSQL 중 문서형 Database를 대표 예시로 비교합니다.

## 필요한 이유

데이터의 관계, 무결성 규칙, 조회 형태와 확장 요구에 따라 적절한 데이터 모델과 Database가 달라집니다. SQL과 NoSQL은 단순히 어느 한쪽이 더 빠르다는 기준으로 나눌 수 없습니다.

## 동작 과정

1. Application Server가 데이터 작업을 요청합니다.
2. 관계형 방식에서는 table, row, column과 관계를 바탕으로 SQL을 실행합니다.
3. 문서형 방식에서는 field와 value로 구성된 document를 저장하고 조회합니다.
4. Database가 조건에 맞는 결과나 변경 결과를 Application Server에 반환합니다.

## 내부 구조

SQL은 언어이고 관계형 Database는 데이터 모델과 관리 시스템을 뜻하므로 완전히 같은 용어는 아닙니다. NoSQL 역시 문서형, key-value, wide-column, graph 등 서로 다른 모델을 포괄합니다. 화면에서는 비교 범위를 명확하게 하기 위해 문서형만 구체화합니다.

## 실패 상황

- 연결 한도, timeout 또는 인증 문제로 요청하지 못할 수 있습니다.
- 잘못된 query나 schema·constraint 불일치로 작업이 거부될 수 있습니다.
- index가 적절하지 않아 조회가 느려질 수 있습니다.
- 동시 변경과 transaction 경계가 의도와 다르게 동작할 수 있습니다.

## 실무 맥락

Database 선택은 예상 데이터 형태, 접근 패턴, consistency와 transaction 요구, 운영 도구와 팀 경험을 함께 고려해야 합니다.

## 출처

- PostgreSQL Documentation, _SQL Tutorial_
- MongoDB Manual, _Documents_
