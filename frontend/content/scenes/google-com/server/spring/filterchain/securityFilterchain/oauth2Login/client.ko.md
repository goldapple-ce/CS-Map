# 개요

OAuth 2.0 로그인 흐름에서 사용자의 브라우저를 나타냅니다. 사용자는 브라우저로 내 서버의 로그인 시작 URL을 요청하고, 이후 서버들이 반환하는 리다이렉트 응답을 따라 이동합니다.

---

# 흐름에서 하는 일

1. `/oauth2/authorization/{registrationId}`로 로그인 시작 요청을 보냅니다.
2. 내 서버가 반환한 인증 서버 URL로 새 요청을 보냅니다.
3. 인증 서버에서 로그인하고 권한 제공에 동의합니다.
4. 인증 서버가 반환한 콜백 URL로 내 서버에 Authorization Code를 전달합니다.
5. 로그인이 완료되면 내 서버의 성공 응답이나 리다이렉트를 받습니다.

브라우저는 Authorization Code를 Access Token으로 직접 교환하지 않습니다. 기밀 Client인 일반적인 서버 애플리케이션에서는 내 서버가 Token Endpoint와 통신합니다.

---

# 참고 자료

- [Spring Security - OAuth 2.0 Login](https://docs.spring.io/spring-security/reference/servlet/oauth2/login/)
