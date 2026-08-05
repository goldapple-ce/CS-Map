# 한눈에 보기

Spring Container는 애플리케이션에서 사용할 객체를 생성하고 서로 연결하며 생명주기를 관리합니다. 이렇게 Container가 관리하는 객체를 `Bean`이라고 합니다.

개발자가 모든 객체를 직접 `new`로 만들고 연결하는 대신, 어떤 객체가 필요하고 서로 어떤 관계인지를 설정하면 Container가 애플리케이션의 객체 구조를 완성합니다.

---

# 동작 방식

1. `@Component`, `@Configuration`, `@Bean`과 자동 설정 같은 설정 정보를 읽습니다.
2. 어떤 Bean을 어떻게 만들지 설명하는 `BeanDefinition`을 등록합니다.
3. 생성자나 factory method를 이용해 Bean instance를 만듭니다.
4. 필요한 다른 Bean과 설정값을 의존성으로 주입합니다.
5. `BeanPostProcessor`와 초기화 callback을 적용합니다.
6. 필요한 경우 AOP Proxy로 감싼 최종 Bean을 애플리케이션에 제공합니다.
7. Container가 정상적으로 종료되면 관리 대상 Bean의 종료 callback을 실행합니다.

일반적인 Spring 애플리케이션에서는 `ApplicationContext` 구현체가 이 Container 역할을 담당합니다.

---

# 개발자가 개입하는 지점

개발자가 Container 자체를 구현하거나 실행 순서를 직접 제어하는 경우는 드뭅니다.  
어떤 객체를 Bean으로 등록할지 설정하고, 생성자를 통해 Bean 사이의 의존 관계를 표현하는 방식으로 개입합니다.

---

# 꼭 알아둘 점

## Spring Container와 ApplicationContext는 별개의 단계가 아닙니다

Spring Container는 객체를 관리하는 역할을 가리키는 표현이고, `ApplicationContext`는 일반적인 애플리케이션에서 그 역할을 나타내는 핵심 인터페이스입니다.

## 설정 정보와 Bean은 다릅니다

`@Component`나 `@Bean`은 Container가 객체를 만들기 위한 설정을 제공합니다. annotation 자체가 객체를 생성하는 것이 아니라, Container가 이를 읽어 BeanDefinition을 등록하고 실제 instance를 만듭니다.

## 모든 Bean이 시작할 때 만들어지는 것은 아닙니다

일반적인 singleton Bean은 ApplicationContext가 초기화될 때 미리 생성되지만, lazy Bean이나 다른 scope의 Bean은 실제로 필요한 시점에 생성될 수 있습니다.

## 시작 오류는 의존 관계를 따라 확인해야 합니다

필요한 Bean이 없거나 후보가 여러 개이고, 순환 의존성이 생기거나 초기화 callback에서 예외가 발생하면 ApplicationContext 시작이 실패할 수 있습니다. 가장 바깥쪽 오류만 보지 말고 어떤 Bean을 만들다가 어느 의존성에서 실패했는지 원인 chain을 따라가는 것이 중요합니다.

---

# 참고 자료

- [Spring Framework — IoC Container](https://docs.spring.io/spring-framework/reference/core/beans.html)
- [Spring Framework — Container Overview](https://docs.spring.io/spring-framework/reference/core/beans/basics.html)
- [Spring Framework — Bean Overview](https://docs.spring.io/spring-framework/reference/core/beans/definition.html)
- [Spring Framework — Dependencies](https://docs.spring.io/spring-framework/reference/core/beans/dependencies/factory-collaborators.html)
- [Spring Framework — Lifecycle Callbacks](https://docs.spring.io/spring-framework/reference/core/beans/factory-nature.html)
