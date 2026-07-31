# 개요

`FilterChainProxy`는 Spring Security의 Servlet 지원을 대표하는 하나의 Servlet Filter입니다. 내부에 여러 `SecurityFilterChain`을 보관하고 현재 요청과 처음 일치하는 chain을 선택해 그 안의 Security Filter들을 실행합니다.

Servlet Container는 일반적으로 FilterChainProxy를 직접 등록한 Spring Bean으로 찾지 않습니다. `DelegatingFilterProxy`가 Spring Container에서 FilterChainProxy Bean을 찾아 요청을 위임합니다.

선택한 SecurityFilterChain의 실행이 끝나고 원래 chain을 계속 호출하면 요청은 남은 Servlet Filter와 대상 Servlet로 진행합니다. 여러 chain이 일치해도 모두 합치는 것이 아니라 일반적으로 첫 번째 일치 chain이 사용되므로 순서가 중요합니다.

# 참고 자료

- [Spring Security — FilterChainProxy](https://docs.spring.io/spring-security/reference/servlet/architecture.html#servlet-filterchainproxy)
