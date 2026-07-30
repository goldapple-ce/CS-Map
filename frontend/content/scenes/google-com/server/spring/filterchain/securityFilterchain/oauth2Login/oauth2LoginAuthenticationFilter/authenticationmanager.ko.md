# 개요

인증 필터가 구체적인 인증 방식에 의존하지 않고 인증을 요청할 수 있게 하는 공통 인터페이스입니다.

---

# 이 Scene에서의 역할

`OAuth2LoginAuthenticationFilter`는 `OAuth2LoginAuthenticationToken`을 `AuthenticationManager.authenticate()`에 전달합니다. 일반적인 구현체인 `ProviderManager`는 등록된 `AuthenticationProvider` 중 이 토큰을 처리할 수 있는 Provider를 찾습니다.

순수 OAuth 2.0 로그인에서는 `OAuth2LoginAuthenticationProvider`가 요청을 처리합니다. Authorization Request에 `openid` scope가 있다면 이 Provider는 처리를 보류하고 OIDC 전용 `OidcAuthorizationCodeAuthenticationProvider`가 담당합니다.

인증 성공 시 인증된 `Authentication`을 반환하고, 실패 시 `AuthenticationException`을 던집니다.

---

# 참고 자료

- [Spring Security - Servlet Authentication Architecture](https://docs.spring.io/spring-security/reference/servlet/authentication/architecture.html#servlet-authentication-authenticationmanager)
