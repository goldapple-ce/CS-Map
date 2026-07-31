# 개요

`BeanDefinition`은 Spring Container가 Bean을 만들기 위해 사용하는 구성 metadata입니다. 실제 애플리케이션 객체가 아니라 객체 생성 방법을 설명하는 정의입니다.

정의에는 Bean class, constructor argument, 다른 Bean에 대한 참조, scope, lazy 여부와 lifecycle callback 같은 정보가 포함될 수 있습니다. Container는 component scan이나 설정 class를 해석해 이 정의를 내부 registry에 등록합니다.

같은 이름의 정의 충돌이나 필요한 정의 누락은 애플리케이션 시작 실패로 이어질 수 있습니다.

# 참고 자료

- [Spring Framework — Bean Overview](https://docs.spring.io/spring-framework/reference/core/beans/definition.html)
