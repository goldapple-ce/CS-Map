# 개요

`ApplicationContext`는 일반적인 Spring 애플리케이션에서 IoC Container 역할을 담당하는 중심 interface입니다. BeanFactory의 Bean 생성·조회 기능에 event 발행, resource loading, message 처리와 환경 정보 같은 기능을 더합니다.

Context를 초기화하면 설정 정보를 읽어 BeanDefinition을 등록하고, 기본 singleton Bean의 생성과 후처리를 진행합니다. 정확한 초기화 순서는 Context 구현과 설정에 따라 달라질 수 있습니다.

ApplicationContext와 Spring Container가 항상 별개의 두 객체라는 뜻은 아닙니다. 보통 ApplicationContext 구현체가 실제 Container입니다.

# 참고 자료

- [Spring Framework — ApplicationContext API](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/context/ApplicationContext.html)
