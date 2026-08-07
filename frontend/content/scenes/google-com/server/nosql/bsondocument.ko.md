# 한눈에 보기

BSON Document는 MongoDB가 저장하고 network로 주고받는 field-value 구조의 데이터 단위입니다.

BSON은 JSON과 비슷한 구조를 표현하지만 binary 형식이며 ObjectId, Date, Decimal128와 Binary 같은 추가 type을 지원합니다.

---

# 기본 구조

```javascript
{
  _id: ObjectId("..."),
  email: "member@example.com",
  profile: {
    nickname: "map-user"
  },
  roles: ["USER", "EDITOR"]
}
```

Document는 중첩 document와 array를 포함할 수 있습니다. 서로 밀접하고 함께 읽는 데이터를 한 document에 넣으면 join 없이 한 번에 가져올 수 있습니다.

반대로 자주 따로 변경되는 데이터나 계속 커지는 collection 값을 무조건 embed하면 document 크기와 쓰기 경합 문제가 생길 수 있습니다.

---

# 개발자가 개입하는 지점

개발자는 데이터를 embed할지 다른 document를 reference할지 결정합니다.

함께 조회하고 원자적으로 변경되는 데이터는 embed가 유리할 수 있고, 독립적으로 커지거나 여러 곳에서 공유되는 데이터는 reference가 적절할 수 있습니다. 정답은 실제 접근 패턴에 따라 달라집니다.

---

# 헷갈리기 쉬운 점

## BSON은 단순한 JSON text가 아닙니다

Driver가 language type과 BSON type 사이를 변환합니다. 숫자 크기와 날짜, 식별자 type을 명확히 다루지 않으면 애플리케이션마다 다른 값으로 해석할 수 있습니다.

## Document 하나에도 크기 제한이 있습니다

MongoDB document에는 제품이 정한 최대 BSON 크기가 있습니다. 제한 없이 커지는 array나 이력을 한 document에 계속 넣는 설계는 피해야 합니다.

---

# 참고 자료

- [MongoDB — Documents](https://www.mongodb.com/docs/manual/core/document/)
- [MongoDB — BSON Types](https://www.mongodb.com/docs/manual/reference/bson-types/)
- [MongoDB — Data Model Design](https://www.mongodb.com/docs/manual/core/data-model-design/)
