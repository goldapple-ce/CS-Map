# 개요

순수 OAuth 2.0 Login의 전체 인증 과정을 조정하는 `AuthenticationProvider`입니다. `OAuth2LoginAuthenticationToken`을 받아 Code 교환과 사용자 정보 조회를 차례대로 수행합니다.

---

# 내부 처리

1. Authorization Request에 `openid` scope가 있는지 확인합니다. 있다면 OIDC 전용 Provider가 처리하도록 `null`을 반환합니다.
2. 입력 토큰을 `OAuth2AuthorizationCodeAuthenticationToken`으로 바꿉니다.
3. 내부의 `OAuth2AuthorizationCodeAuthenticationProvider`를 호출해 Authorization Code를 Access Token으로 교환합니다.
4. `ClientRegistration`, Access Token, 추가 파라미터로 `OAuth2UserRequest`를 만듭니다.
5. `OAuth2UserService.loadUser()`를 호출해 Resource Server에서 사용자 속성을 가져옵니다.
6. `OAuth2User`, authorities, Access Token과 선택적 Refresh Token이 담긴 인증된 `OAuth2LoginAuthenticationToken`을 반환합니다.

```text
OAuth2LoginAuthenticationProvider
├─ OAuth2AuthorizationCodeAuthenticationProvider
└─ OAuth2UserService
```

이 Provider가 모든 작업을 직접 구현하는 것은 아닙니다. Code 교환과 사용자 조회를 각각 전용 구성요소에 위임하고 결과를 하나의 로그인 인증 결과로 조립합니다.

---

# OIDC와 구분

OIDC 요청은 `OidcAuthorizationCodeAuthenticationProvider`가 처리합니다. 해당 Provider는 ID Token과 nonce를 검증하고 `OidcUserService`로 `OidcUser`를 구성합니다.

---

# 참고 자료

- [Spring Security - OAuth2LoginAuthenticationProvider 소스](https://github.com/spring-projects/spring-security/blob/main/oauth2/oauth2-client/src/main/java/org/springframework/security/oauth2/client/authentication/OAuth2LoginAuthenticationProvider.java)
