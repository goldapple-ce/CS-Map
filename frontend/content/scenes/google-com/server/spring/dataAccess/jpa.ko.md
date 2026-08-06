# 한눈에 보기

JPA는 Java 객체와 관계형 Database table을 연결하고 Entity를 저장·조회하기 위한 표준입니다. 현재 공식 명칭은 Jakarta Persistence이며, 기존 이름인 JPA가 널리 사용됩니다.

JPA는 interface와 동작 규칙을 정의하지만 Database와 직접 통신하는 완성된 제품은 아닙니다. Hibernate 같은 구현체가 필요합니다.

---

# 동작 방식

- `Entity`: Database table과 연결해 관리할 Java 객체입니다.
- `EntityManager`: Entity 저장, 조회, 삭제와 query 실행을 담당하는 핵심 API입니다.
- `Persistence Context`: 관리 중인 Entity와 Database 상태 사이의 변경을 추적합니다.
- `Mapping`: annotation을 이용해 객체와 table, field와 column 관계를 정의합니다.

Transaction 안에서 Entity가 변경되면 JPA 구현체는 변경 내용을 추적했다가 필요한 시점에 SQL로 반영할 수 있습니다.

---

# 개발자가 개입하는 지점

```java
@Entity
class Member {
    @Id
    @GeneratedValue
    private Long id;

    private String email;
}
```

개발자는 Entity, 식별자, 연관 관계와 fetch 방식을 설계합니다. 객체 관계가 그대로 효율적인 SQL을 보장하는 것은 아니므로 실제 생성 query도 함께 확인해야 합니다.

---

# 헷갈리기 쉬운 점

## JPA는 Hibernate가 아닙니다

JPA는 구현해야 할 표준이고 Hibernate는 그 표준을 구현한 제품입니다. JPA API를 중심으로 코드를 작성하면 구현체에 직접 의존하는 범위를 줄일 수 있습니다.

## JPA가 JDBC를 없애는 것은 아닙니다

개발자가 JDBC 코드를 직접 작성하지 않을 뿐, 일반적인 관계형 Database 환경에서 JPA 구현체는 내부적으로 JDBC를 사용해 SQL을 실행합니다.

---

# 참고 자료

- [Jakarta Persistence — Specification](https://jakarta.ee/specifications/persistence/)
- [Spring Framework — JPA](https://docs.spring.io/spring-framework/reference/data-access/orm/jpa.html)
