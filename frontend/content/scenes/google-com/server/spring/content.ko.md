# 개요

이 Scene은 Spring을 하나의 요청 처리 순서가 아니라, `Spring Container`와 `Bean`을 중심으로 여러 기능이 결합되는 구조로 보여줍니다.

`Web Servlet`과 `Data Access`는 서로 다른 역할을 담당하지만, 관련 구성 요소를 Spring Container에 등록해 Bean으로 관리할 수 있습니다. `Spring AOP`는 필요한 Bean에 Proxy를 적용해 핵심 로직 바깥의 공통 기능을 결합합니다.

---

# 각 영역의 역할

- `Spring 생태계`: Spring Framework를 중심으로 Spring Security, Spring Data 등 함께 사용할 수 있는 프로젝트와 통합 방식을 포괄합니다.
- `Web Servlet`: Servlet 기반 웹 요청을 Spring MVC와 Spring Security로 처리하는 영역입니다.
- `Data Access`: JDBC, transaction, ORM과 Repository처럼 데이터 저장소 접근을 지원하는 영역입니다.
- `Spring Container`: 설정 정보를 읽고 Bean을 생성·조립하며 생명주기를 관리합니다.
- `Bean`: Spring Container가 생성하고 관리하는 객체입니다.
- `Spring AOP`: method 호출 같은 join point에 공통 관심사를 적용할 수 있도록 대상 Bean을 Proxy로 감쌉니다.

`Spring 생태계`는 실행 단계에 놓인 하나의 객체가 아니라 전체 기술 범위를 나타냅니다. 반면 Spring Container와 Bean은 애플리케이션 실행 시 실제로 생성되고 관리되는 구조입니다.

---

# Scene의 관계 읽기

## Web Servlet과 Data Access → Spring Container

웹 계층에서는 Controller, HandlerMapping, Spring Security의 Filter 같은 구성 요소가 Bean으로 등록될 수 있습니다. Data Access 계층에서도 DataSource, transaction manager, Repository 지원 객체 등이 Bean으로 등록될 수 있습니다.

화살표의 `등록`은 HTTP 요청이 Container로 전달된다는 뜻이 아닙니다. 각 영역의 구성 요소와 설정이 Container의 관리 대상이 된다는 구조적 관계입니다.

## Spring Container → Bean

Container는 BeanDefinition에 기록된 생성 방법과 의존 관계를 바탕으로 Bean을 만들고 연결합니다. 일반적인 애플리케이션에서는 `ApplicationContext` 구현체가 이 Spring IoC Container 역할을 담당합니다.

## Spring AOP → Bean

Spring AOP가 모든 Bean을 무조건 Proxy로 만드는 것은 아닙니다. AOP 적용 조건에 맞는 Bean만 Proxy로 감싸며, 호출자는 이 Proxy를 통해 transaction, security, logging 같은 부가 기능이 적용된 method를 호출할 수 있습니다.

---

# 요청 흐름과의 구분

Servlet 기반 HTTP 요청의 구체적인 흐름은 자식 `Web Servlet` Scene에서 다룹니다. 그곳에서는 Tomcat이 Servlet FilterChain을 호출하고, 허용된 요청이 Spring MVC의 `DispatcherServlet`에 도달하는 과정을 볼 수 있습니다.

Data Access는 이 요청 안에서 Controller나 Service가 호출할 수도 있지만, 반드시 웹 요청에서만 사용되는 것은 아닙니다. Batch 작업, message consumer와 command-line 애플리케이션도 같은 Container와 Data Access 기능을 사용할 수 있습니다.

---

# 범위

이 Scene은 Spring의 모든 프로젝트를 상속 관계로 분류하지 않습니다. Spring Container를 중심으로 웹, 데이터 접근과 AOP가 애플리케이션 Bean에 결합되는 큰 경계만 설명합니다. Container의 초기화 과정과 Servlet 요청 처리는 각각의 자식 Scene에서 이어집니다.

# 참고 자료

- [Spring Framework — Introduction to the IoC Container and Beans](https://docs.spring.io/spring-framework/reference/core/beans/introduction.html)
- [Spring Framework — Container Overview](https://docs.spring.io/spring-framework/reference/core/beans/basics.html)
- [Spring Framework — Aspect Oriented Programming with Spring](https://docs.spring.io/spring-framework/reference/core/aop.html)
- [Spring Framework — Web on Servlet Stack](https://docs.spring.io/spring-framework/reference/web.html)
- [Spring Framework — Data Access](https://docs.spring.io/spring-framework/reference/data-access.html)
