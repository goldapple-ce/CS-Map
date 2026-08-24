# 개요

사용자가 로그인하려는 애플리케이션 서버이며 OAuth 2.0의 `Client` 역할을 합니다. Spring Security의 OAuth2 Login 필터와 Client 설정이 이 서버에서 동작합니다.

---

# 책임

- OAuth 2.0 로그인 시작 URL을 제공합니다.
- 인증 서버로 보낼 Authorization Request를 구성합니다.
- 콜백으로 받은 Authorization Code를 처리합니다.
- 서버 간 요청으로 Code를 Access Token과 교환합니다.
- Access Token을 사용해 Resource Server의 사용자 정보 Endpoint를 호출합니다.
- 얻은 사용자를 Spring Security의 인증 정보로 만들고 로그인 상태를 저장합니다.

내 서버는 이 흐름에서 Authorization Server나 Resource Server를 직접 구현한 것이 아닙니다. 외부 Provider가 제공하는 두 역할을 이용하는 OAuth 2.0 Client입니다.

---

# 참고 자료

- [Spring Security - OAuth 2.0 Client](https://docs.spring.io/spring-security/reference/servlet/oauth2/client/index.html)
