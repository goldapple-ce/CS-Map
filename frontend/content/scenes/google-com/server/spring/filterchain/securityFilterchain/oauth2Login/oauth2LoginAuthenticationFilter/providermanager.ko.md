# 개요

`AuthenticationManager`의 대표 구현체로, 등록된 `AuthenticationProvider` 목록에 실제 인증을 위임합니다.

---

# Provider 선택

`ProviderManager`는 각 Provider의 `supports()` 결과를 확인하고 지원하는 Provider의 `authenticate()`를 호출합니다. Provider가 현재 요청을 더 구체적으로 확인한 뒤 `null`을 반환하면 다음 Provider를 시도할 수 있습니다.

OAuth2 Login 설정에는 순수 OAuth 2.0과 OIDC를 위한 Provider가 함께 등록될 수 있습니다.

```text
ProviderManager
├─ OAuth2LoginAuthenticationProvider
└─ OidcAuthorizationCodeAuthenticationProvider
```

두 Provider 모두 `OAuth2LoginAuthenticationToken`을 지원하지만 Authorization Request의 `openid` scope 여부에 따라 자신의 담당인지 결정합니다.

---

# 참고 자료

- [Spring Security - ProviderManager](https://docs.spring.io/spring-security/reference/servlet/authentication/architecture.html#servlet-authentication-providermanager)
