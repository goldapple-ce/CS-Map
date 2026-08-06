# 한눈에 보기

Spring Data는 서로 다른 저장소를 비슷한 Repository 작성 방식으로 사용할 수 있게 합니다.

이 화면은 관계형 Database 접근을 중심으로 `Spring Data JPA`와 `Spring Data JDBC`가 어떻게 JDBC로 이어지는지 보여줍니다.  
MongoDB나 Redis 같은 NoSQL 저장소는 JDBC를 거치지 않는다는 차이만 보조 흐름으로 나타냅니다.

---

# 구성 요소

- `Repository`: 저장소 종류와 무관한 Spring Data의 공통 interface입니다.
- `Spring Data JPA`: JPA를 이용해 관계형 Database에 접근하는 Repository를 제공합니다.
- `JPA`: Java 객체와 관계형 Database를 연결하는 ORM 표준입니다.
- `Hibernate`: JPA를 실제로 동작시키는 대표적인 구현체입니다.
- `Spring Data JDBC`: JPA와 Hibernate 없이 JDBC 기반 Repository를 제공합니다.
- `JDBC API`: Java 코드가 관계형 Database 작업을 요청하는 공통 interface입니다.
- `JDBC Driver`: JDBC API를 구현하고 Database별 protocol로 실제 통신합니다.
- `DataSource`: JDBC Connection을 공급하고 일반적으로 Connection Pool을 관리합니다.
- `Transaction`: Repository를 통해 실행하는 여러 작업의 성공과 실패 범위를 저장소별 방식으로 관리합니다.
- `NoSQL Repository`: JDBC 대신 저장소별 Driver를 사용하는 Repository를 대표합니다.

---

# 관계형 Database 흐름

## JPA 방식

```text
Repository -> Spring Data JPA -> JPA -> Hibernate -> JDBC API -> JDBC Driver -> RDB
```

Spring Data JPA가 Repository 구현 객체를 만들고 JPA를 사용합니다. Hibernate가 JPA 동작을 구현해 SQL을 만들고 JDBC API를 호출하며, Database별 JDBC Driver가 실제 통신을 담당합니다.

## Spring Data JDBC 방식

```text
Repository -> Spring Data JDBC -> JDBC API -> JDBC Driver -> RDB
```

Spring Data JDBC는 JPA의 Persistence Context와 Hibernate를 거치지 않고 JDBC API를 사용합니다. 두 방식은 서로 다른 객체 mapping 방식을 제공하지만 JDBC API, DataSource와 JDBC Driver에서 합류합니다.

---

# NoSQL 저장소 흐름

```text
Repository -> NoSQL Repository -> 전용 Driver -> NoSQL 저장소
```

MongoDB와 Redis도 Spring Data의 Repository 사용 방식을 제공할 수 있습니다. 그러나 JPA, Hibernate, JDBC와 DataSource를 거치지 않고 각 저장소에 맞는 Driver와 network protocol로 통신합니다.

이 화면에서는 개별 NoSQL 제품의 mapping, command와 transaction 차이까지 확장하지 않습니다. 핵심은 `Repository를 사용한다고 모두 JDBC로 이어지는 것은 아니다`라는 점입니다.

---

# 개발자가 개입하는 지점

관계형 Database를 사용한다면 JPA 방식과 Spring Data JDBC 방식 중 애플리케이션에 맞는 것을 선택합니다.

- Spring Data JPA: 복잡한 객체 관계, Persistence Context와 변경 감지 활용
- Spring Data JDBC: 단순한 aggregate mapping과 명시적인 저장 동작
- 공통 설계: Repository 호출을 묶을 transaction 경계
- 관계형 설정: DataSource와 Connection Pool

NoSQL 저장소를 선택하면 해당 Spring Data module, domain mapping과 전용 Driver 설정을 사용합니다.

---

# 꼭 알아둘 점

## Repository는 저장 기술이 아닙니다

`Repository`와 `CrudRepository`는 공통 method 형태를 정의합니다. 실제 저장 방식은 Spring Data JPA, Spring Data JDBC 또는 저장소별 module이 결정합니다.

## Transaction 지원 방식은 저장소마다 다릅니다

화면의 `Transaction -> Repository` 점선은 Repository 호출을 transaction 작업 범위로 묶을 수 있다는 개념을 나타냅니다. 실제 TransactionManager, 지원 조건과 동작은 JPA, JDBC, MongoDB와 Redis에서 서로 다릅니다.

## JPA와 Spring Data JDBC만 JDBC API로 합류합니다

현재 화면의 NoSQL 흐름은 별도의 Driver를 사용하므로 JDBC API, JDBC Driver와 DataSource에 연결하지 않습니다. Transaction 선은 공통 개념만 나타내며 실제 지원 여부와 동작은 저장소별로 확인해야 합니다.

## Template API는 별도의 사용 방식입니다

`JdbcTemplate`이나 저장소별 Template API를 직접 사용할 수도 있습니다. 이 화면은 Repository에서 시작하는 흐름에 집중합니다.

---

# 참고 자료

- [Spring Data — Repository Core Concepts](https://docs.spring.io/spring-data/jpa/reference/repositories/core-concepts.html)
- [Spring Data JPA](https://docs.spring.io/spring-data/jpa/reference/index.html)
- [Spring Data JDBC](https://docs.spring.io/spring-data/relational/reference/jdbc.html)
- [Spring Data — Projects](https://spring.io/projects/spring-data)
