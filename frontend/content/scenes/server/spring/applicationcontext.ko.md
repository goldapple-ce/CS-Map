# 한눈에 보기

`ApplicationContext`는 Spring IoC Container를 나타내는 대표적인 인터페이스입니다.

설정 정보를 읽어 Bean을 생성하고 연결하는 `BeanFactory`의 기능에 더해, event 발행, message 국제화와 resource 조회 같은 애플리케이션 기능을 제공합니다. 일반적인 Spring 애플리케이션에서 “Spring Container”라고 부르는 대상은 대부분 ApplicationContext 계열입니다.

---

# 동작 방식

1. Component scan, `@Configuration`, XML 같은 설정 정보를 읽습니다.
2. Bean으로 만들 대상과 생성 방법을 `BeanDefinition`으로 등록합니다.
3. Bean을 생성하고 필요한 의존성을 주입합니다.
4. 초기화 callback과 BeanPostProcessor를 적용합니다.
5. 준비된 Bean을 애플리케이션에 제공합니다.
6. Container가 종료되면 관리 중인 Bean의 종료 callback을 실행합니다.

Spring Boot에서는 애플리케이션 종류에 맞는 ApplicationContext 구현체를 선택하고 구성하는 작업을 대부분 자동으로 처리합니다.

---

# 개발자가 개입하는 지점

일반적인 애플리케이션에서 개발자가 ApplicationContext 구현체를 직접 만들거나 `getBean()`을 반복해서 호출할 필요는 거의 없습니다. Bean 등록과 생성자 주입으로 Container가 객체를 연결하도록 구성합니다.

다만 Framework 확장 코드나 특별한 동적 조회가 필요하면 ApplicationContext를 주입받아 Bean, resource나 event 기능을 사용할 수 있습니다. 애플리케이션 로직이 Container API에 과하게 의존하지 않도록 필요한 경우에만 사용하는 것이 좋습니다.

---

# 헷갈리기 쉬운 점

## ApplicationContext는 하나의 구현 class가 아닙니다

ApplicationContext는 인터페이스입니다. 실행 환경에 따라 annotation 설정용, Servlet 웹 애플리케이션용 등 서로 다른 구현체가 사용될 수 있습니다.

## BeanFactory와 완전히 별개인 Container가 아닙니다

ApplicationContext는 BeanFactory 계층의 Bean 관리 기능을 포함하면서 애플리케이션에 필요한 부가 기능을 더합니다.

---

# 참고 자료

- [Spring Framework — ApplicationContext API](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/context/ApplicationContext.html)
- [Spring Framework — Container Overview](https://docs.spring.io/spring-framework/reference/core/beans/basics.html)
