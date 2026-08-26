# 한눈에 보기

`JdbcTemplate`은 Spring JDBC의 중심 Class입니다. Application Code가 제공한 SQL과 Parameter를 JDBC API로 실행하고 결과를 돌려줍니다.

이 과정에서 Connection 획득과 반환, Statement 실행, `ResultSet` 순회와 자원 정리를 담당합니다. 개발자는 조회 결과를 객체로 바꾸는 `RowMapper` 같은 확장 지점에 집중할 수 있습니다.

JDBC에서 발생한 `SQLException`은 Spring의 `DataAccessException` 계층으로 변환합니다. 진행 중인 Spring Transaction이 있으면 그 Transaction에 연결된 Connection을 사용합니다.

---

# 참고 자료

- [Spring Framework — JdbcTemplate](https://docs.spring.io/spring-framework/reference/data-access/jdbc/core.html#jdbc-JdbcTemplate)
- [Spring Framework — Database Connections](https://docs.spring.io/spring-framework/reference/data-access/jdbc/connections.html)
