# 개요

로그인 시작 시 생성한 `OAuth2AuthorizationRequest`를 인증 서버의 콜백이 도착할 때까지 임시 보관하는 저장소입니다.

---

# 왜 저장하는가?

OAuth 2.0 로그인은 브라우저가 내 서버를 떠났다가 다시 돌아오는 여러 요청으로 진행됩니다. 콜백만 보고는 어떤 Client 설정과 시작 요청에서 출발했는지 알 수 없으므로 원래 Authorization Request를 보관해야 합니다.

`OAuth2LoginAuthenticationFilter`는 콜백에서 저장된 요청을 꺼내 다음 정보를 확인합니다.

- 콜백의 `state`가 시작 요청의 값과 일치하는가?
- 어떤 `ClientRegistration`으로 시작한 흐름인가?
- 어떤 `redirect_uri`와 scope를 사용했는가?

기본 구현인 `HttpSessionOAuth2AuthorizationRequestRepository`는 이 요청을 `HttpSession`에 저장합니다. 로그인 완료 또는 실패 처리 과정에서는 사용이 끝난 요청을 제거합니다.

---

# 다른 저장소와 구분

- `ClientRegistrationRepository`: Provider와 Client의 고정 설정을 저장합니다.
- `AuthorizationRequestRepository`: 리다이렉트와 콜백 사이의 임시 요청 상태를 저장합니다.
- `OAuth2AuthorizedClientRepository`: 로그인 성공 후 사용자와 Access Token의 연결을 저장합니다.

---

# 참고 자료

- [Spring Security - Authorization Code Grant](https://docs.spring.io/spring-security/reference/servlet/oauth2/client/authorization-grants.html#oauth2Client-authorization-code-grant)
