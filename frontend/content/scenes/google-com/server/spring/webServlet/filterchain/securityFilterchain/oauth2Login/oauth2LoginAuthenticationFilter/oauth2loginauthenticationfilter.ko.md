# 개요

Authorization Server가 브라우저를 통해 돌려보낸 OAuth 2.0 Authorization Response를 처리하는 인증 필터입니다. 기본 콜백 경로는 `/login/oauth2/code/{registrationId}`입니다.

---

# 처리 과정

1. 콜백의 `code`, `state` 또는 오류 파라미터를 읽습니다.
2. `AuthorizationRequestRepository`에서 로그인 시작 때 저장한 요청을 가져옵니다.
3. `ClientRegistration`과 요청·응답을 묶은 `OAuth2LoginAuthenticationToken`을 생성합니다.
4. `AuthenticationManager`에 인증을 요청합니다.
5. 인증 결과의 principal과 Access Token으로 `OAuth2AuthenticationToken`과 `OAuth2AuthorizedClient`를 구성합니다.
6. 최종 인증 정보를 `SecurityContextHolder`와 `SecurityContextRepository`에 저장합니다.

필터 자체가 Authorization Code를 Token Endpoint로 보내거나 사용자 정보 API를 직접 호출하지는 않습니다. 그 작업은 `AuthenticationManager` 아래의 Provider와 `OAuth2UserService`에 위임합니다.

---

# 참고 자료

- [Spring Security - OAuth2LoginAuthenticationFilter API](https://docs.spring.io/spring-security/reference/api/java/org/springframework/security/oauth2/client/web/OAuth2LoginAuthenticationFilter.html)
