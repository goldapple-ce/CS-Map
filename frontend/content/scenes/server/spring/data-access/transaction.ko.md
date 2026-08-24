# 한눈에 보기

Transaction은 여러 Database 작업을 하나의 작업 단위로 묶는 기능입니다. 묶인 작업은 중간까지만 반영되어서는 안 되며, 모두 성공하면 commit하고 하나라도 실패하면 rollback해야 합니다.

Transaction 자체는 Database가 제공하는 기능입니다. Spring은 `spring-tx`의 공통 추상화를 이용해 JDBC, JPA 등 서로 다른 데이터 접근 기술에서도 비슷한 방식으로 transaction 경계를 선언하도록 돕습니다.

---

# Database Transaction과 Spring Transaction

JDBC를 직접 사용한다면 개발자가 같은 `Connection`에서 auto-commit을 끄고 `commit()`과 `rollback()`을 호출할 수 있습니다.

```java
connection.setAutoCommit(false);

try {
    withdraw(connection);
    deposit(connection);
    connection.commit();
} catch (Exception exception) {
    connection.rollback();
    throw exception;
}
```

새 JDBC `Connection`은 기본적으로 auto-commit 상태입니다. 이때는 SQL 문 하나가 끝날 때마다 각각 별도의 transaction으로 commit됩니다. 따라서 여러 SQL을 하나의 작업으로 묶으려면 같은 `Connection`을 사용하면서 transaction 경계를 관리해야 합니다.

Spring에서는 이 반복 작업을 `TransactionManager`에 맡기고 보통 `@Transactional`로 경계를 표시합니다.

```java
@Transactional
public void transfer(Long fromId, Long toId, long amount) {
    accountRepository.withdraw(fromId, amount);
    accountRepository.deposit(toId, amount);
}
```

Spring이 Database와 별개의 transaction을 새로 만드는 것은 아닙니다. 알맞은 `TransactionManager`가 실제 저장 기술의 transaction을 시작하고 종료합니다.

JDBC, JdbcTemplate, MyBatis와 Spring Data JDBC를 사용할 때는 보통 `JdbcTransactionManager` 또는 `DataSourceTransactionManager`가 JDBC `Connection`을 관리합니다.

JPA와 Spring Data JPA를 사용할 때는 `JpaTransactionManager`가 JPA `EntityManager`와 Resource Transaction을 관리합니다.

---

# Spring에서 동작하는 과정

1. 외부 객체가 `@Transactional` method를 가진 Spring Bean의 Proxy를 호출합니다.
2. Transaction Interceptor가 `readOnly`, propagation, isolation, rollback 규칙 같은 transaction 속성을 읽습니다.
3. 설정된 `TransactionManager`가 기존 transaction의 존재 여부를 확인합니다.
4. 전파 방식에 따라 기존 transaction에 참여하거나 새로운 transaction을 시작합니다.
5. method 안의 Repository 호출들이 현재 transaction에 연결된 자원을 사용합니다.
6. method가 정상적으로 끝나면 commit을 시도하고, rollback 대상 예외가 전달되면 rollback합니다.
7. 사용한 `Connection`이나 `EntityManager`를 정리합니다.

---

# Transaction의 특징: ACID

## Atomicity — 원자성

하나의 transaction에 포함된 변경은 전부 반영되거나 전부 취소되어야 합니다.

계좌 이체에서 출금 SQL은 성공했지만 입금 SQL이 실패했다면 출금 결과도 rollback해야 합니다. 원자성은 여러 작업 사이에 절반만 반영된 상태가 남지 않게 합니다.

## Consistency — 일관성

Transaction 실행 전후의 Database는 정의된 제약과 규칙을 만족하는 유효한 상태여야 합니다.

예를 들어 잔액은 0보다 작을 수 없다는 제약이 있다면 commit된 결과도 그 제약을 만족해야 합니다. 하지만 transaction이 잘못 작성된 비즈니스 로직까지 자동으로 올바르게 바꾸는 것은 아닙니다. Database 제약 조건과 애플리케이션 로직이 함께 올바르게 작성되어야 합니다.

## Isolation — 격리성

동시에 실행되는 transaction이 서로의 중간 상태 때문에 잘못된 결과를 만들지 않도록 제어합니다.

