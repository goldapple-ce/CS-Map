# 한눈에 보기

NoSQL Repository는 MongoDB나 Redis처럼 JDBC를 사용하지 않는 저장소의 Spring Data Repository를 대표하는 노드입니다.

공통 `Repository`와 `CrudRepository` 사용 방식은 공유할 수 있지만, 객체 mapping과 실제 명령 실행은 저장소별 Spring Data module이 담당합니다.

---

# 동작 방식

1. 개발자가 저장소에 맞는 domain mapping과 Repository interface를 작성합니다.
2. 저장소별 Spring Data module이 Repository Proxy를 만듭니다.
3. CRUD와 query method를 해당 저장소의 명령으로 변환합니다.
4. 전용 Driver를 통해 저장소에 전달합니다.

예를 들어 MongoDB는 document mapping과 MongoDB Driver를 사용하고, Redis는 key와 Hash mapping 및 Lettuce나 Jedis를 사용할 수 있습니다.

---

# 개발자가 개입하는 지점

개발자는 저장소별 Spring Data module, domain annotation, Repository 활성화 범위와 Driver 연결 정보를 설정합니다.

공통 Repository API가 저장소별 데이터 모델과 기능 차이를 없애 주는 것은 아닙니다. 실제 document, key, index와 query 특성을 기준으로 설계해야 합니다.

---

# 헷갈리기 쉬운 점

## NoSQL Repository라는 하나의 실제 interface가 있는 것은 아닙니다

이 노드는 여러 저장소별 Repository를 화면에서 단순화한 표현입니다. 실제 코드에서는 `MongoRepository`를 사용하거나 Redis Repository가 `CrudRepository`를 확장하는 것처럼 module마다 구성이 다릅니다.

---

# 참고 자료

- [Spring Data MongoDB — Repositories](https://docs.spring.io/spring-data/mongodb/reference/repositories.html)
- [Spring Data Redis — Repositories](https://docs.spring.io/spring-data/redis/reference/repositories.html)
