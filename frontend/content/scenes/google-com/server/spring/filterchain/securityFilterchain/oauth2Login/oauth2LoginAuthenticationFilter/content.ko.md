# 개요

`OAuth2LoginAuthenticationFilter`는 Authorization Server가 브라우저를 통해 전달한 OAuth 2.0 콜백을 Spring Security의 인증 파이프라인으로 연결합니다. 필터는 요청을 직접 모두 처리하지 않고 `AuthenticationManager`, 여러 `AuthenticationProvider`, `OAuth2UserService`에 단계별 책임을 위임합니다.

이 Scene은 `openid` scope가 없는 순수 OAuth 2.0 Login을 설명합니다. OIDC 요청은 같은 필터에서 시작하지만 `OidcAuthorizationCodeAuthenticationProvider`와 `OidcUserService`가 처리합니다.

---

# 전체 호출 구조

```text
FilterChainProxy
└─ OAuth2LoginAuthenticationFilter
   ├─ AuthorizationRequestRepository에서 원래 요청 조회
   ├─ OAuth2LoginAuthenticationToken 생성
   └─ AuthenticationManager
      └─ ProviderManager
         └─ OAuth2LoginAuthenticationProvider
            ├─ OAuth2AuthorizationCodeAuthenticationProvider
            │  └─ Authorization Server의 Token Endpoint
            └─ OAuth2UserService
               └─ Resource Server의 UserInfo Endpoint
```

인증이 성공하면 호출 결과는 반대 방향으로 돌아옵니다.

```text
Resource Server
→ OAuth2User
→ 인증된 OAuth2LoginAuthenticationToken
→ OAuth2LoginAuthenticationFilter
→ OAuth2AuthenticationToken
→ SecurityContextHolder
→ SecurityContextRepository
```

---

# 1단계: 콜백을 인증 요청으로 변환

Authorization Server는 사용자의 승인 결과를 브라우저를 통해 `/login/oauth2/code/{registrationId}`로 전달합니다. 성공 응답에는 `code`와 `state`가, 실패 응답에는 OAuth 2.0 오류가 포함될 수 있습니다.

필터는 `AuthorizationRequestRepository`에서 로그인 시작 때 저장한 `OAuth2AuthorizationRequest`를 가져옵니다. 원래 요청과 콜백 응답, `ClientRegistration`을 묶어 인증 전 `OAuth2LoginAuthenticationToken`을 만들고 `AuthenticationManager`에 전달합니다.

---

# 2단계: ProviderManager가 로그인 Provider 선택

일반적인 `AuthenticationManager` 구현인 `ProviderManager`는 등록된 `AuthenticationProvider`를 순서대로 확인합니다. 순수 OAuth 2.0 요청은 `OAuth2LoginAuthenticationProvider`가 담당합니다.

`OAuth2LoginAuthenticationProvider`는 Authorization Request의 scope에 `openid`가 포함되어 있으면 `null`을 반환합니다. 이 경우 `ProviderManager`가 다음 후보인 `OidcAuthorizationCodeAuthenticationProvider`에 처리를 맡길 수 있습니다.

---

# 3단계: Authorization Code 교환

`OAuth2LoginAuthenticationProvider`는 내부에 `OAuth2AuthorizationCodeAuthenticationProvider`를 가지고 있습니다. 로그인 토큰을 `OAuth2AuthorizationCodeAuthenticationToken`으로 바꾸어 이 내부 Provider에 전달합니다.

내부 Provider는 Authorization Response의 오류와 `state`를 검증한 뒤 `OAuth2AccessTokenResponseClient`를 통해 Authorization Server의 Token Endpoint를 호출합니다. 성공하면 Access Token, 선택적 Refresh Token과 추가 파라미터를 담은 인증 결과를 반환합니다.

---

# 4단계: OAuth2User 조회

Access Token을 받은 `OAuth2LoginAuthenticationProvider`는 `OAuth2UserRequest`를 만들고 `OAuth2UserService.loadUser()`를 호출합니다.

기본 `DefaultOAuth2UserService`는 `ClientRegistration`에 설정된 UserInfo Endpoint로 요청하면서 Access Token을 Bearer Token으로 전달합니다. Resource Server가 반환한 사용자 속성은 `OAuth2User`로 변환됩니다.

```text
OAuth2UserRequest
├─ ClientRegistration
├─ OAuth2AccessToken
└─ additionalParameters

OAuth2User
├─ name
├─ attributes
└─ authorities
```

Provider는 이 `OAuth2User`와 토큰을 담은 인증된 `OAuth2LoginAuthenticationToken`을 만들어 `AuthenticationManager`와 필터로 반환합니다.

---

# 5단계: 내 애플리케이션 로그인 완료

필터는 인증 결과의 `OAuth2User`를 principal로 사용하는 `OAuth2AuthenticationToken`을 만듭니다. 이 객체는 현재 내 애플리케이션에 로그인한 사용자를 나타냅니다.

동시에 `ClientRegistration`, 사용자와 Access·Refresh Token을 묶은 `OAuth2AuthorizedClient`를 저장합니다. 이후 외부 API를 호출해야 한다면 저장된 Access Token을 다시 사용할 수 있습니다.

마지막으로 `OAuth2AuthenticationToken`이 담긴 `SecurityContext`를 `SecurityContextHolder`에 설정하고, 구성된 `SecurityContextRepository`에 저장합니다. 세션 기반 구성에서는 이후 요청이 세션 쿠키로 로그인 상태를 복원합니다.

---

# 비슷한 객체 구분

| 객체 | 의미 |
| --- | --- |
| `OAuth2LoginAuthenticationToken` | OAuth2 Login 인증 요청과 Provider의 인증 결과 |
| `OAuth2AuthorizationCodeAuthenticationToken` | Code를 Access Token으로 교환하는 내부 단계의 요청과 결과 |
| `OAuth2User` | Resource Server에서 조회한 사용자 principal |
| `OAuth2AuthenticationToken` | 내 애플리케이션의 최종 로그인 Authentication |
| `OAuth2AuthorizedClient` | 사용자·ClientRegistration·Access Token의 연결 |

---

# 참고 자료

- [Spring Security - OAuth2LoginAuthenticationFilter API](https://docs.spring.io/spring-security/reference/api/java/org/springframework/security/oauth2/client/web/OAuth2LoginAuthenticationFilter.html)
- [Spring Security - OAuth2LoginAuthenticationProvider 소스](https://github.com/spring-projects/spring-security/blob/main/oauth2/oauth2-client/src/main/java/org/springframework/security/oauth2/client/authentication/OAuth2LoginAuthenticationProvider.java)
- [Spring Security - OAuth2AuthorizationCodeAuthenticationProvider 소스](https://github.com/spring-projects/spring-security/blob/main/oauth2/oauth2-client/src/main/java/org/springframework/security/oauth2/client/authentication/OAuth2AuthorizationCodeAuthenticationProvider.java)
- [Spring Security - DefaultOAuth2UserService API](https://docs.spring.io/spring-security/reference/api/java/org/springframework/security/oauth2/client/userinfo/DefaultOAuth2UserService.html)