완전히 강한 격리는 안전하지만 동시 처리량을 낮추거나 충돌과 재시도를 늘릴 수 있습니다. Database는 안전성과 동시성 사이에서 선택할 수 있도록 여러 Isolation Level을 제공합니다.

## Durability — 지속성

성공적으로 commit되었다고 응답한 결과는 process나 server에 장애가 발생해도 Database가 복구할 수 있어야 합니다.

Atomicity가 commit 전의 작업을 하나로 묶는 성질이라면, Durability는 commit이 성공한 뒤의 결과를 보존하는 성질입니다.

---

# Transaction 상태

Transaction은 단순히 실행 중이거나 끝난 상태만 가지는 것이 아닙니다. 일반적인 상태 흐름은 다음처럼 이해할 수 있습니다.

```text
Active
  ├─ 마지막 작업 완료 → Partially Committed → commit 성공 → Committed
  └─ 오류 또는 rollback 요청 → Failed → rollback → Aborted

Committed 또는 Aborted → Terminated
```

- `Active`: SQL을 실행하며 작업 중인 상태입니다.
- `Partially Committed`: 마지막 명령은 끝났지만 commit 결과가 아직 확정되지 않은 상태입니다.
- `Committed`: 변경이 성공적으로 확정된 상태입니다.
- `Failed`: 오류가 발생했거나 더 진행할 수 없는 상태입니다.
- `Aborted`: 변경을 rollback하여 transaction 시작 전 상태로 되돌린 상태입니다.
- `Terminated`: commit 또는 rollback 뒤 필요한 자원 정리까지 끝난 상태입니다.

Spring에서는 `rollback-only`도 자주 마주칩니다. 이것은 즉시 rollback한 상태가 아니라, 현재 transaction을 마지막에 commit할 수 없도록 표시한 상태입니다.

```text
안쪽 method가 rollback-only 표시
              ↓
바깥 method가 commit 요청
              ↓
TransactionManager가 실제로는 rollback
```

바깥 method가 정상적으로 끝났더라도 같은 물리 transaction 안쪽에서 `rollback-only`가 표시되었다면 최종 commit은 실패할 수 있습니다.

---

# Isolation Level이 필요한 이유

여러 transaction이 동시에 같은 데이터를 읽고 변경하면 다음과 같은 문제가 생길 수 있습니다.

## Dirty Read

Transaction A가 아직 commit하지 않은 값을 Transaction B가 읽는 현상입니다.

```text
A: 잔액 10,000원 → 5,000원으로 변경, 아직 commit하지 않음
B: 잔액 5,000원을 읽음
A: rollback
```

B는 실제로 확정된 적이 없는 값을 사용한 셈입니다.

## Non-repeatable Read

한 transaction에서 같은 행을 두 번 읽었는데 중간에 다른 transaction이 값을 변경하고 commit하여 결과가 달라지는 현상입니다.

```text
A: 회원 등급을 GOLD로 읽음
B: 회원 등급을 SILVER로 변경하고 commit
A: 같은 회원을 다시 읽자 SILVER가 나옴
```

## Phantom Read

한 transaction에서 같은 조건으로 여러 행을 다시 조회했는데 다른 transaction의 추가나 삭제 때문에 결과 행의 수가 달라지는 현상입니다.

```text
A: 미결제 주문을 조회 → 3건
B: 미결제 주문 1건을 추가하고 commit
A: 같은 조건으로 다시 조회 → 4건
```

Non-repeatable Read가 이미 읽은 한 행의 값이 달라지는 문제라면, Phantom Read는 조건에 맞는 행 자체가 나타나거나 사라지는 문제입니다.

---

# Isolation Level

SQL 표준과 JDBC는 대표적으로 네 가지 격리 수준을 정의합니다. 아래로 내려갈수록 더 많은 이상 현상을 방지합니다.

- `READ_UNCOMMITTED`: Dirty Read, Non-repeatable Read와 Phantom Read가 모두 발생할 수 있습니다.
- `READ_COMMITTED`: Dirty Read를 방지합니다. Non-repeatable Read와 Phantom Read는 발생할 수 있습니다.
- `REPEATABLE_READ`: Dirty Read와 Non-repeatable Read를 방지합니다. SQL 표준 기준으로 Phantom Read는 발생할 수 있습니다.
- `SERIALIZABLE`: 세 가지 이상 현상을 모두 방지합니다.

