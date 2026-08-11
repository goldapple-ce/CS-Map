# 한눈에 보기

Collection은 BSON Document를 모아 두는 논리적인 저장 단위이며 Document Query가 대상을 지정하는 범위입니다.

관계형 Table과 비슷해 보이지만 같은 Collection의 모든 Document가 반드시 동일한 field 구성을 가져야 하는 것은 아닙니다.

---

# Flexible Schema

```javascript
{ _id: 1, name: "kim", email: "kim@example.com" }
{ _id: 2, name: "lee", phone: "010-0000-0000" }
```

두 Document는 서로 다른 field를 가지면서 같은 Collection에 저장될 수 있습니다. 새로운 field를 추가하기 위해 모든 기존 Document를 한 번에 변경할 필요도 없습니다.

하지만 Application이 기대하는 구조까지 없어지는 것은 아닙니다. 같은 의미의 field에 서로 다른 Type이 섞이면 Query와 객체 변환이 어려워질 수 있습니다.

---

# Schema Validation

MongoDB는 Collection에 Validation 규칙을 설정하여 허용할 field Type, 값의 범위와 필수 조건 등을 검사할 수 있습니다.

Flexible Schema는 아무 구조나 저장해도 된다는 뜻이 아닙니다. 개발 초기에는 구조를 유연하게 바꾸고, 구조가 정해지면 Validation으로 잘못된 데이터를 막을 수 있습니다.

---

# Collection Scan

Query에 사용할 수 있는 Index가 없다면 Collection의 Document를 검사하며 조건에 맞는 데이터를 찾습니다. 데이터가 적다면 문제가 되지 않을 수 있지만 Collection이 커지면 검사량도 늘어납니다.

---

# 개발자가 개입하는 지점

개발자는 어떤 Document를 같은 Collection에 둘지, Collection 이름과 Validation 규칙을 정합니다.

Document 구조가 변경되면 기존 데이터와 Application 코드가 새 구조를 함께 처리할 수 있도록 Migration이나 Version 관리 방법도 마련해야 합니다.

---

# 참고 자료

- [MongoDB — Databases and Collections](https://www.mongodb.com/docs/manual/core/databases-and-collections/)
- [MongoDB — Schema Validation](https://www.mongodb.com/docs/manual/core/schema-validation/)
- [MongoDB — Query Documents](https://www.mongodb.com/docs/manual/tutorial/query-documents/)
