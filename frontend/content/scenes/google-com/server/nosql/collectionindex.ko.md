# 한눈에 보기

Collection은 MongoDB document를 모아 두는 논리적 단위이고, Index는 특정 field 값을 기준으로 document를 빠르게 찾기 위한 별도 구조입니다.

관계형 table과 비슷해 보일 수 있지만 모든 document가 반드시 동일한 field 구성을 가져야 하는 것은 아닙니다.

---

# Collection

Document는 하나의 collection에 저장됩니다. 같은 collection의 document가 유연한 구조를 가질 수 있어도 애플리케이션이 함께 조회하고 관리할 수 있는 일관된 모델을 정하는 것이 중요합니다.

MongoDB는 collection에 schema validation 규칙을 설정하여 field와 type 조건을 검사할 수도 있습니다.

---

# Index

```javascript
db.members.createIndex({ email: 1 }, { unique: true })
```

Index는 filter와 sort를 빠르게 할 수 있고 `unique` 같은 규칙을 함께 제공할 수 있습니다. 복합 index에서는 field 순서가 사용할 수 있는 query 형태에 영향을 줍니다.

Index가 없거나 사용할 수 없다면 많은 document를 검사하는 collection scan이 발생할 수 있습니다.

---

# 개발자가 개입하는 지점

개발자는 자주 실행되는 filter와 sort, 읽기와 쓰기 비율을 바탕으로 index를 설계합니다.

Index는 저장 공간을 사용하고 document 변경마다 함께 갱신되므로 무조건 많이 만드는 것이 좋지 않습니다. 실제 실행 통계로 사용 여부와 비용을 확인해야 합니다.

---

# 헷갈리기 쉬운 점

## Collection이 schema 설계를 없애 주지는 않습니다

물리적으로 field 구성이 유연하더라도 애플리케이션 호환성과 migration을 위해 document version과 구조를 관리해야 합니다.

## Index가 모든 query를 빠르게 만들지는 않습니다

filter, sort와 projection이 index 순서에 맞는지, 반환 범위가 얼마나 넓은지에 따라 효과가 달라집니다.

---

# 참고 자료

- [MongoDB — Collections](https://www.mongodb.com/docs/manual/core/databases-and-collections/)
- [MongoDB — Indexes](https://www.mongodb.com/docs/manual/indexes/)
- [MongoDB — Schema Validation](https://www.mongodb.com/docs/manual/core/schema-validation/)
