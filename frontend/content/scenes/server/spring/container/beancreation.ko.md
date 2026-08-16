# 개요

Bean 생성 단계에서는 Container가 `BeanDefinition`에 기록된 방법으로 실제 객체 instance를 만듭니다.

생성자 호출, static factory method 또는 다른 Bean의 factory method가 사용될 수 있습니다. 객체를 생성한 뒤에는 property 설정, 의존성 주입과 `BeanPostProcessor` 처리가 이어집니다.

Scene은 이해를 위해 생성과 의존성 주입을 분리하지만 constructor injection에서는 필요한 의존 Bean을 먼저 준비한 뒤 생성자에 전달하므로 두 단계가 실제로 맞물려 진행됩니다.

# 참고 자료

- [Spring Framework — Instantiating Beans](https://docs.spring.io/spring-framework/reference/core/beans/definition.html#beans-factory-class)