## READ_UNCOMMITTED

commit되지 않은 변경도 읽을 수 있는 가장 낮은 격리 수준입니다. 다른 transaction의 중간 결과를 볼 수 있어 세 가지 문제가 모두 발생할 수 있습니다.

## READ_COMMITTED

commit된 데이터만 읽습니다. Dirty Read는 막지만, 각 조회 시점에 새로 commit된 값을 볼 수 있으므로 Non-repeatable Read와 Phantom Read는 발생할 수 있습니다.

## REPEATABLE_READ

한 transaction 안에서 이미 읽은 행의 값이 반복해서 유지되도록 보호합니다. SQL 표준 기준으로 Dirty Read와 Non-repeatable Read는 막지만 Phantom Read는 발생할 수 있습니다.

## SERIALIZABLE

동시에 실행된 transaction의 결과가 하나씩 순서대로 실행한 것과 같도록 보장하는 가장 강한 격리 수준입니다.

항상 transaction을 물리적으로 한 줄로 세워 실행한다는 뜻은 아닙니다. Database는 lock이나 MVCC 같은 방식을 사용할 수 있고, 직렬화할 수 없는 충돌이 발생하면 transaction 하나를 실패시켜 애플리케이션에 재시도를 요구할 수도 있습니다.

위 구분은 SQL 표준에 따른 기본 모델입니다. 실제 Database는 같은 이름의 격리 수준을 더 강하게 구현할 수 있으며, 기본 격리 수준도 제품마다 다릅니다. Spring의 `Isolation.DEFAULT`는 연결된 Database의 기본값을 따릅니다.

---

# Propagation

Propagation은 transaction method가 다른 transaction method를 호출할 때 기존 transaction과 어떤 관계를 맺을지 정하는 규칙입니다.

이를 이해하려면 논리 transaction과 물리 transaction을 구분해야 합니다.

- 논리 transaction: 각 `@Transactional` method에 선언된 transaction 범위입니다.
- 물리 transaction: Database `Connection`에서 실제로 commit하거나 rollback하는 transaction입니다.

여러 논리 transaction이 하나의 물리 transaction에 참여할 수도 있고, 각각 별도의 물리 transaction을 사용할 수도 있습니다.

## REQUIRED

Spring의 기본 전파 방식입니다. 기존 transaction이 있으면 참여하고, 없으면 새로 시작합니다.

```text
Service A: REQUIRED ─┐
                    ├─ 같은 물리 Transaction
Service B: REQUIRED ─┘
```

두 method는 각각 논리 transaction 범위를 가지지만 같은 물리 transaction을 공유합니다. 따라서 B가 현재 transaction을 `rollback-only`로 표시하면 A도 commit할 수 없습니다. A가 commit을 기대했다면 마지막에 `UnexpectedRollbackException`을 받을 수 있습니다.

안쪽 `REQUIRED`에 다른 isolation이나 `readOnly` 값을 적더라도 이미 시작된 바깥 transaction에 참여하면 보통 바깥 transaction의 속성을 따릅니다.

## REQUIRES_NEW

항상 독립된 물리 transaction을 시작합니다. 기존 transaction이 있다면 중단해 두고, 새 transaction이 끝난 뒤 다시 이어갑니다.

```text
바깥 Transaction ── 일시 중단 ─────────── 다시 진행
                         │
                         └─ 새로운 Transaction
```

안쪽 transaction은 바깥 transaction과 별도로 commit하거나 rollback할 수 있고 자체 isolation, timeout과 `readOnly` 속성을 가질 수 있습니다.

다만 바깥 transaction의 Connection을 유지한 채 안쪽 transaction용 Connection을 추가로 빌릴 수 있습니다. 동시에 많은 요청이 `REQUIRES_NEW`를 사용하면 Connection Pool이 고갈될 수 있습니다.

## NESTED

기존 물리 transaction 안에 savepoint를 만들고 안쪽 작업만 그 지점까지 rollback합니다.

```text
하나의 물리 Transaction
├─ 바깥 작업
├─ Savepoint
├─ 안쪽 작업 실패 → Savepoint까지 rollback
└─ 바깥 작업 계속
```

