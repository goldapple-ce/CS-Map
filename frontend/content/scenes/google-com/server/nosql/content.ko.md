# 한눈에 보기

NoSQL은 관계형 table 모델 이외의 여러 데이터 모델을 묶어 부르는 넓은 표현입니다. 문서형, key-value, wide-column과 graph Database는 구조와 query 방식이 서로 다릅니다.

이 Scene은 NoSQL 전체의 공통 내부 구조가 아니라 MongoDB 같은 문서형 Database의 구체적인 예시를 보여줍니다.

---

# 문서형 처리 흐름

```text
Document Query
      ↓
Collection / Index
      ↓
BSON Document
      ↓
Document 결과
```

애플리케이션은 field 조건을 담은 filter를 전송합니다. Database는 대상 collection과 사용할 index를 확인하고 조건에 맞는 BSON document를 찾거나 변경합니다.

문서형 모델은 관련 field, 중첩 document와 array를 하나의 document에 함께 저장할 수 있습니다. 애플리케이션이 함께 읽고 변경하는 데이터의 경계와 document 경계를 가깝게 설계할 때 유용할 수 있습니다.

---

# 개발자가 개입하는 지점

개발자는 document 구조, 중복 여부, 참조 방식과 index를 실제 읽기·쓰기 패턴에 맞춰 설계합니다.

관계형 정규화 규칙을 그대로 적용하거나 반대로 모든 데이터를 하나의 큰 document에 넣는 방식은 모두 문제가 될 수 있습니다. 함께 조회하고 원자적으로 변경할 데이터가 무엇인지 먼저 정해야 합니다.

---

# 헷갈리기 쉬운 점

## NoSQL은 schema가 없다는 뜻이 아닙니다

문서마다 field 구성이 달라질 수 있지만 애플리케이션이 기대하는 구조와 validation 규칙은 여전히 필요합니다.

## NoSQL은 SQL보다 항상 빠른 선택이 아닙니다

성능은 데이터 모델, query, index, 데이터 분포, consistency 요구와 운영 방식에 따라 달라집니다.

## 문서형 Database가 NoSQL 전체를 대표하지는 않습니다

Redis 같은 key-value 저장소와 Neo4j 같은 graph Database는 이 Scene의 collection과 BSON 흐름을 사용하지 않습니다.

---

# 참고 자료

- [MongoDB — Documents](https://www.mongodb.com/docs/manual/core/document/)
- [MongoDB — Data Modeling](https://www.mongodb.com/docs/manual/data-modeling/)
- [MongoDB — Query Documents](https://www.mongodb.com/docs/manual/tutorial/query-documents/)
