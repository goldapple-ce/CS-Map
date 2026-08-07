# 한눈에 보기

Document Query는 document의 field와 value를 기준으로 조회하거나 변경할 대상을 지정하는 요청입니다.

MongoDB에서는 BSON 형태의 filter document로 조건을 표현합니다.

---

# 기본 형태

```javascript
db.members.find({
  status: "ACTIVE",
  age: { $gte: 20 }
})
```

이 query는 `members` collection에서 `status`가 `ACTIVE`이고 `age`가 20 이상인 document를 찾습니다.

중첩 field는 dot notation으로 접근할 수 있고 비교, 논리, array와 element 연산자를 조합할 수 있습니다.

---

# 개발자가 개입하는 지점

개발자는 filter, projection, sort와 limit을 실제 응답 요구에 맞게 구성합니다. 외부 입력을 그대로 query operator가 포함된 document로 사용하면 의도하지 않은 조건이 실행될 수 있으므로 Driver의 안전한 API와 validation을 사용해야 합니다.

query 성능을 확인할 때는 반환 document 수뿐 아니라 검사한 document와 index key 수를 실행 계획에서 함께 봐야 합니다.

---

# 헷갈리기 쉬운 점

## JSON 문자열을 보내는 것과 같지 않습니다

MongoDB Driver는 BSON type을 보존하는 query document를 protocol에 맞게 전송합니다. 날짜, ObjectId와 숫자 type은 단순 JSON 문자열과 의미가 다를 수 있습니다.

## field가 없다는 것과 null은 구분이 필요합니다

조건에 따라 field가 존재하지 않는 document와 값이 `null`인 document가 함께 선택될 수 있으므로 존재 여부 연산자를 고려해야 합니다.

---

# 참고 자료

- [MongoDB — Query Documents](https://www.mongodb.com/docs/manual/tutorial/query-documents/)
- [MongoDB — Query Selectors](https://www.mongodb.com/docs/manual/reference/mql/query-predicates/)
