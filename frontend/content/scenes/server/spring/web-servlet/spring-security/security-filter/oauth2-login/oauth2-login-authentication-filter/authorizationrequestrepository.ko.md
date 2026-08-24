# 개요

브라우저가 외부 Authorization Server를 다녀오는 동안 원래 `OAuth2AuthorizationRequest`를 보관하는 저장소입니다.

---

# 콜백 처리

`OAuth2LoginAuthenticationFilter`는 콜백을 받을 때 저장된 요청을 조회하고 제거합니다. 콜백의 Authorization Response만으로는 어떤 Client 설정으로 시작했는지와 원래 `state`가 무엇이었는지 알 수 없기 때문입니다.

조회한 요청과 콜백 응답은 `OAuth2AuthorizationExchange`로 묶여 아래 단계로 전달됩니다. 이후 `OAuth2AuthorizationCodeAuthenticationProvider`가 요청과 응답의 `state` 일치를 검증합니다.

기본 구현은 `HttpSessionOAuth2AuthorizationRequestRepository`이며 로그인 진행 중의 임시 상태만 담당합니다. 로그인 성공 후 Access Token을 저장하는 `OAuth2AuthorizedClientRepository`와는 다른 저장소입니다.

---

# 참고 자료

- [Spring Security - Authorization Code Grant](https://docs.spring.io/spring-security/reference/servlet/oauth2/client/authorization-grants.html#oauth2Client-authorization-code-grant)
