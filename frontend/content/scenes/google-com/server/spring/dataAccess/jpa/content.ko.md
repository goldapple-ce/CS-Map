# 한눈에 보기

JPA는 Java 객체와 관계형 Database를 연결하고 Entity의 저장, 조회와 상태 관리를 위한 표준입니다. 현재 공식 명칭은 Jakarta Persistence이며, 기존 이름인 JPA가 널리 사용됩니다.

JPA는 API와 동작 규칙을 정의하지만 Database와 직접 통신하는 완성된 제품은 아닙니다. Hibernate 같은 JPA Provider가 이 표준을 구현하고 SQL 실행은 일반적으로 JDBC로 이어집니다.

---

# 이 Scene에서 보는 흐름

```text
EntityManagerFactory
        ↓
EntityManager
        ↓
Persistence Context
        ↓
Entity 상태 관리
        ↓
Dirty Checking
        ↓
Flush
```

`EntityManager`는 Entity 저장과 조회를 요청하는 JPA의 중심 API입니다. 실제로 조회한 Entity의 동일성과 상태를 기억하는 공간은 Persistence Context입니다.

Transaction 안에서 managed Entity가 변경되면 JPA Provider는 변경을 감지하고 flush 시점에 필요한 SQL을 Database로 보냅니다. flush는 SQL을 반영하는 시점이고, transaction을 최종 확정하는 commit과는 다릅니다.

Mapping Metadata는 Java class와 Database table의 대응 관계를 알려주고, JPQL은 table과 column 대신 Entity와 attribute를 대상으로 query를 작성하게 합니다.

---

# Spring Data JPA와의 관계

Spring Data JPA Repository의 구현은 내부에서 JPA `EntityManager`를 사용합니다. 개발자가 `JpaRepository`만 사용하더라도 EntityManager, Persistence Context, flush와 Entity 상태 규칙은 그대로 적용됩니다.

상위 Scene의 `Spring Data JPA → JPA → Hibernate` 흐름은 각각 Repository 편의 기능, 표준 API, 실제 구현체의 관계를 나타냅니다.

---

# 개발자가 개입하는 지점

개발자는 Entity와 연관 관계를 mapping하고, Service에서 transaction 경계를 정하며, Repository method나 JPQL로 필요한 데이터를 조회합니다.

객체 관계를 자연스럽게 설계하는 것만으로 효율적인 SQL이 자동 보장되지는 않습니다. fetch 방식, query 수, flush 시점과 실제 생성 SQL을 함께 확인해야 합니다.

---

# 헷갈리기 쉬운 점

## JPA는 Hibernate가 아닙니다

JPA는 표준이고 Hibernate는 대표적인 구현체입니다. Dirty Checking 같은 동작은 JPA가 요구하는 Entity 상태 관리 규칙을 Hibernate가 실제 코드로 수행한 결과입니다.

## JPA가 JDBC를 없애는 것은 아닙니다

개발자가 JDBC 코드를 직접 작성하지 않을 뿐, 일반적인 관계형 Database 환경에서 JPA Provider는 JDBC Driver를 통해 SQL을 실행합니다.

---

# 참고 자료

- [Jakarta Persistence — Specification](https://jakarta.ee/specifications/persistence/3.2/jakarta-persistence-spec-3.2)
- [Spring Framework — JPA](https://docs.spring.io/spring-framework/reference/data-access/orm/jpa.html)
