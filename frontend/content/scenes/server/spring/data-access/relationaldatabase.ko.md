# 한눈에 보기

이 노드는 Spring Data JPA와 Spring Data JDBC의 SQL이 최종적으로 도달하는 관계형 Database를 나타냅니다.

Database는 제품별 JDBC Driver가 전용 protocol로 전달한 SQL을 해석하고 transaction, constraint, index와 storage engine을 이용해 데이터를 처리한 뒤 결과를 반환합니다.

---

# 개발자가 개입하는 지점

개발자는 table, column, primary key와 foreign key, constraint, index와 query를 설계합니다. ORM이나 Repository를 사용하더라도 실제 SQL 실행 계획과 Database resource 사용은 별도로 확인해야 합니다.

관계형 Database 내부의 핵심 설명은 공용 Database 영역에서 다루고, 이 토픽은 Spring Data의 두 관계형 경로가 합류하는 지점만 설명합니다.

---

# 참고 자료

- [Spring Framework — Data Access](https://docs.spring.io/spring-framework/reference/data-access.html)
- [Java — JDBC API](https://docs.oracle.com/en/java/javase/21/docs/api/java.sql/java/sql/package-summary.html)
