# 개요

OAuth 2.0 Client 측에서 Authorization Code를 Access Token으로 교환하는 작은 범위의 `AuthenticationProvider`입니다.

---

# 입력과 출력

입력은 `OAuth2AuthorizationCodeAuthenticationToken`입니다. 이 토큰에는 `ClientRegistration`과 Authorization Request·Response가 들어 있습니다.

Provider는 다음 순서로 처리합니다.

1. Authorization Response에 OAuth 2.0 오류가 있는지 확인합니다.
2. Authorization Response의 `state`가 원래 요청의 값과 같은지 검증합니다.
3. `OAuth2AccessTokenResponseClient`에 `OAuth2AuthorizationCodeGrantRequest`를 전달합니다.
4. Token Endpoint에 Code, redirect URI, Client 인증 정보를 보내 Access Token 응답을 받습니다.
5. Access Token, 선택적 Refresh Token과 추가 파라미터가 담긴 인증된 `OAuth2AuthorizationCodeAuthenticationToken`을 반환합니다.

이 Provider는 사용자 정보를 조회하거나 `OAuth2User`를 만들지 않습니다. 반환 결과를 받은 `OAuth2LoginAuthenticationProvider`가 다음 단계로 `OAuth2UserService`를 호출합니다.

---

# 이름이 같은 서버 측 클래스

Spring Authorization Server에도 같은 단순 클래스명의 `OAuth2AuthorizationCodeAuthenticationProvider`가 있습니다. 이 Scene의 클래스는 `org.springframework.security.oauth2.client.authentication` 패키지에 있는 Client 측 구현입니다.

---

# 참고 자료

- [Spring Security - Client OAuth2AuthorizationCodeAuthenticationProvider 소스](https://github.com/spring-projects/spring-security/blob/main/oauth2/oauth2-client/src/main/java/org/springframework/security/oauth2/client/authentication/OAuth2AuthorizationCodeAuthenticationProvider.java)
