# 개요

초기화 Callback은 의존성 주입이 끝난 Bean이 사용 준비를 마칠 수 있도록 호출되는 lifecycle 단계입니다.

`@PostConstruct`, `InitializingBean.afterPropertiesSet()`과 `@Bean(initMethod=...)` 같은 방식이 있습니다. 여러 방식이 함께 설정되면 Spring이 정한 순서대로 호출됩니다.

Callback은 이미 주입된 의존성을 이용한 검증이나 resource 준비에 사용할 수 있습니다. 예외가 발생하면 해당 Bean 생성과 ApplicationContext 초기화가 실패할 수 있으므로 오래 걸리는 외부 작업을 무조건 넣는 것은 주의해야 합니다.

# 참고 자료

- [Spring Framework — Initialization Callbacks](https://docs.spring.io/spring-framework/reference/core/beans/factory-nature.html#beans-factory-lifecycle-initializingbean)
