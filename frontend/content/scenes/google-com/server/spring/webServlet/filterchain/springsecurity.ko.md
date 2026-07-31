# 개요

이 Scene에서 Spring Security는 Servlet FilterChain에 보안 처리를 결합하는 Spring 프로젝트를 뜻합니다.

Servlet Container가 직접 Spring Security의 여러 Bean을 호출하는 것은 아닙니다. Container에 등록된 `DelegatingFilterProxy`가 Spring Container의 `FilterChainProxy` Bean으로 요청을 위임하고, FilterChainProxy가 현재 요청과 일치하는 `SecurityFilterChain`을 선택합니다.

따라서 Spring Security Filter들은 Controller보다 앞에서 인증 정보 복원, 로그인 처리, 예외 변환과 인가를 수행할 수 있습니다. 보안 처리가 응답을 완성하고 다음 chain을 호출하지 않으면 요청은 `DispatcherServlet`까지 진행되지 않습니다.

# 참고 자료

- [Spring Security — Servlet Architecture](https://docs.spring.io/spring-security/reference/servlet/architecture.html)
