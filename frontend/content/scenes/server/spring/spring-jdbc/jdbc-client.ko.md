# 한눈에 보기

`JdbcClient`는 일반적인 JDBC 조회와 변경을 Fluent API로 작성하게 해주는 Spring JDBC의 Facade입니다.

Application Code는 위치 기반 Parameter와 이름 기반 Parameter를 같은 형태의 API로 사용할 수 있습니다. 실제 SQL 실행은 내부의 `JdbcTemplate` 또는 `NamedParameterJdbcTemplate`에 위임합니다.

`JdbcClient`는 편의를 위한 선택지입니다. Batch나 Stored Procedure처럼 지원 범위 밖의 기능이 필요하면 `JdbcTemplate`이나 다른 Spring JDBC API를 직접 사용할 수 있습니다.

---

# 참고 자료

- [Spring Framework — JdbcClient](https://docs.spring.io/spring-framework/reference/data-access/jdbc/core.html#jdbc-JdbcClient)
