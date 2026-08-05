# 한눈에 보기

Spring은 Java 애플리케이션을 만들 때 객체 생성과 연결, 웹 요청, 데이터 접근, transaction 같은 반복적인 기반 작업을 맡아 주는 오픈소스 애플리케이션 프레임워크입니다.

중심에는 `Spring Container`와 `Bean`이 있습니다. 개발자가 객체를 직접 생성하고 연결하는 대신 Container가 설정을 읽어 Bean을 만들고, 필요한 의존성을 주입해 애플리케이션을 구성합니다.

---

# 구성 요소

- `Spring 생태계`: Spring Framework와 Spring Boot, Spring Security, Spring Data 같은 여러 프로젝트를 포괄합니다.
- `Web Servlet`: Servlet 기반 웹 요청을 Spring MVC와 Spring Security로 처리합니다.
- `Data Access`: JDBC, transaction, ORM과 Repository를 이용한 데이터 접근을 지원합니다.
- `Spring Container`: 설정 정보를 읽고 Bean을 생성·조립하며 생명주기를 관리합니다.
- `ApplicationContext`: Spring Container를 나타내는 대표적인 인터페이스입니다.
- `Bean`: Spring Container가 생성하고 관리하는 객체입니다.
- `Spring AOP`: 필요한 Bean을 Proxy로 감싸 공통 기능을 method 호출 전후에 적용합니다.

Web, Data Access와 AOP는 서로 고립된 기능이 아닙니다. 각 기능에 필요한 객체도 Bean으로 등록되며 Container 안에서 함께 연결됩니다.

---

# Spring 핵심 개념

## IoC: 객체를 제어하는 주체가 바뀝니다

일반적인 Java 코드에서는 객체가 필요한 객체를 직접 생성하고 연결할 수 있습니다. Spring에서는 Container가 객체의 생성, 연결과 생명주기를 맡습니다. 이렇게 프로그램의 제어권 일부가 개발자 코드에서 Framework로 넘어가는 것을 `IoC(Inversion of Control)`라고 합니다.

## DI: 필요한 객체를 외부에서 받습니다

`DI(Dependency Injection)`는 IoC를 구현하는 대표적인 방법입니다. 객체가 자신의 의존성을 직접 만들지 않고, 생성자 등을 통해 Container로부터 전달받습니다.

```java
@Service
class OrderService {
    private final OrderRepository orderRepository;

    OrderService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }
}
```

`OrderService`는 구현 객체를 직접 만들지 않습니다. Spring Container가 알맞은 `OrderRepository` Bean을 찾아 생성자에 주입합니다.

## POJO: 특별한 상속 없이 평범한 Java 객체로 작성합니다

`POJO(Plain Old Java Object)`는 특정 Framework class를 반드시 상속하거나 구현하지 않은 평범한 Java 객체를 뜻합니다. Spring은 POJO를 Bean으로 관리하면서 DI, transaction과 AOP 같은 기능을 적용할 수 있게 합니다.

## AOP: 반복되는 공통 기능을 분리합니다

로깅이나 transaction처럼 여러 객체에 반복되는 작업을 핵심 로직마다 작성하지 않고, 적용 대상과 실행할 기능을 따로 정의합니다. Spring AOP는 일반적으로 대상 Bean 앞에 Proxy를 두어 method 호출을 가로챕니다.

---

# 개발자가 개입하는 지점

개발자는 주로 다음 코드를 작성해 Spring의 동작을 구성합니다.

- `@Component`, `@Service`, `@Repository`, `@Controller`로 Bean 후보 작성
- `@Configuration`과 `@Bean`으로 생성 방법과 설정 정의
- 생성자 parameter로 Bean 사이의 의존 관계 표현
- Spring MVC, Spring Security와 Data Access 설정 구성
- annotation이나 Aspect를 이용해 transaction과 공통 기능 적용

Container를 직접 제어하기보다 어떤 객체가 필요하고 서로 어떻게 연결되는지를 선언하는 것이 일반적인 Spring 개발 방식입니다.

---

# 꼭 알아둘 점

## Spring과 Spring Boot는 다릅니다

Spring Framework는 Container, AOP, Web MVC 같은 기반 기능을 제공합니다. Spring Boot는 이 기능들을 빠르게 조합할 수 있도록 자동 설정, starter와 실행 환경을 제공합니다.

## 모든 객체가 Bean은 아닙니다

Java의 모든 객체를 Spring이 관리하는 것은 아닙니다. Component scan이나 `@Bean` 설정 등을 통해 Container에 등록된 객체가 Bean입니다.

## annotation 자체가 기능을 실행하는 것은 아닙니다

annotation은 설정 정보에 가깝습니다. Spring Container와 관련 처리기가 annotation을 읽어 Bean 등록, 의존성 주입이나 Proxy 적용 같은 실제 동작을 수행합니다.

---

# 참고 자료

- [Spring Framework — Overview](https://docs.spring.io/spring-framework/reference/overview.html)
- [Spring Framework — IoC Container](https://docs.spring.io/spring-framework/reference/core/beans.html)
- [Spring Framework — Container Overview](https://docs.spring.io/spring-framework/reference/core/beans/basics.html)
- [Spring Framework — Aspect Oriented Programming](https://docs.spring.io/spring-framework/reference/core/aop.html)
- [Spring — Projects](https://spring.io/projects)
