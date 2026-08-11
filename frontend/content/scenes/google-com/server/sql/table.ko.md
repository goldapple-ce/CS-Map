# 한눈에 보기

Table은 관계형 Database가 데이터를 row와 column으로 구성하는 논리적인 단위입니다.

Query Optimizer는 조건에 맞는 데이터를 찾기 위해 Index를 사용할 수도 있고, Table의 데이터를 넓게 읽을 수도 있습니다.

---

# Table Scan

Table Scan은 Table의 데이터를 차례로 확인하며 조건에 맞는 row를 찾는 방식입니다. PostgreSQL에서는 일반적으로 Sequential Scan, MySQL에서는 Full Table Scan이라는 표현을 볼 수 있습니다.

```sql
SELECT id, email
FROM member
WHERE active = true;
```

`active = true`인 회원이 Table 대부분이라면 Index를 여러 번 따라가는 것보다 Table을 넓게 읽는 편이 더 저렴할 수 있습니다. 따라서 Table Scan이 선택되었다고 해서 반드시 문제가 있는 것은 아닙니다.

---

# Key와 Constraint

Key는 row를 식별하거나 Table 사이의 관계를 표현하고, Constraint는 저장되는 데이터가 반드시 지켜야 할 규칙을 정의합니다.

- `PRIMARY KEY`: 각 row를 구분할 수 있는 고유한 key입니다.
- `FOREIGN KEY`: 다른 Table의 key를 참조하여 Table 사이의 관계를 보호합니다.
- `NOT NULL`: 값이 반드시 존재하도록 합니다.
- `UNIQUE`: 지정한 값 또는 값의 조합이 중복되지 않도록 합니다.
- `CHECK`: 값이 지정한 조건을 만족하도록 합니다.

```sql
CREATE TABLE member (
    id BIGINT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    age INTEGER CHECK (age >= 0)
);
```

애플리케이션 검증은 사용자에게 빠르고 이해하기 쉬운 오류를 알려주는 역할을 합니다. Constraint는 다른 애플리케이션이나 동시 요청이 데이터를 변경하더라도 잘못된 값이 저장되지 않도록 Database에서 마지막으로 확인합니다.

---

# Buffer Pool과의 관계

Database는 Table의 필요한 데이터를 Buffer Pool에서 먼저 찾습니다. 데이터가 없으면 저장장치에서 읽어 Buffer Pool에 보관한 뒤 사용합니다.

따라서 Table Scan도 필요한 데이터가 이미 Buffer Pool에 있는지에 따라 실행 시간이 달라질 수 있습니다.

Index Scan에서 row의 위치나 식별자를 찾은 뒤 `SELECT *`처럼 row의 실제 데이터가 필요하면 Table을 조회합니다. 이때도 필요한 Table 데이터를 Buffer Pool에서 먼저 찾습니다. Query에 필요한 값이 Index에 모두 있는 경우에는 Table 조회를 생략할 수 있습니다.

---

# 개발자가 개입하는 지점

개발자는 Table의 column, data type, primary key와 constraint를 설계합니다. Query가 필요 이상으로 많은 row나 column을 읽지 않는지도 확인해야 합니다.

Table Scan이 보이면 무조건 Index부터 추가하지 말고 `EXPLAIN`으로 예상 row 수와 실제 조회 범위를 확인합니다. Table 대부분을 읽는 Query라면 Table Scan이 알맞은 선택일 수 있습니다.

---

# 헷갈리기 쉬운 점

## Table은 저장장치 자체가 아닙니다

Table은 데이터를 row와 column으로 바라보는 논리적인 구조입니다. Database는 이 데이터를 내부 단위로 나누어 저장장치와 Buffer Pool에서 관리합니다.

## Table Scan은 항상 느리지 않습니다

작은 Table이나 많은 row를 읽는 Query에서는 Index Scan보다 Table Scan이 더 단순하고 빠를 수 있습니다. 어떤 방식이 알맞은지는 데이터 양과 실행 계획을 함께 봐야 합니다.

---

# 참고 자료

- [PostgreSQL — Using EXPLAIN](https://www.postgresql.org/docs/current/using-explain.html)
- [PostgreSQL — Constraints](https://www.postgresql.org/docs/current/ddl-constraints.html)
- [MySQL — EXPLAIN Output](https://dev.mysql.com/doc/refman/8.4/en/explain-output.html)
- [MySQL — InnoDB Buffer Pool](https://dev.mysql.com/doc/refman/8.4/en/innodb-buffer-pool.html)
