# 개요

Spring Security 필터가 인증을 요청할 때 사용하는 핵심 인터페이스입니다. 인증 전 `Authentication`을 받아 인증 결과를 반환하는 하나의 진입점을 제공합니다.

```java
Authentication authenticate(Authentication authentication)
```

---

# 반환 결과

- 인증 성공: 인증된 사용자, 권한 등이 담긴 `Authentication`을 반환합니다.
- 인증 실패: `AuthenticationException`을 던집니다.
- 처리할 수 있는 인증 방식이 없음: 대표 구현인 `ProviderManager`에서는 최종적으로 `ProviderNotFoundException`이 발생할 수 있습니다.

`AuthenticationManager` 자체는 사용자 조회나 비밀번호 비교 방식을 규정하지 않습니다. 구체적인 인증 전략은 구현체와 그 아래의 `AuthenticationProvider`가 맡습니다.

---

# 이 흐름에서의 위치

`UsernamePasswordAuthenticationFilter`는 자신이 만든 인증 전 토큰을 `AuthenticationManager`에 넘깁니다. 일반적인 Servlet 애플리케이션에서는 `ProviderManager`가 이 인터페이스를 구현하며, 적합한 `AuthenticationProvider`에 실제 검증을 위임합니다.

---

# 참고 자료

- [Spring Security - Servlet Authentication Architecture](https://docs.spring.io/spring-security/reference/servlet/authentication/architecture.html#servlet-authentication-authenticationmanager)
