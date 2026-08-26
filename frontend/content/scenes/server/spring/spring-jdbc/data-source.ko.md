# 한눈에 보기

`DataSource`는 JDBC `Connection`을 제공하는 표준 Interface입니다. Database 주소와 인증 정보, Connection을 만드는 구체적인 방식을 사용하는 코드에서 분리합니다.

Spring JDBC는 `DataSource`를 통해 Connection을 얻습니다. 운영 환경에서는 Connection을 재사용하는 Pool 구현을 주로 연결하지만, Pool을 사용하지 않는 `DataSource` 구현도 있으므로 두 용어가 같은 뜻은 아닙니다.

---

# 참고 자료

- [Spring Framework — Database Connections](https://docs.spring.io/spring-framework/reference/data-access/jdbc/connections.html)
- [Java SE — DataSource](https://docs.oracle.com/en/java/javase/25/docs/api/java.sql/javax/sql/DataSource.html)
