# 한눈에 보기

Spring JDBC는 Java의 JDBC API를 사용하면서 Connection 정리, Statement 실행과 예외 처리에 반복되는 코드를 줄입니다. 개발자는 SQL과 Parameter, 조회 결과를 객체로 바꾸는 방법에 집중할 수 있습니다.

이 Scene의 중심 흐름은 `JdbcTemplate → JDBC API → JDBC Driver → Database`입니다. `JdbcClient`는 이 흐름 앞에서 더 편리한 Fluent API를 제공하는 선택지이며 필수 단계는 아닙니다.

---

# SQL 실행 흐름

Application Code는 `JdbcClient`나 `JdbcTemplate` 중 하나를 직접 사용할 수 있습니다.

`JdbcClient`는 일반적인 조회와 변경을 연속된 Method 호출로 작성하게 해주는 간결한 Facade입니다. 실제 실행은 내부의 `JdbcTemplate` 또는 `NamedParameterJdbcTemplate`에 위임합니다. Batch나 Stored Procedure처럼 `JdbcClient`가 제공하지 않는 기능은 `JdbcTemplate` 등을 직접 사용할 수 있습니다.

`JdbcTemplate`은 `DataSource`에서 Connection을 얻고 JDBC API로 Statement를 실행합니다. 실행 뒤에는 `Connection`, `Statement`, `ResultSet` 같은 JDBC 자원을 적절히 정리합니다.

JDBC API는 Java Application이 Database 제품과 같은 형태로 상호작용하기 위한 표준 Interface입니다. Database별 JDBC Driver가 이 규약에 맞는 구현을 제공하고, 해당 Database가 이해하는 Network Protocol로 SQL과 결과를 전달합니다.

Database가 SQL을 해석하고 데이터를 찾는 내부 과정은 `Database / SQL` Topic에서 이어집니다.

---

# 실행을 지원하는 관계

`DataSource`는 Database 연결 정보와 Connection 획득 방식을 감추고 JDBC `Connection`을 제공합니다. 운영 환경에서는 Connection Pool 구현이 `DataSource` 역할을 맡는 경우가 많지만, `DataSource` 자체가 반드시 Pool을 뜻하는 것은 아닙니다.

JDBC 작업이 `SQLException`을 발생시키면 `JdbcTemplate`은 이를 Spring의 `DataAccessException` 계층으로 변환합니다. Application Code는 Database 제품이나 Data Access 기술마다 다른 Checked Exception 대신 일관된 Spring 예외 계층으로 실패를 처리할 수 있습니다.

`JdbcTemplate`은 진행 중인 Spring Transaction이 있으면 그 Transaction에 연결된 Connection을 사용해 현재 작업에 참여합니다. Transaction 경계를 열고 commit·rollback하는 과정은 상위 `Transaction` Topic에서 다루므로 이 Scene에서는 반복하지 않습니다.

---

# 개발자가 개입하는 지점

개발자는 SQL, Parameter와 결과 Mapping을 작성하고 `DataSource`와 JDBC Driver를 설정합니다. 문제가 생기면 Spring JDBC 호출, Connection 획득, Driver 설정, Database가 실행한 SQL 순서로 경계를 나누어 확인할 수 있습니다.

---

# 참고 자료

- [Spring Framework — JDBC Core](https://docs.spring.io/spring-framework/reference/data-access/jdbc/core.html)
- [Spring Framework — Database Connections](https://docs.spring.io/spring-framework/reference/data-access/jdbc/connections.html)
- [Spring Framework — DAO Support](https://docs.spring.io/spring-framework/reference/data-access/dao.html)
- [Java SE — DataSource](https://docs.oracle.com/en/java/javase/25/docs/api/java.sql/javax/sql/DataSource.html)
- [Java SE — Driver](https://docs.oracle.com/en/java/javase/25/docs/api/java.sql/java/sql/Driver.html)
