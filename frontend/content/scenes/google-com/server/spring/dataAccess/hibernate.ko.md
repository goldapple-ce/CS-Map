# 한눈에 보기

Hibernate는 JPA를 구현하는 대표적인 ORM Framework입니다. JPA를 통해 전달된 Entity 작업을 해석하고 Database에 보낼 SQL을 만들어 실행합니다.

Spring Boot에서 JPA starter를 사용하면 Hibernate가 기본 JPA 구현체로 함께 사용되는 경우가 일반적입니다.

---

# 동작 방식

1. Entity mapping 정보를 읽습니다.
2. Persistence Context 안에서 Entity의 상태와 변경을 추적합니다.
3. JPQL이나 Repository 요청을 SQL로 변환합니다.
4. 필요한 시점에 JDBC를 통해 SQL을 실행합니다.
5. 조회 결과를 Entity 객체로 변환합니다.

Hibernate는 SQL 생성을 도와주지만 Database query 비용까지 자동으로 최적화해 주는 것은 아닙니다.

---

# 개발자가 개입하는 지점

개발자는 Entity mapping, 연관 관계, fetch 전략과 query를 조정합니다. 문제가 생기면 Hibernate가 생성한 SQL과 parameter를 logging으로 확인합니다.

특히 연관 Entity를 반복해서 조회하며 query가 늘어나는 N+1 문제, 필요 이상의 즉시 loading과 대량 변경 작업의 Persistence Context 크기를 주의해야 합니다.

---

# 헷갈리기 쉬운 점

## Hibernate를 사용하면서도 JPA API로 작성할 수 있습니다

애플리케이션 코드는 `EntityManager`와 JPA annotation을 사용하고, 실제 동작은 Hibernate가 맡을 수 있습니다. Hibernate 전용 API를 반드시 직접 호출해야 하는 것은 아닙니다.

## Hibernate는 Database가 아닙니다

Hibernate는 Java 객체와 SQL 사이를 연결하는 애플리케이션 library입니다. 데이터의 실제 저장과 SQL 실행은 Database가 담당합니다.

---

# 참고 자료

- [Hibernate ORM — User Guide](https://docs.hibernate.org/orm/current/userguide/html_single/Hibernate_User_Guide.html)
- [Spring Framework — ORM with JPA](https://docs.spring.io/spring-framework/reference/data-access/orm/jpa.html)
