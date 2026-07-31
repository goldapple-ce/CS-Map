# 개요

Spring AOP는 여러 Bean에 반복되는 공통 관심사를 핵심 로직과 분리해 적용하는 기능입니다. transaction, method security, logging 등이 대표적인 사용 예입니다.

Spring AOP는 주로 Spring Bean의 method 실행을 join point로 삼습니다. 대상 Bean이 pointcut 조건에 맞으면 Spring이 Proxy를 만들고, 호출을 가로채 Advice를 실행한 뒤 실제 대상 객체로 위임합니다.

모든 Bean이 Proxy가 되는 것은 아닙니다. 적용할 Advisor가 있는 Bean만 대상이 되며, Proxy 기반이므로 같은 객체 내부에서 `this`로 호출하는 self-invocation은 Proxy를 거치지 않는다는 점에 주의해야 합니다.

# 참고 자료

- [Spring Framework — Aspect Oriented Programming with Spring](https://docs.spring.io/spring-framework/reference/core/aop.html)
- [Spring Framework — Proxying Mechanisms](https://docs.spring.io/spring-framework/reference/core/aop/proxying.html)
