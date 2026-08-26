# 한눈에 보기

`EntityManagerFactory`는 설정된 Persistence Unit을 바탕으로 `EntityManager`를 만드는 JPA factory입니다.

애플리케이션 시작 과정에서 mapping 정보와 JPA Provider 설정을 준비하는 무거운 객체이므로 일반적으로 애플리케이션에서 하나를 만들어 공유합니다.

---

# 동작 방식

EntityManagerFactory는 다음 정보를 바탕으로 초기화됩니다.

- 관리할 Entity class
- JPA Provider
- DataSource와 Database 연결 설정
- mapping과 Provider별 속성

초기화된 EntityManagerFactory는 필요할 때 EntityManager를 생성합니다. EntityManagerFactory는 여러 thread에서 공유할 수 있지만, 생성된 EntityManager는 동시에 여러 thread가 공유하면 안 됩니다.

Spring Boot와 Spring Framework 환경에서는 `LocalContainerEntityManagerFactoryBean`과 자동 설정이 EntityManagerFactory 구성을 담당하는 경우가 많습니다.

---

# 개발자가 개입하는 지점

Spring Boot에서는 보통 EntityManagerFactory를 직접 생성하지 않고 dependency, DataSource와 JPA 설정을 구성합니다.

```yaml
spring:
  jpa:
    open-in-view: false
    properties:
      hibernate:
        format_sql: true
```

여러 DataSource나 여러 Persistence Unit을 사용해야 한다면 개발자가 EntityManagerFactory와 TransactionManager를 각각 명시적으로 구성할 수 있습니다.

---

# 헷갈리기 쉬운 점

## EntityManagerFactory와 EntityManager는 수명이 다릅니다

EntityManagerFactory는 애플리케이션에서 오래 공유하는 factory이고, EntityManager는 특정 작업이나 transaction에서 Entity를 다루는 객체입니다.

## Spring Data Repository를 사용해도 사라지지 않습니다

Repository가 EntityManager 사용을 감출 뿐, 내부 JPA 실행에는 EntityManagerFactory와 EntityManager가 필요합니다.

---

# 참고 자료

- [Jakarta Persistence — EntityManagerFactory API](https://jakarta.ee/specifications/persistence/3.2/apidocs/jakarta.persistence/jakarta/persistence/entitymanagerfactory)
- [Spring Framework — EntityManagerFactory Setup](https://docs.spring.io/spring-framework/reference/data-access/orm/jpa.html)
