# 한눈에 보기

Spring Data는 관계형·NoSQL 저장소의 Data Access Layer를 Repository Interface 중심으로 작성하도록 돕는 Spring 프로젝트입니다. 공통 Repository 추상화와 저장소별 Module이 반복 코드를 줄이지만, 모든 저장소를 하나의 동작 방식으로 바꾸지는 않습니다.

이 Scene은 `Repository`에서 선택한 Module에 따라 실제 Mapping과 통신 기반이 달라지는 세 경로를 보여줍니다.

---

# Repository와 저장소별 Module

`Repository<T, ID>`는 Domain 객체의 저장과 조회 경계를 표현하는 Spring Data의 공통 Interface입니다. 개발자가 `CrudRepository` 등을 확장한 Interface를 작성하면 선택한 Spring Data Module이 구현 객체를 만듭니다.

공통 Method 모양은 비슷해도 Domain Mapping, Query 기능, Transaction 지원과 실제 통신은 Module과 저장소에 따라 다릅니다.

---

# 관계형 Database 경로

## Spring Data JPA

```text
Repository → Spring Data JPA → JPA → Hibernate
```

Spring Data JPA는 Repository 구현에 JPA를 사용합니다. JPA는 Java 객체와 관계형 Database를 연결하는 표준이고, Hibernate는 그 표준을 실제로 구현하는 대표 Provider입니다.

JPA는 Spring 프로젝트가 아니므로 `목적별 Spring 프로젝트` Scene의 최상위 항목으로 두지 않습니다. Spring Data JPA가 사용하는 표준으로서 이 Scene 아래에 배치합니다.

## Spring Data JDBC

```text
Repository → Spring Data JDBC → Spring JDBC → JDBC
```

Spring Data JDBC는 JPA와 Hibernate 없이 Repository와 Aggregate Mapping을 제공합니다. Aggregate Root를 저장과 조회의 기준으로 삼고, Spring JDBC의 지원을 거쳐 Java JDBC 기반으로 관계형 Database 작업을 실행합니다.

`Spring JDBC`는 개발자가 SQL을 직접 작성할 때 `JdbcTemplate`·`JdbcClient`, 자원 정리와 예외 변환을 제공하는 Spring Framework 기능입니다. `Spring Data JDBC`는 Spring JDBC 위에 Repository 구현과 Aggregate Mapping을 추가하며, 실제 Database 통신은 그 아래의 Java JDBC와 JDBC Driver로 이어집니다.

---

# NoSQL 저장소 경로

```text
Repository → NoSQL Repository → 저장소별 Driver → NoSQL 저장소
```

MongoDB, Redis 등은 각 저장소에 맞는 Spring Data Module과 Driver를 사용합니다. JDBC를 거치지 않고 저장소의 Data Model과 Network Protocol에 맞게 명령을 전달합니다.

`NoSQL Repository`는 하나의 실제 Interface 이름이 아니라, MongoDB·Redis 등 저장소별 Repository를 Scene에서 묶어 표현한 Topic입니다.

---

# Spring Data에 포함되지 않는 기반

Transaction, `DataSource`, JDBC API와 JDBC Driver는 Spring Data 자체의 공통 구성 요소가 아닙니다. Spring Data Module이 필요에 따라 이러한 Spring Framework·Java·Database Driver 기능을 사용할 뿐입니다.

그러므로 관계형 경로의 설정 문제는 Repository Module, Mapping, Spring JDBC, `DataSource`와 JDBC Driver 구간으로 나누어 확인해야 합니다. NoSQL 경로는 저장소별 Module과 Driver 설정을 확인합니다.

---

# 참고 자료

- [Spring Data — Projects](https://spring.io/projects/spring-data)
- [Spring Data Commons — Repositories](https://docs.spring.io/spring-data/commons/reference/repositories.html)
- [Spring Data JPA](https://docs.spring.io/spring-data/jpa/reference/)
- [Spring Data JDBC](https://docs.spring.io/spring-data/relational/reference/jdbc.html)
- [Spring Data MongoDB — Repositories](https://docs.spring.io/spring-data/mongodb/reference/repositories.html)
- [Spring Data Redis — Repositories](https://docs.spring.io/spring-data/redis/reference/repositories.html)
