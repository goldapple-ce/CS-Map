# 한눈에 보기

Spring Data JDBC는 JPA와 Hibernate 없이 JDBC를 기반으로 Repository를 제공하는 Spring Data module입니다.

객체와 table을 mapping하지만 Persistence Context, 변경 감지, lazy loading 같은 JPA 기능은 제공하지 않습니다. 저장 동작이 더 직접적이고 단순합니다.

---

# 동작 방식

```java
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

@Table("member")
class Member {
    @Id
    Long id;

    @Column("email")
    String email;
}

interface MemberRepository extends CrudRepository<Member, Long> {
}
```

1. Repository Proxy가 CRUD 호출을 받습니다.
2. Spring Data JDBC가 aggregate mapping을 해석합니다.
3. 필요한 SQL과 parameter를 준비합니다.
4. Spring JDBC와 JDBC Driver를 통해 관계형 Database에 전달합니다.

---

# 개발자가 개입하는 지점

개발자는 Spring Data Relational의 `@Table`, `@Column`과 Spring Data Commons의 `@Id`를 이용해 aggregate를 mapping하고 Repository interface를 작성합니다. 필요한 경우 `@Query`나 custom 구현으로 SQL을 직접 정의할 수 있습니다.

JPA보다 단순한 mapping을 원하는 경우 유용하지만, 복잡한 객체 관계를 JPA처럼 자동으로 관리해 주지는 않습니다.

---

# 헷갈리기 쉬운 점

## Spring Data JDBC와 JdbcTemplate은 다릅니다

Spring Data JDBC는 Repository와 aggregate mapping을 제공합니다. `JdbcTemplate`은 개발자가 SQL을 직접 작성할 때 반복적인 JDBC 처리를 줄여 주는 API입니다.

## JPA annotation과 이름만 같을 수 있습니다

Spring Data JDBC와 JPA에는 이름이 같은 mapping annotation이 있지만 서로 다른 type입니다.

```text
Spring Data JDBC
├─ org.springframework.data.relational.core.mapping.Table
├─ org.springframework.data.relational.core.mapping.Column
└─ org.springframework.data.annotation.Id

JPA
├─ jakarta.persistence.Table
├─ jakarta.persistence.Column
└─ jakarta.persistence.Id
```

Spring Data JDBC에서는 `jakarta.persistence`가 아니라 Spring Data의 annotation을 사용합니다. JDBC 표준 자체는 `Connection`, `PreparedStatement`와 `ResultSet` 같은 API를 정의할 뿐 객체 mapping annotation을 제공하지 않습니다.

## Spring Data JDBC도 JDBC Driver가 필요합니다

Repository가 JDBC 호출을 감춰 주지만 실제 Database 연결과 SQL 통신에는 Database별 JDBC Driver가 사용됩니다.

---

# 참고 자료

- [Spring Data JDBC — Reference](https://docs.spring.io/spring-data/relational/reference/jdbc.html)
- [Spring Data JDBC — Repository Configuration](https://docs.spring.io/spring-data/relational/reference/api/java/org/springframework/data/jdbc/repository/config/EnableJdbcRepositories.html)
- [Spring Data Relational — Table API](https://docs.spring.io/spring-data/relational/reference/api/java/org/springframework/data/relational/core/mapping/Table.html)
- [Spring Data Commons — Id API](https://docs.spring.io/spring-data/commons/docs/current/api/org/springframework/data/annotation/Id.html)
