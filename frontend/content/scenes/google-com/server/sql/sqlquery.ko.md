# 한눈에 보기

SQL Query는 관계형 Database에 어떤 데이터를 정의하고, 조회하고, 변경할지 전달하는 명령입니다.

대표적으로 `SELECT`, `INSERT`, `UPDATE`, `DELETE`를 사용하며 table이나 index 같은 구조를 정의하는 DDL도 SQL에 포함됩니다.

---

# 기본 형태

```sql
SELECT id, email
FROM member
WHERE email = ?;
```

이 query는 `member` table에서 email 조건을 만족하는 row의 `id`와 `email` column을 요청합니다.

Database는 SQL의 의미와 현재 schema, 통계와 index를 바탕으로 실행 계획을 선택합니다. 같은 결과를 만드는 SQL이라도 작성 방식과 데이터 분포에 따라 계획과 실행 비용이 달라질 수 있습니다.

---

# 개발자가 개입하는 지점

개발자는 필요한 데이터만 명확하게 조회하고 외부 값은 parameter binding으로 전달합니다.

```java
PreparedStatement statement = connection.prepareStatement(
    "select id, email from member where email = ?"
);
statement.setString(1, email);
```

문자열을 이어 붙여 SQL을 만들면 SQL Injection 위험이 생길 수 있습니다. JDBC, MyBatis, JdbcTemplate이나 JPA를 사용하더라도 parameter binding 원칙은 같습니다.

---

# 헷갈리기 쉬운 점

## SQL 하나가 항상 한 row만 처리하는 것은 아닙니다

SQL은 조건에 맞는 여러 row를 한 번에 조회하거나 변경할 수 있는 집합 중심 언어입니다.

## Query가 짧다고 실행 비용도 작은 것은 아닙니다

짧은 SQL도 많은 row를 scan하거나 큰 sort와 join을 수행할 수 있습니다. 실제 비용은 실행 계획과 데이터 양을 확인해야 합니다.

---

# 참고 자료

- [PostgreSQL — Querying a Table](https://www.postgresql.org/docs/current/tutorial-select.html)
- [Java — PreparedStatement API](https://docs.oracle.com/en/java/javase/21/docs/api/java.sql/java/sql/PreparedStatement.html)
