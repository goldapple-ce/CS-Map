# 한눈에 보기

Transaction은 여러 Database 작업을 하나의 작업 단위로 묶는 기능입니다. 묶인 작업이 모두 성공하면 commit하고, 하나라도 실패하면 rollback하여 중간 결과만 남는 것을 막습니다.

Transaction 자체는 Database가 제공합니다. Spring의 `@Transactional`은 이 Database Transaction을 애플리케이션 코드의 method 범위에 맞춰 시작하고 끝내도록 도와주는 기능입니다.

---

# Commit과 Rollback

계좌 이체는 출금과 입금이 함께 성공하거나 함께 실패해야 합니다.

```sql
BEGIN;

UPDATE account
SET balance = balance - 10000
WHERE id = 1;

UPDATE account
SET balance = balance + 10000
WHERE id = 2;

COMMIT;
```

- `BEGIN`: Transaction을 시작합니다.
- `COMMIT`: Transaction 안의 변경을 최종 확정합니다.
- `ROLLBACK`: Transaction 안의 변경을 취소합니다.

출금은 성공했지만 입금이 실패했다면 `ROLLBACK`하여 출금도 취소해야 합니다. Transaction이 없다면 두 SQL이 각각 확정되어 잔액만 줄어든 잘못된 상태가 남을 수 있습니다.

---

# Auto-commit

많은 Database 연결은 기본적으로 auto-commit 상태로 시작합니다. 이 상태에서는 SQL 한 문장이 끝날 때마다 하나의 Transaction으로 바로 commit됩니다.

```text
UPDATE 실행 → 자동 Commit
UPDATE 실행 → 자동 Commit
```

따라서 여러 SQL을 하나의 작업으로 묶으려면 같은 Connection에서 Transaction을 시작하고 마지막에 commit 또는 rollback해야 합니다.

Spring에서는 보통 `@Transactional`과 `TransactionManager`가 이 작업을 대신합니다. 자세한 Spring Proxy, Propagation과 rollback 규칙은 Spring Framework Scene의 Transaction Topic에서 다룹니다.

---

# ACID

ACID는 Transaction이 안전하게 동작하기 위해 설명하는 네 가지 성질입니다.

## Atomicity — 원자성

Transaction에 포함된 변경은 전부 반영되거나 전부 취소되어야 합니다.

계좌 이체에서 출금과 입금 중 하나만 반영되지 않도록 commit과 rollback으로 하나의 단위를 보호합니다.

## Consistency — 일관성

Transaction이 끝난 Database는 정의된 규칙을 만족하는 유효한 상태여야 합니다.

예를 들어 잔액은 0보다 작을 수 없다는 규칙이 있다면 commit된 결과도 그 규칙을 만족해야 합니다. Transaction이 잘못된 비즈니스 로직을 자동으로 고쳐 주는 것은 아니므로 애플리케이션 로직과 Database Constraint도 올바르게 작성해야 합니다.

## Isolation — 격리성

동시에 실행되는 Transaction이 서로의 중간 상태 때문에 잘못된 결과를 만들지 않도록 제어합니다.

강한 격리는 더 많은 문제를 막지만 lock 대기나 충돌을 늘릴 수 있습니다. Database는 안전성과 동시 처리 사이에서 선택할 수 있도록 여러 Isolation Level을 제공합니다.

## Durability — 지속성

성공적으로 commit되었다고 응답한 결과는 장애가 발생해도 Database가 복구할 수 있어야 합니다.

Atomicity가 commit 전의 여러 작업을 하나로 묶는 성질이라면, Durability는 commit이 성공한 뒤의 결과를 보존하는 성질입니다.

---

# 동시에 실행될 때 생길 수 있는 문제

여러 Transaction이 같은 데이터를 동시에 읽고 변경하면 Isolation Level에 따라 다음 현상이 생길 수 있습니다.

## Dirty Read

다른 Transaction이 아직 commit하지 않은 값을 읽는 현상입니다.

```text
A: 잔액을 10,000원에서 5,000원으로 변경, 아직 Commit하지 않음
B: 잔액 5,000원을 읽음
A: Rollback
```

B는 실제로 확정된 적이 없는 값을 읽은 셈입니다.

## Non-repeatable Read

한 Transaction에서 같은 row를 두 번 읽는 사이 다른 Transaction이 값을 변경하고 commit하여 결과가 달라지는 현상입니다.

