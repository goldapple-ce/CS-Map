# 개요

특정 종류의 `Authentication`을 처리하는 전략 인터페이스입니다. `ProviderManager`는 여러 구현체를 조합해 하나의 인증 진입점을 제공합니다.

---

# 핵심 계약

```java
boolean supports(Class<?> authentication)
Authentication authenticate(Authentication authentication)
```

- `supports`: 전달된 Authentication 타입을 처리할 후보인지 알립니다.
- `authenticate`: 인증 결과를 반환하거나 실패 예외를 던집니다. 더 적합한 Provider가 처리하도록 `null`을 반환할 수도 있습니다.

이 Scene의 `OAuth2LoginAuthenticationProvider`는 OAuth2 Login 전체 인증을 담당하는 Provider입니다. 그 내부의 `OAuth2AuthorizationCodeAuthenticationProvider`도 같은 인터페이스를 구현하지만, 더 작은 범위인 Authorization Code와 Access Token 교환만 담당합니다.

---

# 참고 자료

- [Spring Security - AuthenticationProvider API](https://docs.spring.io/spring-security/reference/api/java/org/springframework/security/authentication/AuthenticationProvider.html)
