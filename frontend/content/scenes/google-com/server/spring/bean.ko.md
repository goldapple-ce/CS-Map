# 개요

Bean은 Spring IoC Container가 생성하고 조립하며 관리하는 객체입니다. 평범한 Java 객체일 수 있지만, 객체의 생성 방법과 의존 관계가 Container에 등록되어 있다는 점이 핵심입니다.

Bean의 정의에는 class, scope, 생성 방법, 의존성, 초기화 정보 등이 포함될 수 있습니다. 일반적인 singleton scope에서는 하나의 Container 안에서 해당 BeanDefinition에 대응하는 공유 instance가 관리됩니다.

`@Component`, `@Bean` method, XML 설정 등은 Bean을 등록하는 서로 다른 방법입니다. Spring AOP나 transaction 같은 기능이 적용되면 사용자가 조회하는 Bean이 원본 객체를 감싼 Proxy일 수도 있습니다.

# 참고 자료

- [Spring Framework — Bean Overview](https://docs.spring.io/spring-framework/reference/core/beans/definition.html)
- [Spring Framework — Bean Scopes](https://docs.spring.io/spring-framework/reference/core/beans/factory-scopes.html)
