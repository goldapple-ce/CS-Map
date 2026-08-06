# 한눈에 보기

NoSQL 저장소는 관계형 table 이외의 데이터 모델을 사용하는 저장소들을 이 화면에서 묶어 표현한 노드입니다.

MongoDB 같은 document 저장소와 Redis 같은 key-value 저장소는 데이터 모델과 사용 목적이 서로 다르지만, 둘 다 일반적인 Spring Data 접근에서 JDBC가 아닌 전용 Driver로 통신합니다.

---

# 개발자가 개입하는 지점

개발자는 선택한 저장소의 데이터 모델, key나 document 구조, index, 만료, 복제와 장애 복구 방식을 설계합니다.

이 노드에서는 개별 제품의 내부 동작을 설명하지 않습니다. 다만 `NoSQL`이 하나의 동일한 저장 방식이 아니라 여러 비관계형 모델을 묶은 넓은 표현이라는 점은 알아야 합니다.

---

# 참고 자료

- [Spring Data — Projects](https://spring.io/projects/spring-data)
- [MongoDB — Documents](https://www.mongodb.com/docs/manual/core/document/)
- [Redis — Data Types](https://redis.io/docs/latest/develop/data-types/)
