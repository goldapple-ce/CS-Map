# 한눈에 보기

JDBC Driver는 JDBC 규약에 맞는 구현을 제공하고 특정 Database 제품과 통신하는 Library입니다.

Application은 공통 JDBC API를 호출하지만, Driver는 JDBC URL을 해석하고 Connection을 만들며 Database별 Network Protocol로 SQL과 결과를 전달합니다. 따라서 사용하는 Database 제품에 맞는 Driver를 의존성에 추가하고 주소와 인증 정보를 설정해야 합니다.

---

# 참고 자료

- [Java SE — Driver](https://docs.oracle.com/en/java/javase/25/docs/api/java.sql/java/sql/Driver.html)
- [Java Tutorials — JDBC Driver](https://docs.oracle.com/javase/tutorial/jdbc/basics/gettingstarted.html)
