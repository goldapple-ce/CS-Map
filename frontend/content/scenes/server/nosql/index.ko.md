# 한눈에 보기

MongoDB Index는 특정 field 값을 정렬하여 저장하고 조건에 맞는 BSON Document를 빠르게 찾도록 돕는 별도 자료구조입니다.

일반적인 MongoDB Index는 B-Tree를 사용합니다. 적절한 Index가 없으면 Collection의 많은 Document를 검사할 수 있습니다.

---

# Index Scan과 Collection Scan

```text
Index 있음 → Index Scan으로 후보 위치 탐색 → BSON Document 조회
Index 없음 → Collection의 Document를 차례로 검사
```

MongoDB는 Collection을 만들 때 `_id` field에 Unique Index를 자동으로 생성합니다. 자주 Filter하거나 Sort하는 다른 field에는 Query 형태에 맞는 Index를 추가할 수 있습니다.

---

# 대표적인 Index

- Single Field Index는 하나의 field를 정렬합니다.
- Compound Index는 여러 field를 지정한 순서대로 정렬합니다.
- Multikey Index는 Array field의 요소를 Index에 저장합니다.
- Unique Index는 Index 값의 중복을 제한합니다.

Compound Index는 앞쪽 field부터 사용할 수 있으므로 field 순서가 중요합니다. 중첩 field도 dot notation으로 지정하여 Index를 만들 수 있습니다.

---

# Index의 비용

Index는 조회를 빠르게 할 수 있지만 별도의 저장 공간과 memory를 사용합니다. Document를 추가하거나 Indexed field를 변경하면 관련 Index도 함께 갱신해야 하므로 쓰기 비용이 늘어납니다.

Index를 많이 만드는 것이 항상 좋은 것은 아닙니다. 실제 Query에 사용되지 않는 Index는 쓰기와 운영 비용만 늘릴 수 있습니다.

---

# 개발자가 개입하는 지점

개발자는 자주 실행되는 Filter, Sort와 반환 범위를 기준으로 Index를 설계합니다.

`explain()` 결과에서 `IXSCAN`인지 `COLLSCAN`인지, 몇 개의 Index Key와 Document를 검사했는지 확인하면 Index가 Query에 실제로 사용되는지 알 수 있습니다.

---

# 참고 자료

- [MongoDB — Indexes](https://www.mongodb.com/docs/manual/indexes/)
- [MongoDB — Index Types](https://www.mongodb.com/docs/manual/core/indexes/index-types/)
- [MongoDB — Explain Results](https://www.mongodb.com/docs/manual/reference/explain-results/)
