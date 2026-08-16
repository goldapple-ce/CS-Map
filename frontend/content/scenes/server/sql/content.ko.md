# 한눈에 보기

SQL은 관계형 Database에서 데이터를 정의하고 조회·변경하기 위한 언어입니다. 관계형 Database는 데이터를 table의 row와 column으로 구성하고 primary key, foreign key와 constraint로 관계와 규칙을 표현합니다.

이 Scene은 관계형 Database가 SQL을 받아 결과를 만드는 일반적인 흐름을 보여줍니다. Query Optimizer와 Buffer Pool은 MySQL InnoDB의 용어와 동작을 중심으로 구체화합니다.

---

# 처리 흐름

```text
SQL Query
   ↓
Query Optimizer
   ├─ Table Scan → Table
   └─ Index Scan → Index → 필요한 경우 Table Row 조회
                         ↓
                 Table / Index Data
                         ↓
                    Buffer Pool
                         ↓ Cache Miss
                      저장장치
```

Query Optimizer는 가능한 실행 방법을 비교하고 비용이 낮을 것으로 예상되는 Query Execution Plan을 선택합니다.

Table Scan을 선택하면 Table 데이터를 읽습니다. Index Scan을 선택하면 Index에서 row의 식별자를 찾고, 필요한 값이 Index에 모두 있지 않다면 Table row를 추가로 조회합니다.

Table과 Index 데이터는 Buffer Pool에서 먼저 찾고, 없을 때만 저장장치에서 읽습니다.

Transaction은 마지막에 한 번만 거치는 단계가 아니라 여러 query를 하나의 작업 범위로 묶어 commit과 rollback을 관리합니다. Constraint는 Table에 저장될 데이터의 무결성을 보호합니다.

Lock은 여러 Transaction이 같은 데이터에 동시에 접근할 때 충돌하는 작업을 기다리게 하거나 실패시켜 데이터 변경 순서를 제어합니다.

---

# 개발자가 개입하는 지점

개발자는 schema, constraint와 index를 설계하고 SQL을 작성합니다. 느린 query는 SQL 문장만 볼 것이 아니라 `EXPLAIN`으로 실행 계획, 예상 row 수, scan 방식과 join 순서를 함께 확인해야 합니다.

운영 환경에서는 transaction 범위, lock 대기, Connection 수와 migration 방식도 query 성능과 안정성에 영향을 줍니다.

Database 서버가 동시에 허용할 Connection 수도 설정할 수 있습니다. MySQL에서는 `max_connections`로 상한을 정합니다. 애플리케이션 서버가 여러 대라면 각 서버의 Connection Pool 크기를 모두 합한 수가 이 한도를 넘지 않는지 확인해야 합니다.

---

# 헷갈리기 쉬운 점

## SQL과 관계형 Database는 같은 말이 아닙니다

SQL은 언어이고 PostgreSQL이나 MySQL은 SQL을 해석하고 데이터를 관리하는 Database 제품입니다. 제품마다 지원 문법과 실행 방식에는 차이가 있습니다.

## Index가 있으면 항상 사용하는 것은 아닙니다

많은 row를 읽어야 하거나 index 사용 비용이 더 크다고 판단하면 Query Optimizer가 sequential scan을 선택할 수 있습니다.

## Buffer Pool은 SQL 결과를 저장하는 Cache가 아닙니다

Buffer Pool은 table과 index의 page를 memory에 보관합니다. 같은 query가 아니더라도 같은 page를 사용하는 작업은 Buffer Pool의 이점을 얻을 수 있습니다.

## 최대 Connection 수와 Connection Pool은 다릅니다

`max_connections`는 Database 서버가 동시에 받아들일 수 있는 Connection의 상한입니다. Connection Pool은 애플리케이션이 만들어 둔 Connection을 빌려주고 다시 회수하여 재사용하는 기능입니다.

Database의 최대 Connection 수만 크게 올린다고 처리 성능이 자동으로 좋아지지는 않습니다. 동시에 실행되는 query가 너무 많아지면 CPU, memory와 lock 경합이 오히려 커질 수 있습니다.

## Table과 저장장치는 같은 노드가 아닙니다

Table과 Index는 데이터를 정리하고 찾는 구조입니다. 저장장치는 그 데이터를 실제로 보관하고, Buffer Pool은 자주 사용하는 데이터를 memory에 잠시 보관합니다.

---

# 참고 자료

- [PostgreSQL — SQL Language](https://www.postgresql.org/docs/current/tutorial-sql.html)
- [PostgreSQL — Using EXPLAIN](https://www.postgresql.org/docs/current/using-explain.html)
- [PostgreSQL — Indexes](https://www.postgresql.org/docs/current/indexes.html)
- [MySQL — Query Execution Plan](https://dev.mysql.com/doc/refman/8.4/en/execution-plan-information.html)
- [MySQL — InnoDB Buffer Pool](https://dev.mysql.com/doc/refman/8.4/en/innodb-buffer-pool.html)
- [MySQL — InnoDB On-Disk Structures](https://dev.mysql.com/doc/refman/8.4/en/innodb-on-disk-structures.html)
- [MySQL — Server System Variables: max_connections](https://dev.mysql.com/doc/refman/8.4/en/server-system-variables.html#sysvar_max_connections)
