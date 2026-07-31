# 개요

Spring 애플리케이션 구성을 나타내는 중심 인터페이스이며, Bean을 생성·구성·조회하는 IoC Container 기능에 여러 애플리케이션 서비스를 더합니다.

---

# BeanFactory를 확장하는 기능

`ApplicationContext`는 `ListableBeanFactory`와 `HierarchicalBeanFactory`를 포함한 여러 인터페이스를 상속합니다. 따라서 BeanFactory의 Bean 관리 기능을 제공하면서 다음 기능도 함께 노출합니다.

- 여러 Bean과 Bean 정의 조회
- 애플리케이션 이벤트 발행
- 국제화 메시지 해석
- classpath와 파일 등의 Resource 로딩
- 부모·자식 Context 계층
- 환경과 프로퍼티 접근

```text
ApplicationContext
├─ BeanFactory 계열
├─ ApplicationEventPublisher
├─ MessageSource
└─ ResourcePatternResolver
```

---

# Spring Container와의 관계

일반적인 Spring 애플리케이션에서는 `ApplicationContext` 구현체가 실제 Spring IoC Container 역할을 합니다. 설정 메타데이터를 읽고 Bean을 생성·조립하며, 초기화와 종료를 포함한 생명주기를 관리합니다.

Scene의 `ApplicationContext → Spring Container` 관계는 ApplicationContext가 BeanFactory 기능을 포함한다는 인터페이스 관점을 단순화한 표현입니다. 실제 애플리케이션에서 두 개의 독립된 컨테이너가 항상 따로 존재한다는 뜻은 아닙니다.

---

# 참고 자료

- [Spring Framework - ApplicationContext API](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/context/ApplicationContext.html)
- [Spring Framework - Container Overview](https://docs.spring.io/spring-framework/reference/core/beans/basics.html)