```text
A: 회원 등급을 GOLD로 읽음
B: 회원 등급을 SILVER로 변경하고 Commit
A: 같은 회원을 다시 읽자 SILVER가 나옴
```

## Phantom Read

한 Transaction에서 같은 조건으로 다시 조회했을 때 다른 Transaction의 추가나 삭제 때문에 결과 row가 나타나거나 사라지는 현상입니다.

```text
A: 미결제 주문 조회 → 3건
B: 미결제 주문 1건 추가 후 Commit
A: 같은 조건으로 다시 조회 → 4건
```

Non-repeatable Read는 이미 읽은 row의 값이 달라지는 문제이고, Phantom Read는 조건에 맞는 row 자체가 나타나거나 사라지는 문제입니다.

---

# Isolation Level

SQL 표준은 대표적으로 네 가지 Isolation Level을 설명합니다.

- `READ UNCOMMITTED`: commit되지 않은 변경까지 볼 수 있어 Dirty Read가 발생할 수 있습니다.
- `READ COMMITTED`: commit된 데이터만 읽으므로 Dirty Read를 막습니다.
- `REPEATABLE READ`: 같은 Transaction에서 이미 읽은 row가 반복해서 달라지는 문제를 막습니다.
- `SERIALIZABLE`: 동시에 실행된 결과가 Transaction을 하나씩 실행한 것과 같도록 가장 강하게 보호합니다.

격리 수준을 높이면 항상 더 좋은 것은 아닙니다. 보호 범위가 커지는 대신 lock 대기, 충돌이나 재시도가 늘어날 수 있습니다.

위 설명은 SQL 표준을 이해하기 위한 기본 모델입니다. 같은 이름의 Isolation Level도 실제 동작과 기본값은 MySQL, PostgreSQL 같은 Database 제품에 따라 다를 수 있습니다.

---

# 개발자가 개입하는 지점

개발자는 함께 성공하거나 실패해야 하는 비즈니스 작업을 기준으로 Transaction 경계를 정합니다. 개별 Repository 호출마다 잘게 나누기보다 주문 생성, 재고 감소와 결제 기록처럼 하나로 성공해야 하는 작업을 묶어야 합니다.

Transaction은 가능한 짧게 유지하는 것이 좋습니다. Transaction 안에서 느린 외부 API나 대용량 파일 처리를 기다리면 Connection과 lock을 오래 점유하여 다른 요청까지 느려질 수 있습니다.

Isolation Level은 문제가 확인되었을 때 Database의 실제 동작과 함께 조정합니다. 무조건 가장 강한 수준을 선택하면 동시 처리량이 낮아질 수 있습니다.

---

# 헷갈리기 쉬운 점

## SQL 한 문장도 Transaction입니다

직접 `BEGIN`을 작성하지 않았더라도 auto-commit 상태에서는 SQL 한 문장이 하나의 Transaction으로 실행되고 바로 commit될 수 있습니다.

## Transaction이 잘못된 비즈니스 로직을 고쳐 주지는 않습니다

Transaction은 여러 작업의 commit과 rollback을 관리합니다. 얼마를 출금해야 하는지, 어떤 주문 상태가 올바른지는 애플리케이션 로직과 Constraint로 정의해야 합니다.

## 하나의 Transaction이 여러 Database를 자동으로 묶지는 않습니다

한 Database의 Transaction이 다른 Database나 외부 메시지 시스템의 작업까지 자동으로 rollback해 주지는 않습니다. 여러 시스템을 하나의 작업처럼 다루려면 별도의 설계가 필요합니다.

## Deadlock은 Transaction을 잘못 사용했다는 뜻만은 아닙니다

동시에 여러 Transaction이 같은 데이터를 다른 순서로 변경하면 Deadlock이 발생할 수 있습니다. Database가 Transaction 하나를 rollback하면 애플리케이션은 상황에 따라 해당 작업을 재시도해야 합니다.

---

# 참고 자료

- [PostgreSQL — Transactions](https://www.postgresql.org/docs/current/tutorial-transactions.html)
- [PostgreSQL — Transaction Isolation](https://www.postgresql.org/docs/current/transaction-iso.html)
- [MySQL — InnoDB Transaction Model](https://dev.mysql.com/doc/refman/8.4/en/innodb-transaction-model.html)
- [MySQL — Transaction Isolation Levels](https://dev.mysql.com/doc/refman/8.4/en/innodb-transaction-isolation-levels.html)
