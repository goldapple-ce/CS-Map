# 한눈에 보기

Bean은 Spring Container가 생성하고 조립하며 생명주기를 관리하는 객체입니다.

평범한 Java 객체와 모양은 같을 수 있지만, 객체의 생성 방법과 의존 관계가 Container에 등록되어 있다는 점이 다릅니다. `@Component`, `@Bean` method와 XML 설정은 Bean을 등록하는 서로 다른 방법입니다.

---

# Bean 등록 방법

## Component scan으로 등록

개발자가 작성한 class에는 보통 stereotype annotation을 붙여 Bean으로 등록합니다.

```java
@Service
class OrderService {
}
```

- `@Component`: 일반적인 Spring 구성 요소
- `@Service`: 비즈니스 로직을 담당하는 구성 요소
- `@Repository`: 데이터 접근을 담당하는 구성 요소
- `@Controller`: 웹 요청을 처리하는 구성 요소

이 annotation들이 객체를 직접 생성하는 것은 아닙니다. Component scan이 class를 발견해 BeanDefinition을 등록하고, Spring Container가 실제 Bean을 생성합니다.

## `@Bean` method로 등록

외부 library 객체처럼 class에 annotation을 붙이기 어렵거나 생성 과정을 직접 구성해야 할 때 사용합니다.

```java
@Configuration
class AppConfig {

    @Bean
    Clock clock() {
        return Clock.systemUTC();
    }
}
```

`@Bean` method의 반환 객체가 Spring Bean으로 등록됩니다. Method parameter로 다른 Bean을 받아 생성 과정에 사용할 수도 있습니다.

## 자동 설정으로 등록

Spring Boot의 자동 설정도 조건에 맞는 Bean을 대신 등록합니다. 개발자가 직접 작성하지 않은 `DataSource`, Spring MVC 구성 요소와 Spring Security 기반 객체가 Container에 존재할 수 있는 이유입니다.

---

# 생명주기

일반적인 singleton Bean은 다음 과정을 거칩니다.

1. Container가 BeanDefinition을 바탕으로 객체를 생성합니다.
2. 생성자나 property를 통해 의존성을 주입합니다.
3. BeanPostProcessor가 초기화 전 작업을 적용합니다.
4. `@PostConstruct` 같은 초기화 callback을 실행합니다.
5. BeanPostProcessor가 초기화 후 작업을 적용하고, 필요하면 Proxy로 교체합니다.
6. 준비된 Bean을 애플리케이션에서 사용합니다.
7. Container가 종료되면 `@PreDestroy` 같은 종료 callback을 실행합니다.

실제 내부 과정에는 더 많은 callback이 있지만, 처음에는 `생성 → 의존성 주입 → 초기화 → 사용 → 종료` 순서로 이해하면 충분합니다.

---

# 개발자가 개입하는 지점

개발자는 Bean의 등록 방법, 의존 관계, scope와 초기화·종료 작업을 작성합니다.

```java
@Component
class CacheClient {

    @PostConstruct
    void connect() {
        // 초기화 작업
    }

    @PreDestroy
    void disconnect() {
        // 종료 작업
    }
}
```

의존성은 생성자에서 받고, 외부 연결처럼 객체 생성 직후 준비가 필요한 작업만 초기화 callback에 두는 것이 좋습니다.

---

# 헷갈리기 쉬운 점

## singleton은 JVM 전체에 하나라는 뜻이 아닙니다

Spring의 기본 singleton scope는 하나의 Container 안에서 하나의 BeanDefinition에 대응하는 공유 instance를 관리한다는 뜻입니다. ApplicationContext가 여러 개면 같은 type의 Bean instance도 여러 개 생길 수 있습니다.

## 조회한 Bean이 원본 객체가 아닐 수 있습니다

Spring AOP, transaction이나 method security가 적용되면 Container가 원본 객체를 감싼 Proxy를 Bean으로 제공할 수 있습니다.

## 모든 종료 callback이 항상 보장되는 것은 아닙니다

애플리케이션이 정상적으로 Container를 종료할 때 callback이 실행됩니다. 프로세스가 강제로 종료되는 상황까지 보장하는 장치는 아닙니다.

---

# 참고 자료

- [Spring Framework — Bean Overview](https://docs.spring.io/spring-framework/reference/core/beans/definition.html)
- [Spring Framework — Lifecycle Callbacks](https://docs.spring.io/spring-framework/reference/core/beans/factory-nature.html)
- [Spring Framework — Bean Scopes](https://docs.spring.io/spring-framework/reference/core/beans/factory-scopes.html)
