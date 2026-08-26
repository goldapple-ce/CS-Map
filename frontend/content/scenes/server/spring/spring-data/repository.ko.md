# 한눈에 보기

`Repository<T, ID>`는 Spring Data에서 domain 객체의 저장과 조회 경계를 표현하는 공통 marker interface입니다.

JPA, JDBC, MongoDB와 Redis module은 이 공통 추상화를 이용해 비슷한 Repository 작성 방식을 제공하지만, 실제 저장과 통신은 각 module이 담당합니다.

---

# Interface 계층

- Repository
  - CrudRepository
    - ListCrudRepository
      - JpaRepository
      - MongoRepository

Redis Repository와 Spring Data JDBC Repository는 보통 애플리케이션 interface가 `CrudRepository`나 `ListCrudRepository`를 직접 확장하고, module별 설정과 domain mapping을 통해 저장소 종류가 결정됩니다.

---

# 동작 방식

1. 개발자가 domain type과 ID type을 가진 Repository interface를 작성합니다.
2. Spring Data의 저장소별 module이 해당 interface를 발견합니다.
3. Module의 Repository Factory가 구현 객체인 Proxy를 만듭니다.
4. Proxy가 CRUD나 query method 호출을 저장소별 실행 방식으로 변환합니다.
5. JPA, JDBC 또는 전용 Driver를 통해 실제 저장소 작업이 실행됩니다.

Repository 자체가 JDBC나 MongoDB에 접속하는 것은 아닙니다. 공통 호출 형태를 제공하고 실제 동작은 선택된 module에 위임합니다.

---

# 개발자가 개입하는 지점

```java
interface MemberRepository extends CrudRepository<Member, String> {
    Optional<Member> findByEmail(String email);
}
```

개발자는 필요한 CRUD interface를 확장하고 query method를 선언합니다. 어떤 저장소 Repository가 되는지는 `JpaRepository`나 `MongoRepository` 같은 전용 interface, domain annotation, Repository 활성화 설정과 package 범위에 따라 결정됩니다.

여러 저장소 module을 동시에 사용한다면 JPA Entity, MongoDB Document와 Redis Hash를 서로 다른 package로 구분하는 것이 안전합니다.

---

# 헷갈리기 쉬운 점

## CrudRepository는 저장 기술이 아닙니다

CRUD method signature를 정의할 뿐, SQL이나 MongoDB command를 직접 실행하지 않습니다.

## 모든 module의 세부 기능이 같지는 않습니다

공통 CRUD는 비슷하지만 join, 연관 관계, transaction, query method와 pagination 지원 범위는 저장소마다 다릅니다.

---

# 참고 자료

- [Spring Data — Repository Core Concepts](https://docs.spring.io/spring-data/jpa/reference/repositories/core-concepts.html)
- [Spring Data Commons — ListCrudRepository API](https://docs.spring.io/spring-data/commons/reference/api/java/org/springframework/data/repository/ListCrudRepository.html)
