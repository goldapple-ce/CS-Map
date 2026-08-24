# 개요

Access Token으로 보호된 API를 제공하는 OAuth 2.0 Resource Server입니다. 이 로그인 흐름에서는 현재 사용자 정보를 반환하는 UserInfo 성격의 Endpoint를 제공합니다.

---

# 로그인에서의 역할

내 서버의 `OAuth2UserService`는 Token Endpoint에서 받은 Access Token을 Bearer Token으로 보내 현재 사용자의 속성을 요청합니다.

```http
GET /user
Authorization: Bearer <access-token>
```

Resource Server는 토큰과 scope를 검증하고 사용자 식별자, 이름, 이메일, 프로필 이미지처럼 허용된 정보를 반환합니다. Spring Security는 이 응답을 `OAuth2User`로 변환합니다.

Provider마다 Endpoint와 속성 이름은 다릅니다. 예를 들어 GitHub OAuth 앱은 `https://api.github.com/user`에서 인증된 사용자 정보를 제공합니다.

---

# Authorization Server와 구분

- Authorization Server: Authorization Code와 Access Token을 발급합니다.
- Resource Server: Access Token을 받아 보호된 사용자 정보나 다른 리소스를 제공합니다.

두 역할을 같은 회사나 서비스가 운영할 수 있지만 OAuth 2.0에서의 책임은 다릅니다.

---

# 참고 자료

- [GitHub - Get the authenticated user](https://docs.github.com/en/rest/users/users#get-the-authenticated-user)
- [Spring Security - DefaultOAuth2UserService API](https://docs.spring.io/spring-security/reference/api/java/org/springframework/security/oauth2/client/userinfo/DefaultOAuth2UserService.html)
