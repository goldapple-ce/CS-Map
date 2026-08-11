# 한눈에 보기

SQL Query는 관계형 Database에 어떤 데이터를 정의하고, 조회하고, 변경할지 전달하는 명령입니다.

SQL에는 데이터를 조회·변경하는 명령뿐 아니라 table 구조, 권한과 transaction을 다루는 명령도 포함됩니다.

---

# SQL 명령의 종류

- DDL(Data Definition Language): Database 구조를 정의합니다. `CREATE`, `ALTER`, `DROP`이 대표적입니다.
- DML(Data Manipulation Language): table의 데이터를 조회하거나 변경합니다. `SELECT`, `INSERT`, `UPDATE`, `DELETE`가 대표적입니다.
- DCL(Data Control Language): 사용자에게 권한을 부여하거나 회수합니다. `GRANT`, `REVOKE`가 대표적입니다.
- TCL(Transaction Control Language): transaction을 확정하거나 되돌립니다. `COMMIT`, `ROLLBACK`, `SAVEPOINT`가 대표적입니다.

이 분류는 SQL 명령을 처음 배울 때 용도를 구분하기 위한 것입니다. 자료에 따라 `SELECT`를 DML이 아니라 DQL(Data Query Language)로 따로 분류하기도 합니다.

---

# SELECT의 논리적 처리 순서

SQL은 `SELECT`부터 작성하지만, Database가 결과를 만드는 논리적인 순서는 다릅니다.

```text
FROM
  ↓
ON
  ↓
JOIN
  ↓
WHERE
  ↓
GROUP BY
  ↓
HAVING
  ↓
SELECT
  ↓
DISTINCT
  ↓
ORDER BY
  ↓
LIMIT / OFFSET
```

- `FROM`: 기준이 되는 table을 가져옵니다.
- `ON`: 두 table에서 서로 연결할 row를 판단합니다.
- `JOIN`: `ON` 조건을 바탕으로 두 table을 결합합니다. Outer Join이라면 짝이 없는 row도 이 단계에서 결과에 포함합니다.
- `WHERE`: Join까지 끝난 결과에서 조건에 맞지 않는 row를 제거합니다.
- `GROUP BY`: 남은 row를 같은 값끼리 묶습니다.
- `HAVING`: 만들어진 group을 조건으로 걸러냅니다.
- `SELECT`: 최종 결과에 표시할 column과 계산값을 만듭니다.
- `DISTINCT`: 중복된 결과를 제거합니다.
- `ORDER BY`: 결과를 정렬합니다.
- `LIMIT`과 `OFFSET`: 정렬된 결과 중 반환할 범위를 정합니다.

---

# JOIN의 종류

JOIN은 서로 관련된 두 Table의 row를 `ON` 조건으로 연결합니다. 처음에는 `INNER JOIN`과 `LEFT JOIN`의 차이를 이해하면 충분합니다.

## INNER JOIN

양쪽 Table에서 `ON` 조건이 맞는 row만 결과에 포함합니다.

```sql
SELECT member.name, orders.id
FROM member
INNER JOIN orders
  ON orders.member_id = member.id;
```

주문이 없는 회원은 연결할 `orders` row가 없으므로 결과에 나오지 않습니다.

## LEFT JOIN

왼쪽 Table의 row는 모두 유지하고, 오른쪽 Table에서 조건에 맞는 row가 있으면 연결합니다.

```sql
SELECT member.name, orders.id
FROM member
LEFT JOIN orders
  ON orders.member_id = member.id;
```

주문이 없는 회원도 결과에 나오며, 이때 `orders.id`는 `NULL`이 됩니다.

---

# ON과 WHERE의 차이

`ON`은 두 table을 어떻게 연결할지 정하고, `WHERE`는 연결이 끝난 결과를 다시 걸러냅니다. 따라서 `ON`이 `WHERE`보다 먼저 처리됩니다.

특히 `LEFT JOIN`에서는 조건을 어디에 작성하느냐에 따라 결과가 달라집니다.

```sql
SELECT member.id, orders.id
FROM member
LEFT JOIN orders
  ON orders.member_id = member.id
 AND orders.status = 'PAID';
```

결제 완료 주문이 없는 회원도 결과에 남습니다. 해당 회원의 `orders` column만 `NULL`이 됩니다.

```sql
SELECT member.id, orders.id
FROM member
LEFT JOIN orders
  ON orders.member_id = member.id
WHERE orders.status = 'PAID';
```

이번에는 Join이 끝난 뒤 `WHERE`가 적용됩니다. 주문이 없어서 `orders.status`가 `NULL`인 회원은 조건을 통과하지 못하므로 결과에서 빠집니다.

`INNER JOIN`에서는 조건을 `ON`과 `WHERE` 중 어디에 두어도 같은 결과가 나오는 경우가 많습니다. 하지만 두 절의 역할은 다르고, Outer Join에서는 결과가 달라질 수 있으므로 Join 조건은 `ON`, 최종 결과를 거르는 조건은 `WHERE`에 작성하는 편이 이해하기 쉽습니다.

---

# 간단한 조회 예시

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
- [PostgreSQL — Joined Tables](https://www.postgresql.org/docs/current/queries-table-expressions.html#QUERIES-JOIN)
- [PostgreSQL — SELECT](https://www.postgresql.org/docs/current/sql-select.html)
- [PostgreSQL — SQL Commands](https://www.postgresql.org/docs/current/sql-commands.html)
- [Microsoft SQL Server — SELECT의 논리적 처리 순서](https://learn.microsoft.com/en-us/sql/t-sql/queries/select-transact-sql)
- [Java — PreparedStatement API](https://docs.oracle.com/en/java/javase/21/docs/api/java.sql/java/sql/PreparedStatement.html)
