# 개요

Servlet 컨테이너가 관리하는 Filter 실행과 Spring Container가 관리하는 Filter Bean을 연결하는 어댑터입니다.

---

# 필요한 이유

Servlet 컨테이너는 표준 방식으로 등록된 Filter를 실행할 수 있지만 Spring의 `ApplicationContext`와 Bean을 직접 알지 못합니다. 반대로 Spring Security의 핵심 Filter인 `FilterChainProxy`는 Spring Bean으로 관리됩니다.

`DelegatingFilterProxy`는 Servlet Filter로 등록되어 요청을 받은 뒤 지정된 이름의 Spring Bean을 찾아 `doFilter()` 호출을 위임합니다.

```text
Servlet 컨테이너
→ DelegatingFilterProxy
→ Spring ApplicationContext
→ FilterChainProxy Bean
```

Spring Boot 환경에서는 보통 `springSecurityFilterChain`이라는 이름의 Bean과 연결됩니다. Proxy는 보안 판단을 직접 수행하지 않으며 Servlet과 Spring의 생명주기·관리 경계를 이어주는 역할에 집중합니다.

---

# 다음 체인과의 관계

위임받은 `FilterChainProxy`는 Spring Security 필터 실행이 끝나면 원래 Servlet `FilterChain`을 다시 진행할 수 있습니다. 따라서 `DelegatingFilterProxy`는 원래 체인 안에 위치하면서 그 지점에 Spring Security 내부 체인을 중첩합니다.

---

# 참고 자료

- [Spring Security - DelegatingFilterProxy](https://docs.spring.io/spring-security/reference/servlet/architecture.html#servlet-delegatingfilterproxy)
- [Spring Framework - DelegatingFilterProxy API](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/web/filter/DelegatingFilterProxy.html)
