# 한눈에 보기

Index는 Table 전체를 확인하지 않고 원하는 row를 빠르게 찾기 위해 별도로 만드는 탐색 구조입니다.

관계형 Database의 일반적인 Index에는 B+Tree 계열 구조가 널리 사용됩니다. 값이 정렬된 상태로 유지되므로 같은 값 찾기, 범위 검색과 정렬에 활용할 수 있습니다.

---

# B+Tree 구조

B+Tree는 위에서부터 검색 범위를 단계적으로 좁혀 가는 균형 잡힌 Tree입니다.

```text
                Root
             [30 | 60]
             /    |    \
        30 미만  30~59  60 이상
           ↓       ↓       ↓
        Leaf ↔  Leaf  ↔  Leaf
       [10,20]  [30,50]  [60,80]
```

- Root: 검색을 시작하며 어느 방향으로 내려갈지 정합니다.
- 중간 Node: 값의 범위를 더 작게 좁힙니다.
- Leaf: 실제 Index 값과 해당 row를 찾기 위한 정보를 보관합니다.

Tree의 높이가 한쪽으로 치우치지 않도록 유지되기 때문에 데이터가 많아져도 Root부터 Leaf까지 몇 단계만 내려가 원하는 범위를 찾을 수 있습니다.

Leaf의 값은 순서대로 이어져 있습니다. `id BETWEEN 30 AND 60` 같은 범위 조건은 시작 위치를 찾은 뒤 옆의 값을 차례로 읽을 수 있습니다. `ORDER BY`의 정렬 방향과 Index가 맞으면 별도의 정렬 작업을 줄일 수도 있습니다.

Database 문서에서는 이런 계열을 넓게 B-tree라고 부르기도 합니다. 제품마다 세부 구현은 다르지만, 처음에는 Root에서 범위를 좁히고 Leaf에서 Index 값을 찾는 구조로 이해하면 충분합니다.

---

# Index 사용

```sql
CREATE INDEX member_email_idx ON member(email);
```

이 Index는 `email` 값을 순서대로 관리하여 특정 email이나 email 범위를 찾는 데 사용할 수 있습니다. 하지만 Index가 존재한다고 Query Optimizer가 항상 선택하는 것은 아닙니다.

조건에 맞는 row가 너무 많거나 Index를 거쳐 Table을 다시 읽는 비용이 더 크다고 판단하면 Table Scan을 선택할 수 있습니다.

---

# Index에서 찾은 뒤에는

Index를 이용한 조회도 먼저 Index 데이터를 읽어야 합니다. Database는 필요한 Index 데이터가 Buffer Pool에 있는지 확인하고, 없으면 저장장치에서 가져옵니다.

`SELECT *`처럼 row의 여러 column이 필요하다면 Index에서 조건에 맞는 row의 위치나 식별자를 찾은 뒤 Table 데이터를 조회합니다.

```text
Query Optimizer
       ↓
     Index
조건에 맞는 Row 식별자 찾기
       ↓
     Table
Row의 실제 데이터 조회
       ↓
  Buffer Pool
```

다만 Index에서 찾은 다음 흐름에는 다음과 같은 예외가 있습니다.

- Query에 필요한 값이 Index에 모두 있으면 Table row를 추가로 읽지 않고 결과를 만들 수 있습니다. 이를 Covering Index 또는 Index Only Scan이라고 합니다.
- Index에 필요한 값이 부족하면 Index가 알려준 row의 위치나 식별자를 이용해 Table 데이터를 추가로 읽습니다. 이 Table 데이터도 Buffer Pool에서 먼저 찾습니다.

MySQL InnoDB에서는 Primary Key Index가 row 데이터를 Leaf에 함께 보관합니다. Secondary Index는 해당 row의 Primary Key를 보관하고, 필요한 column이 부족하면 그 Primary Key로 다시 row를 찾습니다.

---

# 복합 Index

```sql
CREATE INDEX member_status_created_idx
ON member(status, created_at);
```

복합 Index는 column 순서가 중요합니다. 위 Index는 먼저 `status`로 정렬하고, 같은 `status` 안에서 `created_at`으로 정렬합니다.

따라서 `status`를 기준으로 찾거나 `status`와 `created_at`을 함께 사용하는 Query에는 도움이 될 수 있습니다. 반면 `created_at`만 사용하는 Query에서는 이 Index를 충분히 활용하지 못할 수 있습니다.

---

# 개발자가 개입하는 지점

개발자는 실제 `WHERE`, `JOIN`과 `ORDER BY` 조건을 보고 Index를 설계하고 `EXPLAIN`으로 사용 여부를 확인합니다.

Index는 조회를 빠르게 할 수 있지만 저장 공간을 사용하며 `INSERT`, `UPDATE`, `DELETE` 때 함께 수정해야 합니다. 자주 검색하는 column이라는 이유만으로 모든 column에 Index를 추가하면 쓰기와 관리 비용이 커질 수 있습니다.

사용되지 않는 Index와 역할이 겹치는 Index도 주기적으로 확인해야 합니다.

---

# 헷갈리기 쉬운 점

## Index가 있으면 항상 빠른 것은 아닙니다

Table의 많은 row를 가져와야 한다면 Table Scan이 더 빠를 수 있습니다. Query Optimizer는 예상 비용을 비교하여 접근 방식을 선택합니다.

## B+Tree가 모든 검색에 알맞은 것은 아닙니다

B+Tree는 같은 값과 범위 검색에 유리합니다. 하지만 문자열 중간 검색, 전문 검색이나 공간 데이터처럼 다른 성격의 검색에는 Database가 제공하는 다른 Index 방식이 필요할 수 있습니다.

## Index도 Buffer Pool을 사용합니다

Index가 저장장치에만 고정되어 있는 것은 아닙니다. 자주 사용하는 Index 데이터는 Buffer Pool에 보관될 수 있으므로 Index Scan 성능도 cache 상태의 영향을 받습니다.

---

# 참고 자료

- [PostgreSQL — Index Types](https://www.postgresql.org/docs/current/indexes-types.html)
- [PostgreSQL — Indexes and ORDER BY](https://www.postgresql.org/docs/current/indexes-ordering.html)
- [MySQL — Column Indexes](https://dev.mysql.com/doc/refman/8.4/en/column-indexes.html)
- [MySQL — InnoDB Index Structure](https://dev.mysql.com/doc/refman/8.4/en/innodb-physical-structure.html)
- [MySQL — Clustered and Secondary Indexes](https://dev.mysql.com/doc/refman/8.4/en/innodb-index-types.html)
- [PostgreSQL — Index-Only Scans](https://www.postgresql.org/docs/current/indexes-index-only-scans.html)
