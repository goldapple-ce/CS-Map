# 개요

특정 종류의 인증을 실제로 처리하는 전략 인터페이스입니다. `ProviderManager`는 등록된 여러 `AuthenticationProvider` 중 전달받은 `Authentication` 타입을 지원하는 구현체를 찾아 인증을 맡깁니다.

---

# 두 가지 핵심 메서드

```java
boolean supports(Class<?> authentication)
Authentication authenticate(Authentication authentication)
```

- `supports`: 이 Provider가 해당 `Authentication` 타입을 처리할 후보인지 알려줍니다.
- `authenticate`: 자격 증명을 검증하고 인증된 `Authentication`을 반환합니다.

`authenticate`는 성공 결과를 반환하거나, 인증 실패 시 `AuthenticationException`을 던지거나, 판단할 수 없으면 `null`을 반환해 다음 Provider가 시도하도록 할 수 있습니다.

---

# 구현체가 나뉘는 이유

인증 방식마다 필요한 검증이 다르기 때문입니다. 예를 들어 `DaoAuthenticationProvider`는 사용자 이름과 비밀번호를 처리하고, JWT·LDAP·SAML 같은 방식은 각각 다른 Provider가 담당할 수 있습니다. 상위 필터는 이 차이를 몰라도 `AuthenticationManager`라는 하나의 진입점으로 인증을 요청할 수 있습니다.

---

# 참고 자료

- [Spring Security - AuthenticationProvider API](https://docs.spring.io/spring-security/reference/api/java/org/springframework/security/authentication/AuthenticationProvider.html)
- [Spring Security - Servlet Authentication Architecture](https://docs.spring.io/spring-security/reference/servlet/authentication/architecture.html#servlet-authentication-authenticationprovider)
