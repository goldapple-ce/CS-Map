# 한눈에 보기

MongoDB는 데이터를 BSON Document로 표현하여 Collection에 저장하는 문서형 Database입니다. 운영 환경에서는 여러 MongoDB Member를 Replica Set으로 구성하여 데이터를 복제하고 장애에 대응할 수 있습니다.

이 Scene은 NoSQL 전체를 일반화하지 않고 MongoDB가 Document를 조회하는 구체적인 흐름만 보여줍니다.

---

# MongoDB 처리 흐름

```text
Document Query
      ↓
Replica Set의 Member 선택
      ↓
Collection
      ↓
Collection Scan 또는 Index Scan
      ↓
BSON Document
```

애플리케이션은 field 조건을 담은 filter를 전송합니다. MongoDB Driver는 Replica Set 상태와 읽기 설정을 바탕으로 요청을 처리할 Member를 선택합니다. 선택된 Member는 대상 Collection을 확인하고 Collection Scan 또는 Index Scan으로 조건에 맞는 BSON Document를 찾거나 변경합니다.

문서형 모델은 관련 field, 중첩 document와 array를 하나의 document에 함께 저장할 수 있습니다. 애플리케이션이 함께 읽고 변경하는 데이터의 경계와 document 경계를 가깝게 설계할 때 유용할 수 있습니다.

---

# 개발자가 개입하는 지점

개발자는 Document 구조, 중복 여부, 참조 방식과 Index를 실제 읽기·쓰기 패턴에 맞춰 설계합니다. 운영 환경에서는 Replica Set의 Member 배치, Read Preference와 Read·Write Concern도 정합니다.

관계형 정규화 규칙을 그대로 적용하거나 반대로 모든 데이터를 하나의 큰 document에 넣는 방식은 모두 문제가 될 수 있습니다. 함께 조회하고 원자적으로 변경할 데이터가 무엇인지 먼저 정해야 합니다.

---

# 헷갈리기 쉬운 점

## MongoDB는 schema가 없다는 뜻이 아닙니다

문서마다 field 구성이 달라질 수 있지만 애플리케이션이 기대하는 구조와 validation 규칙은 여전히 필요합니다.

## MongoDB는 관계형 Database보다 항상 빠른 선택이 아닙니다

성능은 데이터 모델, query, index, 데이터 분포, consistency 요구와 운영 방식에 따라 달라집니다.

## MongoDB는 무조건 3대가 있어야 실행되는 것은 아닙니다

개발 환경에서는 하나의 MongoDB Process로 실행할 수 있습니다. 다만 Replica Set의 장애 대응과 자동 선출 효과를 얻기 위한 최소 권장 구성은 Primary 1개와 Secondary 2개입니다.

## MongoDB가 모든 NoSQL 저장소를 대표하지는 않습니다

Redis 같은 key-value 저장소와 Neo4j 같은 graph Database는 MongoDB의 Collection과 BSON 흐름을 사용하지 않습니다.

---

# 참고 자료

- [MongoDB — Documents](https://www.mongodb.com/docs/manual/core/document/)
- [MongoDB — Data Modeling](https://www.mongodb.com/docs/manual/data-modeling/)
- [MongoDB — Query Documents](https://www.mongodb.com/docs/manual/tutorial/query-documents/)
- [MongoDB — Replica Set Members](https://www.mongodb.com/docs/manual/core/replica-set-members/)
