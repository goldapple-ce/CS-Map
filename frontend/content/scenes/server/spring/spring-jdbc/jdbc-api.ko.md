# 한눈에 보기

JDBC API는 Java Application이 관계형 Database에 연결하고 SQL을 실행하며 결과를 읽는 방법을 정의한 표준 API입니다.

`Connection`, `PreparedStatement`, `ResultSet` 같은 Interface는 공통 사용법을 제공합니다. 실제 동작은 Database 제품에 맞는 JDBC Driver 구현으로 이어집니다.

Spring JDBC는 JDBC API를 대체하지 않습니다. `JdbcTemplate`이 이 API를 사용하면서 반복적인 자원 관리와 예외 처리를 대신합니다.

---

# 참고 자료

- [Java Tutorials — JDBC Basics](https://docs.oracle.com/javase/tutorial/jdbc/basics/)
- [Java SE — java.sql](https://docs.oracle.com/en/java/javase/25/docs/api/java.sql/java/sql/package-summary.html)
