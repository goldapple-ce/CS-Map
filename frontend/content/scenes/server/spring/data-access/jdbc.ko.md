# 한눈에 보기

JDBC API는 Java 애플리케이션이 관계형 Database 작업을 요청하기 위한 표준 interface입니다.

`Connection`, `PreparedStatement`와 `ResultSet` 같은 공통 사용 방식을 정의하지만 Database별 network 통신을 직접 구현하지는 않습니다. 실제 구현과 통신은 JDBC Driver가 담당합니다.

---

# 동작 방식

1. DataSource 등으로부터 JDBC Connection을 얻습니다.
2. `PreparedStatement` 등에 SQL과 parameter를 설정합니다.
3. JDBC Driver interface를 통해 SQL 실행을 요청합니다.
4. 조회 결과를 `ResultSet`으로 받습니다.
5. 사용한 Statement와 ResultSet을 정리하고 Connection을 반환합니다.

Spring의 `JdbcTemplate`은 resource 정리와 예외 변환 같은 반복 작업을 대신 처리합니다.

---

# 개발자가 개입하는 지점

JDBC를 직접 사용한다면 SQL과 parameter mapping, 조회 결과를 객체로 변환하는 코드를 작성합니다.

```java
return jdbcTemplate.queryForObject(
    "select id, email from member where id = ?",
    memberRowMapper,
    memberId
);
```

JPA를 사용하더라도 실제 실행 SQL, parameter와 느린 query를 확인하는 과정에서는 JDBC 계층을 이해하는 것이 도움이 됩니다. Connection Pool 설정은 DataSource 토픽에서 다룹니다.

---

# 헷갈리기 쉬운 점

## JDBC와 JdbcTemplate은 다릅니다

JDBC는 Java 표준 API이고, `JdbcTemplate`은 JDBC를 편리하게 사용하도록 Spring Framework가 제공하는 class입니다.

## JDBC API와 JDBC Driver는 다릅니다

JDBC API는 애플리케이션이 사용하는 공통 interface를 정의합니다. PostgreSQL이나 MySQL용 JDBC Driver는 그 interface를 구현하고 제품별 protocol로 실제 통신합니다.

---

# 참고 자료

- [Java — JDBC API](https://docs.oracle.com/en/java/javase/21/docs/api/java.sql/java/sql/package-summary.html)
- [Spring Framework — Data Access with JDBC](https://docs.spring.io/spring-framework/reference/data-access/jdbc.html)
