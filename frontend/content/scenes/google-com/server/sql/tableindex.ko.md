# 한눈에 보기

Table은 관계형 Database가 row와 column 구조로 데이터를 구성하는 논리적 단위입니다. Index는 특정 값을 더 빠르게 찾기 위해 별도로 유지하는 논리적 탐색 구조입니다.

Table과 Index는 Buffer Pool이나 저장장치 자체가 아닙니다. 필요한 데이터는 저장장치에서 읽혀 Buffer Pool에 보관될 수 있습니다.

---

# Table 접근

조건에 맞는 row가 많거나 사용할 수 있는 index가 없다면 Database는 table의 많은 page를 순서대로 읽는 sequential scan을 선택할 수 있습니다.

Sequential scan은 무조건 나쁜 방식이 아닙니다. table 대부분을 읽어야 한다면 index를 여러 번 오가는 것보다 순차 접근이 더 저렴할 수 있습니다.

---

# Index 접근

```sql
CREATE INDEX member_email_idx ON member(email);
```

적절한 index가 있으면 조건에 맞는 row 위치를 빠르게 좁힐 수 있습니다. 정렬 순서, 복합 index의 column 순서와 query 조건이 index 사용 가능성에 영향을 줍니다.

Index는 조회를 빠르게 할 수 있지만 저장 공간을 사용하고 `INSERT`, `UPDATE`, `DELETE` 때 함께 유지해야 합니다.

---

# Buffer Pool과 저장장치의 관계

Query Optimizer는 Plan에서 어떤 table과 index를 어떤 방식으로 접근할지 선택합니다. Plan이 실행되면 Database는 필요한 table 또는 index 데이터를 Buffer Pool에서 먼저 찾습니다.

- Cache Hit: Buffer Pool의 memory page를 바로 사용합니다.
- Cache Miss: 저장장치에서 데이터를 읽어 Buffer Pool에 보관한 뒤 사용합니다.

따라서 SQL이 table과 index를 사용한다고 해서 매번 저장장치를 읽는 것은 아닙니다. 자주 접근하는 데이터는 Buffer Pool에 남아 있어 더 빠르게 처리될 수 있습니다.

---

# 개발자가 개입하는 지점

개발자는 실제 query 패턴과 실행 계획을 근거로 index를 설계합니다. 자주 검색한다는 이유만으로 모든 column에 index를 추가하면 쓰기 비용과 관리 비용이 커질 수 있습니다.

사용되지 않는 index, 중복 index와 선택도가 낮은 조건을 정기적으로 점검하는 것이 좋습니다.

---

# 헷갈리기 쉬운 점

## Index가 존재해도 Query Optimizer가 선택하지 않을 수 있습니다

Query Optimizer가 table scan 비용이 더 낮다고 추정하거나 query 조건이 index 구조와 맞지 않으면 index를 사용하지 않을 수 있습니다.

## 복합 Index는 column 순서가 중요합니다

여러 column을 묶은 index는 query의 filter와 정렬 방식에 따라 활용 범위가 달라집니다. column 집합이 같아도 순서가 다르면 다른 index입니다.

---

# 참고 자료

- [PostgreSQL — Indexes](https://www.postgresql.org/docs/current/indexes.html)
- [PostgreSQL — Index Types](https://www.postgresql.org/docs/current/indexes-types.html)
- [MySQL — InnoDB Buffer Pool](https://dev.mysql.com/doc/refman/8.4/en/innodb-buffer-pool.html)
