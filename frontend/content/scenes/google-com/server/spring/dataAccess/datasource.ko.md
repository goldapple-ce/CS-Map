# 한눈에 보기

`DataSource`는 애플리케이션이 JDBC Connection을 얻는 방법을 추상화한 interface입니다.

애플리케이션은 Connection이 새로 만들어졌는지, 기존 Connection을 재사용하는지 직접 알 필요 없이 `DataSource#getConnection()`으로 Connection을 요청할 수 있습니다.

---

# 동작 방식

일반적인 운영 환경에서는 Connection Pool을 구현한 DataSource를 사용합니다.

1. 애플리케이션 시작 시 Pool이 Database Connection을 준비합니다.
2. Hibernate나 JdbcTemplate이 DataSource에 Connection을 요청합니다.
3. DataSource가 사용 가능한 Connection을 대여합니다.
4. 애플리케이션이 JDBC를 통해 SQL을 실행합니다.
5. 작업이 끝나 `close()`를 호출하면 물리 연결을 끊는 대신 Connection을 Pool에 반환합니다.
6. 반환된 Connection은 다음 작업에서 재사용됩니다.

Connection 생성 비용을 줄일 수 있지만, 동시에 사용할 수 있는 Connection 수가 제한되므로 모두 사용 중이면 새 요청은 대기하거나 timeout될 수 있습니다.

---

# 개발자가 개입하는 지점

Spring Boot에서는 URL, 사용자 정보와 Pool 크기 등을 설정합니다.

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/app
    username: app
    password: secret
    hikari:
      maximum-pool-size: 10
      connection-timeout: 30000
```

`spring-boot-starter-jdbc`나 `spring-boot-starter-data-jpa`를 사용하면 일반적으로 HikariCP가 포함되고 pooling DataSource가 자동 설정됩니다. 다른 구현체를 선택하거나 직접 DataSource Bean을 등록할 수도 있습니다.

Pool 크기는 무조건 크게 잡는 것이 좋지 않습니다. 애플리케이션의 동시 작업 수, transaction 길이와 Database가 감당할 수 있는 Connection 수를 함께 고려해야 합니다.

---

# 헷갈리기 쉬운 점

## DataSource와 HikariCP는 같은 것이 아닙니다

DataSource는 JDBC 표준 interface이고, HikariCP는 Connection Pool 기능을 제공하는 대표적인 구현 library입니다.

## DataSource와 JDBC Driver도 다릅니다

DataSource가 Connection을 공급하고 재사용을 관리한다면, JDBC Driver는 Database 제품의 protocol에 맞춰 실제 연결과 통신을 구현합니다.

## Connection Pool과 Database의 최대 Connection 수는 다릅니다

일반적인 Spring Boot 구성에서 Pool은 애플리케이션 process 안에서 동작합니다. Database는 Pool에 보관된 각각의 물리 Connection을 server session으로 받아들이며, 동시에 허용할 수 있는 Connection 수에는 별도의 한도가 있습니다.

애플리케이션 서버가 여러 대라면 각 서버의 Pool 크기가 합산됩니다. 예를 들어 서버 3대가 각각 최대 10개의 Connection을 사용하면 Database에는 최대 30개의 Connection이 연결될 수 있습니다. 따라서 Pool 크기는 Database의 최대 Connection 수와 다른 애플리케이션이 사용할 여유까지 함께 고려해야 합니다.

## TransactionManager가 Pool을 소유하는 것은 아닙니다

TransactionManager는 DataSource에서 얻은 Connection을 현재 transaction에 연결해 commit과 rollback을 관리합니다. Connection의 생성, 대여와 회수는 DataSource와 Pool의 역할입니다.

---

# 참고 자료

- [Spring Framework — Controlling Database Connections](https://docs.spring.io/spring-framework/reference/data-access/jdbc/connections.html)
- [Spring Boot — SQL Databases and Connection Pools](https://docs.spring.io/spring-boot/reference/data/sql.html)
- [Java — DataSource API](https://docs.oracle.com/en/java/javase/21/docs/api/java.sql/javax/sql/DataSource.html)
