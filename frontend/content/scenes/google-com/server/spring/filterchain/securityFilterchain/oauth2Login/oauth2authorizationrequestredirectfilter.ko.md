# 개요

OAuth 2.0 로그인을 시작하는 Spring Security 필터입니다. 기본적으로 `/oauth2/authorization/{registrationId}` 요청을 처리합니다.

---

# 처리 과정

필터는 `OAuth2AuthorizationRequestResolver`를 통해 `ClientRegistrationRepository`에서 Client 설정을 조회하고 `OAuth2AuthorizationRequest`를 만듭니다. 요청에는 `client_id`, `scope`, `state`, `response_type=code`, `redirect_uri` 등이 포함됩니다.

생성한 요청은 콜백 검증을 위해 `AuthorizationRequestRepository`에 저장합니다. 그다음 인증 서버의 Authorization Endpoint URL을 `Location` 헤더에 담은 HTTP 리다이렉트 응답을 클라이언트에 반환합니다.

```text
내 서버 → 브라우저
HTTP 302 또는 다른 3xx 응답
Location: https://provider.example/authorize?...

브라우저 → 인증 서버
GET https://provider.example/authorize?...
```

필터가 인증 서버를 직접 호출하는 것이 아니라, 응답을 받은 브라우저가 인증 서버로 새 요청을 보낸다는 점이 중요합니다.

---

# 참고 자료

- [Spring Security - OAuth2AuthorizationRequestRedirectFilter API](https://docs.spring.io/spring-security/reference/api/java/org/springframework/security/oauth2/client/web/OAuth2AuthorizationRequestRedirectFilter.html)
