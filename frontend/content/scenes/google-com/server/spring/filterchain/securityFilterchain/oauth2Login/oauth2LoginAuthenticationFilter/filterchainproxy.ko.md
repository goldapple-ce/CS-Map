# 개요

Servlet 요청에 적용할 `SecurityFilterChain`을 선택하고 그 안의 Spring Security 필터를 순서대로 실행하는 진입점입니다.

---

# 이 Scene에서의 역할

인증 서버가 브라우저를 `/login/oauth2/code/{registrationId}`로 돌려보내면 해당 요청도 `FilterChainProxy`를 거칩니다. 선택된 체인에 `OAuth2LoginAuthenticationFilter`가 등록되어 있다면 필터 순서에 따라 이를 호출합니다.

`FilterChainProxy`가 OAuth2 콜백을 직접 해석하는 것은 아닙니다. 요청과 일치하는 보안 필터 체인을 선택하고 실행하는 책임만 가지며, 실제 OAuth2 로그인 처리는 `OAuth2LoginAuthenticationFilter`가 담당합니다.

---

# 참고 자료

- [Spring Security - FilterChainProxy API](https://docs.spring.io/spring-security/reference/api/java/org/springframework/security/web/FilterChainProxy.html)