`REQUIRES_NEW`가 독립된 물리 transaction을 만드는 것과 달리 `NESTED`는 하나의 물리 transaction을 공유합니다. 따라서 안쪽 작업이 끝났더라도 바깥 transaction이 rollback되면 전체 변경이 취소됩니다.

`NESTED`는 모든 환경에서 지원되지 않습니다. Spring에서는 일반적으로 JDBC savepoint를 사용할 수 있는 `DataSourceTransactionManager` 계열에서 동작합니다.

## 그 밖의 전파 방식

- `SUPPORTS`: 기존 transaction이 있으면 참여하고, 없으면 transaction 없이 실행합니다.
- `MANDATORY`: 반드시 기존 transaction이 있어야 하며, 없으면 예외가 발생합니다.
- `NOT_SUPPORTED`: 기존 transaction이 있다면 중단하고 transaction 없이 실행합니다.
- `NEVER`: transaction이 있으면 예외가 발생합니다.

Propagation은 `@Transactional` 호출이 Proxy를 통과할 때 적용됩니다. 같은 객체 안에서 자기 method를 직접 호출하면 안쪽 method의 새로운 propagation 설정이 적용되지 않을 수 있습니다.

---

# readOnly와 Dirty Checking

조회 작업에는 `readOnly = true`를 지정할 수 있습니다.

```java
@Transactional(readOnly = true)
public Member findMember(Long memberId) {
    return memberRepository.findById(memberId)
        .orElseThrow();
}
```

read-only transaction도 transaction입니다. 같은 transaction 자원을 공유하고, 저장 기술이 제공한다면 일관된 읽기 범위와 transaction 단위의 자원 관리를 사용할 수 있습니다.

하지만 `readOnly = true`는 모든 환경에서 쓰기 SQL을 차단하는 보안 규칙이 아닙니다. Spring은 이 값을 실제 TransactionManager에 전달하는 hint로 취급합니다.

## JDBC에서의 readOnly

JDBC `Connection#setReadOnly(true)`도 Driver가 최적화에 사용할 수 있도록 전달하는 hint입니다. 실제 동작은 TransactionManager, JDBC Driver와 Database 구현에 따라 다릅니다. 어떤 Database는 쓰기를 거부할 수 있지만 모든 환경에서 이를 보장하지는 않습니다.

## JPA와 Hibernate에서의 readOnly

Dirty Checking은 Hibernate가 Persistence Context에서 관리하는 Entity의 처음 상태와 현재 상태를 비교하여 필요한 `UPDATE` SQL을 만드는 기능입니다. Transaction 자체나 JDBC의 기능이 아닙니다.

Spring Data JPA와 Hibernate를 사용할 때 read-only transaction은 Hibernate의 flush mode를 `MANUAL`로 조정하여 Dirty Checking을 생략하는 최적화로 이어질 수 있습니다. 따라서 많은 Entity를 조회하는 작업에서는 불필요한 변경 검사를 줄일 수 있습니다.

Spring Data JDBC와 MyBatis에는 Hibernate Persistence Context와 Dirty Checking이 없습니다. 이 기술들에서 `readOnly`를 사용해도 “Dirty Checking을 끈다”라고 설명하면 안 됩니다.

Spring Data JPA에서 `CrudRepository`로부터 상속한 기본 조회 method에는 `readOnly = true`가 적용됩니다. 반면 직접 선언한 query method에는 transaction 설정이 자동으로 붙지 않으므로 필요한 작업 경계는 Service나 Repository에 명시해야 합니다.

---

# Commit과 Rollback 규칙

`@Transactional` method가 정상적으로 반환되면 Spring은 commit을 시도합니다. 예외가 밖으로 전달되면 Transaction Interceptor가 rollback 규칙을 확인합니다.

기본 설정은 다음과 같습니다.

- `RuntimeException`과 그 하위 예외: rollback
- `Error`와 그 하위 오류: rollback
- Checked Exception: 기본적으로 commit

Checked Exception도 rollback하려면 직접 규칙을 지정할 수 있습니다.

```java
@Transactional(rollbackFor = IOException.class)
public void importOrders(Path file) throws IOException {
    // Database 작업
}
```

예외를 method 내부에서 잡고 정상적으로 반환하면 Transaction Interceptor는 실패를 알 수 없습니다.

