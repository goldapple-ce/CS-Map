## 개요

Spring IoC Container는 설정 정보를 바탕으로 애플리케이션 객체인 Bean을 생성하고 설정하며 서로 연결합니다. `ApplicationContext`는 `BeanFactory` 기능을 포함하고 애플리케이션에서 주로 사용하는 Container 인터페이스입니다.

## 필요한 이유

객체가 필요한 의존성을 직접 생성하거나 전역 위치에서 찾지 않고, 외부 Container가 생성자나 factory method 등의 계약을 통해 주입할 수 있습니다. 이 방식은 객체 생성과 애플리케이션 동작의 책임을 분리합니다.

## 동작 과정

1. Container가 component class, Java configuration 또는 다른 설정 정보를 읽습니다.
2. 관리할 객체의 생성 방법과 의존성을 `BeanDefinition`으로 등록합니다.
3. `ApplicationContext` 초기화 과정에서 필요한 Bean 생성을 시작합니다.
4. 생성자나 factory method 등을 이용해 Bean instance를 만듭니다.
5. 다른 Bean 참조와 설정값을 의존성으로 주입합니다.
6. 필요한 후처리와 초기화 callback을 실행합니다.
7. Controller, Service와 Security Filter 등이 사용할 수 있는 Bean이 준비됩니다.

## 내부 구조

실제 lifecycle에는 `BeanFactoryPostProcessor`, `BeanPostProcessor`, scope, lazy initialization과 proxy 생성 등 더 많은 확장 지점이 있습니다. 화면은 일반적인 singleton Bean이 준비되는 핵심 흐름을 단순화합니다.

## 실패 상황

- 필요한 BeanDefinition이나 의존성을 찾지 못할 수 있습니다.
- 순환 의존성이나 모호한 후보 때문에 주입이 실패할 수 있습니다.
- Bean 생성자, factory method 또는 초기화 callback에서 예외가 발생할 수 있습니다.

## 실무 맥락

Container 시작 오류를 볼 때는 가장 바깥쪽 예외만 보지 말고 어떤 Bean을 만들던 중 어떤 의존성에서 실패했는지 원인 chain을 따라가야 합니다.

## 출처

- Spring Framework, _Container Overview_
- Spring Framework, _Introduction to the IoC Container and Beans_
- Spring Framework, _Bean Overview_

## 참고 자료

- [Spring Framework — Container Overview](https://docs.spring.io/spring-framework/reference/core/beans/basics.html)
- [Spring Framework — Introduction to the IoC Container and Beans](https://docs.spring.io/spring-framework/reference/core/beans/introduction.html)
- [Spring Framework — Bean Overview](https://docs.spring.io/spring-framework/reference/core/beans/definition.html)
