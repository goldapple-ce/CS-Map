# 개요

OAuth2 Login 콜백을 Spring Security 인증 파이프라인에 전달하는 `Authentication` 구현체입니다.

---

# 인증 요청 상태

`OAuth2LoginAuthenticationFilter`가 처음 만들 때는 다음 정보를 담습니다.

- `ClientRegistration`: 어떤 OAuth2 Client와 Provider를 사용하는가
- `OAuth2AuthorizationExchange`: 저장했던 Authorization Request와 콜백 Authorization Response
- `code`, `state`, `redirect_uri` 검증에 필요한 흐름 정보

이 상태의 토큰은 아직 인증된 사용자를 뜻하지 않습니다. `AuthenticationManager`에 전달할 인증 요청입니다.

---

# 인증 결과 상태

`OAuth2LoginAuthenticationProvider`가 Code 교환과 사용자 정보 조회를 마치면 같은 타입의 인증된 토큰을 반환합니다. 결과에는 다음 정보가 추가됩니다.

- principal인 `OAuth2User`
- 사용자의 authorities
- `OAuth2AccessToken`
- 발급된 경우 `OAuth2RefreshToken`

이 결과는 다시 필터로 돌아가 최종 `OAuth2AuthenticationToken`과 `OAuth2AuthorizedClient`를 구성하는 데 사용됩니다.

---

# 참고 자료

- [Spring Security - OAuth2LoginAuthenticationToken API](https://docs.spring.io/spring-security/reference/api/java/org/springframework/security/oauth2/client/authentication/OAuth2LoginAuthenticationToken.html)
