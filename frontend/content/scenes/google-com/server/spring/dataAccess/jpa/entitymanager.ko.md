# 한눈에 보기

`EntityManager`는 Entity를 저장, 조회, 수정 상태로 관리하고 query를 실행하는 JPA의 중심 interface입니다.

`persist`, `find`, `remove`, `merge`와 `flush` 같은 JPA 작업은 EntityManager를 통해 요청합니다.

---

# 주요 동작

- `persist(entity)`: 새 Entity를 Persistence Context에서 managed 상태로 만듭니다.
- `find(type, id)`: 식별자로 Entity를 조회합니다.
- `remove(entity)`: managed Entity를 삭제 예정 상태로 만듭니다.
- `merge(entity)`: detached Entity의 값을 managed Entity에 복사하고 그 managed Entity를 반환합니다.
- `createQuery(...)`: JPQL이나 Criteria query를 만듭니다.
- `flush()`: Persistence Context의 변경을 Database와 동기화하도록 요청합니다.

EntityManager가 Java 객체를 직접 Database에 저장하는 것은 아닙니다. EntityManager의 요청을 JPA Provider가 해석하여 필요한 SQL을 만들고 실행합니다.

---

# Spring에서 사용하는 방식

```java
@PersistenceContext
private EntityManager entityManager;

@Transactional
public void register(Member member) {
    entityManager.persist(member);
}
```

Spring이 주입하는 EntityManager는 일반적으로 공유 Proxy입니다. 호출 시점의 transaction에 연결된 실제 EntityManager로 요청을 전달하기 때문에 Service field에 주입해서 사용할 수 있습니다.

---

# 개발자가 개입하는 지점

Spring Data JPA Repository로 표현하기 어려운 query나 bulk 작업이 필요할 때 EntityManager를 직접 사용할 수 있습니다.

다만 EntityManager를 직접 사용하더라도 transaction 경계와 Entity 상태 규칙은 그대로 지켜야 합니다. 여러 Service에서 임의로 flush하거나 Persistence Context를 비우면 다른 코드가 기대한 상태와 달라질 수 있습니다.

---

# 헷갈리기 쉬운 점

## EntityManager 자체가 Persistence Context는 아닙니다

EntityManager는 Persistence Context와 상호작용하는 API입니다. 보통 하나의 EntityManager가 하나의 Persistence Context와 연결되지만 두 용어의 역할은 다릅니다.

## `merge`는 전달한 객체를 managed 상태로 바꾸지 않습니다

`merge`는 전달받은 객체의 상태를 managed 객체에 복사하고 그 managed 객체를 반환합니다. 이후에는 반환값을 사용해야 합니다.

---

# 참고 자료

- [Jakarta Persistence — EntityManager API](https://jakarta.ee/specifications/persistence/3.2/apidocs/jakarta.persistence/jakarta/persistence/entitymanager)
- [Spring Framework — Shared EntityManager](https://docs.spring.io/spring-framework/reference/data-access/orm/jpa.html)
