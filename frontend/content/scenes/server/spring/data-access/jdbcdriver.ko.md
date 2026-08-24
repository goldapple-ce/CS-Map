# 한눈에 보기

JDBC Driver는 JDBC API를 구현하고 Java 애플리케이션과 특정 관계형 Database 사이의 실제 연결과 통신을 담당합니다.

PostgreSQL JDBC Driver, MySQL Connector/J처럼 Database 제품마다 알맞은 Driver가 필요합니다.

---

# 동작 방식

1. JDBC URL을 해석해 Database server에 연결합니다.
2. JDBC API로 전달된 SQL과 parameter를 Database별 message로 변환합니다.
3. Database 고유 network protocol로 요청을 전송합니다.
4. 응답을 JDBC의 `ResultSet`이나 update 결과로 변환합니다.

```text
JDBC API → JDBC Driver → Database 전용 Protocol → RDB
```

---

# 개발자가 개입하는 지점

개발자는 사용하는 Database에 맞는 Driver dependency와 JDBC URL을 설정합니다.

```text
jdbc:postgresql://localhost:5432/app
jdbc:mysql://localhost:3306/app
```

Spring Boot에서는 보통 classpath의 Driver와 datasource 설정을 바탕으로 알맞은 Driver를 자동 선택합니다. Driver version은 Database server 및 Java version과의 호환성을 확인해야 합니다.

---

# 헷갈리기 쉬운 점

## JDBC Driver와 DataSource는 다릅니다

JDBC Driver는 Database protocol을 구현합니다. DataSource는 애플리케이션에 JDBC Connection을 공급하며, HikariCP 같은 구현체는 Connection Pool도 관리합니다.

## JDBC Driver도 전용 Driver입니다

NoSQL Driver만 저장소 전용인 것이 아닙니다. JDBC Driver도 PostgreSQL, MySQL처럼 각 Database 제품의 protocol을 알고 있는 전용 구현체이며, JDBC API라는 공통 interface를 구현한다는 점이 다릅니다.

---

# 참고 자료

- [Java — JDBC API](https://docs.oracle.com/en/java/javase/21/docs/api/java.sql/java/sql/package-summary.html)
- [PostgreSQL — JDBC Driver](https://jdbc.postgresql.org/documentation/)
- [MySQL — Connector/J](https://dev.mysql.com/doc/connector-j/en/)
