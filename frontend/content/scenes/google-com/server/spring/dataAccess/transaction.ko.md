# 한눈에 보기

Transaction은 여러 데이터 작업을 하나의 성공 또는 실패 단위로 묶습니다. 모든 작업이 성공하면 commit하고, 중간에 실패하면 변경을 rollback합니다.

Spring은 JDBC, JPA와 일부 다른 데이터 접근 기술을 비슷한 programming model로 다룰 수 있도록 transaction 추상화를 제공합니다. 다만 실제 지원 범위와 의미는 저장소마다 다릅니다.

---

# 동작 방식

1. `@Transactional`이 적용된 Service나 Repository method의 호출 경계에서 Spring의 transaction interceptor가 동작합니다.
2. 설정과 데이터 접근 기술에 맞는 `TransactionManager`가 transaction을 시작합니다.
3. DataSource에서 얻은 JDBC Connection이나 JPA `EntityManager`가 같은 실행 흐름의 transaction에 참여합니다.
4. method가 정상적으로 끝나면 commit합니다.
5. rollback 대상 예외가 발생하면 변경을 rollback합니다.

화면의 `Transaction → Repository` 점선은 하나 이상의 Repository 호출을 저장소별 transaction 범위로 묶는 개념을 나타냅니다. Repository가 transaction을 직접 여는 것은 아니며, 호출을 가로챈 transaction interceptor가 알맞은 TransactionManager에 시작을 요청합니다.

Service에 `@Transactional`이 있다면 transaction은 Repository 호출보다 먼저 시작되고, Repository는 기본 전파 설정에 따라 이미 존재하는 transaction에 참여합니다.

JPA와 Spring Data JDBC에서는 TransactionManager가 DataSource에서 얻은 JDBC Connection을 transaction에 연동합니다. 이 세부 관계는 문서에서 설명하고 Scene에서는 공통 Repository 경계로 단순화합니다.

MongoDB는 별도의 transaction 구성과 제약을 가지며, Spring Data Redis Repository는 Redis transaction을 지원하지 않으므로 이 공통 선에 연결하지 않습니다.

---

# 개발자가 개입하는 지점

개발자는 보통 Service method에 `@Transactional`을 사용해 비즈니스 작업의 경계를 정합니다.

```java
@Transactional
public void placeOrder(OrderCommand command) {
    orderRepository.save(command.toOrder());
    stockService.decrease(command.productId(), command.quantity());
}
```

여러 저장 작업이 함께 성공하거나 실패해야 하는 범위를 하나의 transaction으로 묶습니다. 전파 방식, 격리 수준, read-only와 rollback 규칙도 필요할 때 설정할 수 있습니다.

---

# 헷갈리기 쉬운 점

## `@Transactional`은 일반적으로 Proxy를 통해 동작합니다

Spring AOP와 같은 Proxy 기반 호출이므로 같은 객체 내부의 self-invocation에서는 transaction Advice가 실행되지 않을 수 있습니다.

## 예외가 발생하면 항상 rollback하는 것은 아닙니다

기본 rollback 규칙과 직접 설정한 `rollbackFor` 등에 따라 결과가 달라질 수 있습니다. 예외를 method 안에서 처리해 밖으로 전달하지 않으면 interceptor가 실패를 알지 못할 수도 있습니다.

## Transaction을 오래 유지하면 비용이 커집니다

긴 transaction은 Connection과 lock을 오래 점유할 수 있습니다. 외부 API 호출처럼 Database 작업과 직접 관련 없는 느린 작업을 무조건 같은 범위에 넣지 않도록 주의해야 합니다.

---

# 참고 자료

- [Spring Framework — Transaction Management](https://docs.spring.io/spring-framework/reference/data-access/transaction.html)
- [Spring Framework — Declarative Transaction Management](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative.html)
