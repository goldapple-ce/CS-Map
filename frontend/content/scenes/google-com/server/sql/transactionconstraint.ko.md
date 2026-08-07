# 한눈에 보기

Transaction은 여러 Database 작업을 commit 또는 rollback할 하나의 단위로 묶고, Constraint는 저장할 데이터가 schema의 규칙을 만족하는지 검사합니다.

둘은 query 처리 뒤에 붙는 하나의 단계가 아닙니다. Transaction은 작업 전체의 경계를 만들고 Constraint는 관련 변경이 실행될 때 무결성을 확인합니다.

---

# Transaction

```sql
BEGIN;

UPDATE account SET balance = balance - 10000 WHERE id = 1;
UPDATE account SET balance = balance + 10000 WHERE id = 2;

COMMIT;
```

두 변경 중 하나가 실패하면 `ROLLBACK`하여 전체 변경을 취소할 수 있습니다. 동시 transaction 사이에서 어떤 변경을 볼 수 있는지는 Isolation Level과 Database 구현에 따라 달라집니다.

Spring에서 transaction 경계를 설정하는 방법과 propagation은 Spring Data Access의 Transaction 토픽에서 자세히 다룹니다.

---

# Constraint

- `NOT NULL`: 값이 반드시 존재해야 합니다.
- `UNIQUE`: 지정한 값 또는 값의 조합이 중복되지 않도록 합니다.
- `PRIMARY KEY`: row를 식별하는 key를 정의합니다.
- `FOREIGN KEY`: 다른 table의 key와 참조 관계를 보호합니다.
- `CHECK`: 값이 지정한 조건을 만족하는지 검사합니다.

Constraint는 애플리케이션 검증이 빠뜨린 잘못된 데이터가 Database에 저장되는 것을 막는 마지막 방어선이 될 수 있습니다.

---

# 개발자가 개입하는 지점

개발자는 함께 성공하거나 실패해야 할 작업의 transaction 경계를 정하고, 여러 애플리케이션이 데이터를 변경하더라도 반드시 지켜야 할 규칙을 constraint로 정의합니다.

애플리케이션 검증과 Database constraint는 대체 관계가 아닙니다. 애플리케이션은 사용자에게 빠르고 이해하기 쉬운 오류를 제공하고, Database는 동시 요청을 포함한 최종 무결성을 보호합니다.

---

# 헷갈리기 쉬운 점

## Transaction이 잘못된 비즈니스 로직을 고쳐 주지는 않습니다

Transaction은 작업의 원자성과 격리를 제공하지만 무엇이 올바른 비즈니스 상태인지는 코드와 constraint로 정의해야 합니다.

## Constraint가 있으면 동시성 문제가 모두 해결되는 것은 아닙니다

동시 변경의 순서와 읽기 일관성은 lock, isolation, optimistic locking 같은 별도 전략도 함께 고려해야 합니다.

---

# 참고 자료

- [PostgreSQL — Transactions](https://www.postgresql.org/docs/current/tutorial-transactions.html)
- [PostgreSQL — Constraints](https://www.postgresql.org/docs/current/ddl-constraints.html)
