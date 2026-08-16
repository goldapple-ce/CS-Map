# 한눈에 보기

Servlet Container가 받은 요청을 Spring Container가 관리하는 Filter Bean에 전달하는 연결 장치입니다.

Servlet Container는 Servlet Filter를 실행할 수 있지만 Spring Bean을 직접 알지 못합니다. DelegatingFilterProxy는 두 Container 사이에서 요청을 넘겨주는 역할을 합니다.

Spring Security에서는 보통 `springSecurityFilterChain`이라는 이름의 `FilterChainProxy` Bean이 위임 대상입니다.

---

# 동작 방식

1. Servlet FilterChain이 DelegatingFilterProxy를 호출합니다.
2. DelegatingFilterProxy가 Spring Container에서 대상 Filter Bean을 찾습니다.
3. 찾은 Bean의 `doFilter()`를 호출해 처리를 위임합니다.
4. 위임된 처리가 원래 체인을 계속 진행하면 뒤쪽 Servlet Filter와 DispatcherServlet이 호출됩니다.

---

# 개발자가 개입하는 지점

일반적인 Spring Boot 애플리케이션에서 개발자가 DelegatingFilterProxy를 직접 생성하거나 호출할 지점은 없습니다.

다만 이 구조를 알면 Servlet FilterChain에는 들어왔지만 Spring Security Filter가 실행되지 않는 문제, `springSecurityFilterChain` Bean 탐색 실패와 custom Filter 중복 실행 문제를 추적하는 데 도움이 됩니다.

---

# 헷갈리기 쉬운 점

## 두 Container는 다릅니다

- Servlet Container: Servlet, Servlet Filter와 HTTP 요청 처리 관리
- Spring Container: Bean 생성, 의존성 주입과 lifecycle 관리

DelegatingFilterProxy는 이 두 관리 영역을 이어줍니다.

# 참고 자료

- [Spring Security — DelegatingFilterProxy](https://docs.spring.io/spring-security/reference/servlet/architecture.html#servlet-delegatingfilterproxy)
- [Spring Framework — DelegatingFilterProxy API](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/web/filter/DelegatingFilterProxy.html)
