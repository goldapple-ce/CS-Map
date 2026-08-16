# 한눈에 보기

Database Lock은 여러 Transaction이 같은 데이터에 동시에 접근할 때 서로 충돌하는 작업을 제어하는 기능입니다.

한 Transaction이 데이터를 변경하는 동안 다른 Transaction의 충돌하는 변경을 기다리게 하여, 두 작업이 서로의 결과를 덮어쓰거나 잘못된 상태를 만드는 일을 막습니다.

---

# 기본 동작

```text
Transaction A: Row 변경
       ↓
해당 Row에 Lock 획득
       ↓
Transaction B: 같은 Row 변경 요청
       ↓
Lock이 해제될 때까지 대기
       ↓
Transaction A: Commit 또는 Rollback
       ↓
Lock 해제 → Transaction B 진행
```

Lock 대기는 항상 오류가 아닙니다. 먼저 작업 중인 Transaction이 끝날 때까지 순서를 지키는 정상적인 동작일 수 있습니다.

하지만 Transaction이 오래 열려 있으면 Lock도 오래 유지되어 다른 요청이 계속 기다릴 수 있습니다.

---

# Shared Lock과 Exclusive Lock

Lock은 함께 사용할 수 있는지에 따라 기본적으로 Shared Lock과 Exclusive Lock으로 나누어 이해할 수 있습니다.

- Shared Lock(S Lock): 여러 Transaction이 같은 데이터를 읽을 수 있지만, 충돌하는 변경은 기다리게 합니다.
- Exclusive Lock(X Lock): 데이터를 변경하기 위한 Lock입니다. 다른 Transaction의 충돌하는 읽기나 변경 Lock과 함께 사용할 수 없습니다.

```text
S Lock + S Lock → 함께 사용 가능
S Lock + X Lock → 충돌
X Lock + X Lock → 충돌
```

실제 Lock 종류와 충돌 규칙은 Database 제품과 SQL에 따라 더 세분화될 수 있습니다.

---

# Row Lock과 Table Lock

- Row Lock: 특정 row에 대한 충돌을 제어합니다. 서로 다른 row를 변경하는 Transaction은 동시에 진행할 가능성이 높습니다.
- Table Lock: Table 전체 또는 넓은 작업 범위를 보호합니다. 한 번에 더 많은 작업과 충돌할 수 있습니다.

Row Lock이 항상 정확히 한 row만 잠근다는 뜻은 아닙니다. Query 조건, Index, Isolation Level과 Database 구현에 따라 더 넓은 범위가 영향을 받을 수 있습니다.

---

# SELECT FOR UPDATE

데이터를 읽은 뒤 같은 Transaction에서 변경해야 한다면 `SELECT ... FOR UPDATE`로 대상 row를 잠글 수 있습니다.

```sql
BEGIN;

SELECT stock
FROM product
WHERE id = 1
FOR UPDATE;

UPDATE product
SET stock = stock - 1
WHERE id = 1;

COMMIT;
```

다른 Transaction이 같은 상품을 `FOR UPDATE`로 읽거나 변경하려 하면 현재 Transaction이 끝날 때까지 기다릴 수 있습니다.

모든 `SELECT`에 `FOR UPDATE`를 붙이는 것은 좋지 않습니다. 실제로 읽은 값을 기준으로 이어지는 변경을 보호해야 할 때 사용합니다.

---

# Lock Wait과 Deadlock

Lock Wait은 다른 Transaction이 가진 Lock이 해제되기를 기다리는 상태입니다.

Deadlock은 둘 이상의 Transaction이 서로 가진 Lock을 기다려 아무도 진행할 수 없는 상태입니다.

```text
Transaction A: Row 1 Lock 획득 → Row 2를 기다림
Transaction B: Row 2 Lock 획득 → Row 1을 기다림
```

Database는 Deadlock을 발견하면 Transaction 하나를 rollback하여 대기 관계를 끊을 수 있습니다. 이때 애플리케이션은 실패한 작업을 그대로 무시하지 말고, 다시 실행해도 안전한 작업인지 판단한 뒤 재시도할 수 있습니다.

---

# 개발자가 개입하는 지점

개발자는 Lock을 직접 설정하는 것보다 먼저 Transaction 범위를 짧게 유지해야 합니다. 느린 외부 API 호출이나 대용량 파일 처리를 Transaction 안에서 기다리면 Lock이 오래 유지될 수 있습니다.

여러 row를 변경할 때는 가능한 한 일정한 순서로 접근하면 Deadlock 가능성을 줄이는 데 도움이 됩니다. 예를 들어 계좌 ID가 작은 row부터 항상 같은 순서로 변경합니다.

Query 조건에 알맞은 Index가 없으면 Database가 더 많은 데이터를 확인하면서 예상보다 넓은 범위에 영향을 줄 수 있습니다. Lock 문제가 발생하면 실행 계획, 대기 시간과 어떤 Transaction이 Lock을 보유하고 있는지 함께 확인해야 합니다.

---

# 헷갈리기 쉬운 점

## Lock이 발생하면 모두 성능 문제인 것은 아닙니다

충돌하는 변경을 안전하게 순서대로 처리하기 위한 짧은 Lock 대기는 정상입니다. 대기가 길어지거나 많은 요청이 연속해서 막힐 때 원인을 찾아야 합니다.

## 일반 SELECT가 항상 변경 작업을 막는 것은 아닙니다

일반 조회와 `SELECT ... FOR UPDATE` 같은 잠금 조회는 목적이 다릅니다. 어떤 조회가 어떤 Lock을 사용하는지는 Database 제품과 Isolation Level에 따라 확인해야 합니다.

## Database Lock과 애플리케이션 Lock은 다릅니다

이 Topic의 Lock은 Database 데이터 접근을 제어합니다. Java의 `synchronized`, `ReentrantLock`이나 여러 서버 사이에서 사용하는 분산 Lock은 보호 대상과 동작 범위가 다릅니다.

---

# 참고 자료

- [MySQL — InnoDB Locking](https://dev.mysql.com/doc/refman/8.4/en/innodb-locking.html)
- [MySQL — Locking Reads](https://dev.mysql.com/doc/refman/8.4/en/innodb-locking-reads.html)
- [MySQL — Deadlocks in InnoDB](https://dev.mysql.com/doc/refman/8.4/en/innodb-deadlocks.html)
- [PostgreSQL — Explicit Locking](https://www.postgresql.org/docs/current/explicit-locking.html)
