# 개요

의존성 주입은 객체가 필요한 collaborator를 직접 생성하거나 전역 위치에서 찾지 않고, Container가 외부에서 전달하는 방식입니다.

Spring은 생성자, factory method argument, setter와 field 등을 통해 의존성을 주입할 수 있습니다. 필수 의존성은 객체가 완전한 상태로 만들어지기 쉬운 constructor injection이 일반적으로 권장됩니다.

같은 type의 후보가 여러 개이거나 필요한 Bean이 없으면 주입에 실패할 수 있습니다. `@Qualifier`, `@Primary`와 명시적인 Bean 구성을 이용해 후보를 구분할 수 있습니다.

# 참고 자료

- [Spring Framework — Dependencies](https://docs.spring.io/spring-framework/reference/core/beans/dependencies/factory-collaborators.html)