```java
@Transactional
public void placeOrder() {
    try {
        orderRepository.save(order);
        payment();
    } catch (PaymentException exception) {
        // 예외를 삼키면 method는 정상 종료로 보일 수 있습니다.
    }
}
```

실패 시 전체 작업을 취소해야 한다면 예외를 다시 전달하거나 현재 transaction을 `rollback-only`로 표시하는 등의 명확한 처리가 필요합니다.

---

# 개발자가 개입하는 지점

개발자는 보통 Service method에서 하나의 비즈니스 작업이 시작되고 끝나는 경계를 정합니다.

```java
@Transactional
public void placeOrder(OrderCommand command) {
    Order order = orderRepository.save(command.toOrder());
    stockRepository.decrease(
        command.productId(),
        command.quantity()
    );
    paymentRepository.save(order.createPayment());
}
```

세 Repository 호출 중 하나라도 실패하면 나머지 변경도 함께 rollback됩니다. 개별 Repository 호출마다 transaction을 나누면 주문, 재고와 결제 상태가 서로 어긋날 수 있습니다.

조회가 대부분인 Service는 class 기본값을 read-only로 두고 쓰기 method에서 덮어쓸 수도 있습니다.

```java
@Service
@Transactional(readOnly = true)
class MemberService {

    public Member findMember(Long memberId) {
        return memberRepository.findById(memberId).orElseThrow();
    }

    @Transactional
    public void changeEmail(Long memberId, String email) {
        Member member = memberRepository.findById(memberId).orElseThrow();
        member.changeEmail(email);
        memberRepository.save(member);
    }
}
```

개발자는 필요할 때 propagation, isolation, timeout, `readOnly`와 rollback 규칙을 조정할 수 있습니다. 하지만 값을 많이 지정하는 것이 좋은 설정이라는 뜻은 아닙니다. 기본 동작과 Database 특성을 이해한 뒤 실제 요구가 있는 속성만 변경해야 합니다.

---

# 헷갈리기 쉬운 점

## `@Transactional`은 annotation만 붙인다고 혼자 동작하지 않습니다

Spring이 만든 Transaction Proxy와 Transaction Interceptor, 그리고 실제 저장 기술에 맞는 `TransactionManager`가 있어야 동작합니다.

## Self-invocation에서는 새 설정이 적용되지 않을 수 있습니다

기본 Proxy 방식에서는 외부에서 Proxy를 거쳐 들어온 호출이 transaction 대상입니다. 같은 객체가 자기 자신의 다른 `@Transactional` method를 직접 호출하면 그 호출은 Proxy를 지나지 않습니다.

## `readOnly = true`는 쓰기 금지 명령이 아닙니다

`readOnly`는 기본적으로 최적화를 위한 hint입니다. 데이터 무결성이나 접근 권한을 보장하려면 Database 권한과 제약 조건을 별도로 사용해야 합니다.

## Transaction 범위에 외부 작업을 무조건 포함하면 안 됩니다

긴 transaction은 Connection과 lock을 오래 점유합니다. HTTP API 호출이나 대용량 파일 처리처럼 느리고 Database와 직접 관련 없는 작업을 transaction 안에서 기다리면 Connection Pool 고갈과 lock 경합이 커질 수 있습니다.

## 여러 Database의 작업이 자동으로 하나가 되지는 않습니다

하나의 `@Transactional`이 서로 다른 Database나 메시지 시스템의 작업까지 무조건 원자적으로 묶어 주는 것은 아닙니다. 여러 자원을 하나의 원자적 transaction으로 묶으려면 분산 transaction이나 그에 맞는 별도의 설계가 필요합니다.

---

# 참고 자료

- [Spring Framework — Transaction Management](https://docs.spring.io/spring-framework/reference/data-access/transaction.html)
- [Spring Framework — Declarative Transaction Implementation](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/tx-decl-explained.html)
- [Spring Framework — Transaction Propagation](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/tx-propagation.html)
- [Spring Framework — Rollback Rules](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/rolling-back.html)
- [Spring Framework — TransactionDefinition API](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/transaction/TransactionDefinition.html)
- [Spring Data JPA — Transactionality](https://docs.spring.io/spring-data/jpa/reference/jpa/transactions.html)
- [Java — Connection API](https://docs.oracle.com/en/java/javase/21/docs/api/java.sql/java/sql/Connection.html)
