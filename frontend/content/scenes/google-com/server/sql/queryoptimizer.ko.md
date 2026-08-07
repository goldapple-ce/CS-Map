# 한눈에 보기

Query Optimizer는 같은 SQL 결과를 만들 수 있는 여러 실행 방법을 비교하고 사용할 Query Execution Plan을 선택하는 Database 구성요소입니다.

MySQL 공식 문서에서는 이를 `Optimizer`라고 부르고, Optimizer가 선택한 작업의 집합을 `Query Execution Plan` 또는 `EXPLAIN Plan`이라고 부릅니다.

---

# 무엇을 선택하는가

Query Optimizer는 다음과 같은 선택지를 비교할 수 있습니다.

- table 전체를 읽을지 index를 사용할지
- 여러 table을 어떤 순서로 join할지
- nested loop, hash join 등 어떤 join 방식을 사용할지
- filter, sort와 aggregate를 어떤 순서와 방식으로 처리할지

Optimizer는 table과 index 통계, 조건에 맞을 것으로 예상되는 row 수와 비용 모델을 이용합니다. 가장 빠른 시간을 직접 재어 보고 고르는 것이 아니라 예상 비용이 낮은 Plan을 선택합니다.

---

# EXPLAIN과의 관계

```sql
EXPLAIN
SELECT *
FROM member
WHERE email = 'member@example.com';
```

`EXPLAIN`은 Optimizer가 선택한 Execution Plan을 보여줍니다. MySQL에서는 table 접근 방식, 선택한 index, join 순서와 예상 row 수 등을 확인할 수 있습니다.

`EXPLAIN ANALYZE`는 query를 실제로 실행하고 각 iterator의 실제 시간과 row 수를 함께 보여줍니다. 예상값과 실제값 차이를 비교하면 통계나 데이터 분포 때문에 잘못된 Plan이 선택되었는지 분석할 수 있습니다.

---

# 개발자가 개입하는 지점

개발자는 SQL, index와 schema를 조정하고 통계를 최신 상태로 유지하여 Optimizer가 더 적절한 Plan을 선택할 수 있게 합니다.

Optimizer Hint로 선택에 영향을 줄 수도 있지만 특정 데이터 분포에서만 맞는 Plan을 강제할 수 있으므로 먼저 통계, query와 index를 확인하는 편이 좋습니다.

---

# 헷갈리기 쉬운 점

## Optimizer와 Execution Plan은 같은 것이 아닙니다

Optimizer는 실행 방법을 선택하는 구성요소이고 Execution Plan은 그 선택 결과입니다. `EXPLAIN`은 Optimizer 자체가 아니라 선택된 Plan을 보여줍니다.

## Optimizer가 실제 row를 직접 읽는 것은 아닙니다

Optimizer는 실행 계획을 만듭니다. 선택된 Plan이 실행될 때 table과 index page에 접근하고, 이 과정에서 Buffer Pool이 사용됩니다.

## 같은 SQL이 항상 같은 Plan을 사용하지는 않습니다

통계, parameter, index, 데이터 양과 Database version이 바뀌면 Optimizer가 다른 Plan을 선택할 수 있습니다.

---

# 참고 자료

- [MySQL — Query Execution Plan](https://dev.mysql.com/doc/refman/8.4/en/execution-plan-information.html)
- [MySQL — Optimizing Queries with EXPLAIN](https://dev.mysql.com/doc/refman/8.4/en/using-explain.html)
- [MySQL — Query Optimizer](https://dev.mysql.com/doc/refman/8.4/en/controlling-optimizer.html)
