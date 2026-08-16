# 개요

설정 정보는 Spring Container가 어떤 객체를 Bean으로 관리하고 어떻게 생성·연결할지 판단하는 입력입니다.

대표적인 형태는 `@Configuration` class의 `@Bean` method, component scanning으로 발견한 stereotype class, XML 정의입니다. Spring Boot의 자동 설정도 조건에 따라 BeanDefinition을 제공하는 설정 방식입니다.

설정 정보 자체가 곧 Bean instance는 아닙니다. Container는 이를 해석해 `BeanDefinition`을 등록한 뒤 적절한 시점에 실제 객체를 생성합니다.

# 참고 자료

- [Spring Framework — Configuration Metadata](https://docs.spring.io/spring-framework/reference/core/beans/basics.html)
