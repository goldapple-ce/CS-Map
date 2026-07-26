## 개요

관계형 Database는 데이터를 주로 table의 row와 column으로 구성하고 SQL로 정의·조회·변경합니다. PostgreSQL은 관계형 개념과 SQL을 학습하기 위한 구체적인 제품 예시입니다.

## 필요한 이유

정해진 구조, 관계와 무결성 조건을 명시하면 여러 데이터 사이의 연결을 query하고 일관된 변경 단위를 구성할 수 있습니다.

## 동작 과정

1. Database가 SQL query를 받습니다.
2. 구문을 해석하고 실행 계획을 만듭니다.
3. 계획에 따라 table과 필요한 index에서 row를 찾습니다.
4. 변경 작업은 transaction 경계와 constraint를 적용받습니다.
5. 선택된 row나 변경 결과를 반환합니다.

## 내부 구조

실제 최적화와 실행 방식은 Database 제품, schema, 통계와 query에 따라 달라집니다. 화면은 SQL 처리의 학습 순서를 단순화한 것이며 모든 제품이 동일한 내부 단계를 사용한다는 뜻은 아닙니다.

## 실패 상황

- SQL 구문이나 참조한 table·column이 잘못될 수 있습니다.
- unique, foreign key, not-null 같은 constraint를 위반할 수 있습니다.
- lock 대기, deadlock 또는 transaction 충돌이 발생할 수 있습니다.
- 실행 계획이 데이터 분포에 맞지 않아 느려질 수 있습니다.

## 실무 맥락

느린 SQL은 query만 보지 말고 실행 계획, index, 실제 row 수, lock과 transaction 범위를 함께 확인해야 합니다.

## 출처

- PostgreSQL Documentation, _SQL Tutorial_
- PostgreSQL Documentation, _Data Definition_

## 참고 자료

- [PostgreSQL Documentation — SQL Tutorial](https://www.postgresql.org/docs/current/tutorial.html)
- [PostgreSQL Documentation — Data Definition](https://www.postgresql.org/docs/current/ddl.html)
