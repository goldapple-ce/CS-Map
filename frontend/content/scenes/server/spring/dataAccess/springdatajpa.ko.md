# 한눈에 보기

Spring Data JPA는 JPA를 기반으로 Repository를 구현해 주는 Spring Data module입니다.

개발자가 `JpaRepository`를 확장한 interface를 작성하면 Spring Data JPA가 Repository Proxy와 구현 객체를 만들고, JPA의 `EntityManager`를 이용해 작업을 실행합니다.

---

# 동작 방식

```java
interface MemberRepository extends JpaRepository<Member, Long> {
    Optional<Member> findByEmail(String email);
}
```

1. Repository interface와 Entity type을 확인합니다.
2. `JpaRepositoryFactory`가 Repository Proxy를 만듭니다.
3. 기본 CRUD는 `SimpleJpaRepository` 구현으로 연결합니다.
4. Query method를 JPA query로 해석합니다.
5. `EntityManager`를 통해 JPA Provider에 실행을 맡깁니다.

---

# 개발자가 개입하는 지점

개발자는 Entity mapping, Repository interface와 query를 작성합니다. `@Query`, Specification, EntityGraph와 custom Repository로 기본 기능을 확장할 수 있습니다.

관계 mapping과 fetch 전략에 따라 생성되는 SQL과 성능이 크게 달라질 수 있으므로 Hibernate가 실행한 SQL도 함께 확인해야 합니다.

---

# 헷갈리기 쉬운 점

## Spring Data JPA와 JPA는 다릅니다

JPA는 ORM 표준이고 Spring Data JPA는 그 표준 위에 Repository 추상화를 제공하는 Spring 프로젝트입니다.

## JpaRepository가 SQL을 직접 실행하지 않습니다

Repository 구현은 JPA를 사용하고, 실제 SQL 생성과 실행은 Hibernate 같은 JPA Provider가 JDBC를 통해 처리합니다.

---

# 참고 자료

- [Spring Data JPA — Reference](https://docs.spring.io/spring-data/jpa/reference/index.html)
- [Spring Data JPA — JpaRepository API](https://docs.spring.io/spring-data/jpa/docs/current/api/org/springframework/data/jpa/repository/JpaRepository.html)
