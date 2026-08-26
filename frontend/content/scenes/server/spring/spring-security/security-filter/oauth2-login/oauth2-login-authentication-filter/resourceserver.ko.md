# 개요

Access Token으로 보호된 사용자 정보 API를 제공하는 OAuth 2.0 Resource Server입니다.

---

# 이 Scene에서의 요청

`OAuth2UserService`는 `ClientRegistration`에 설정된 UserInfo Endpoint로 요청하면서 Access Token을 Bearer Token으로 전달합니다.

```http
GET /userinfo-or-user-api
Authorization: Bearer <access-token>
```

Resource Server는 토큰과 scope를 확인한 뒤 허용된 사용자 속성을 JSON으로 반환합니다. `OAuth2UserService`는 이를 `OAuth2User`로 변환합니다.

순수 OAuth 2.0은 ID Token을 정의하지 않습니다. 따라서 Spring의 비-OIDC OAuth2 Login에서는 이 사용자 정보 API가 Client가 사용자를 식별하는 실질적인 근거가 됩니다.

Resource Server와 Authorization Server는 같은 Provider가 운영할 수 있지만, Access Token을 발급하는 역할과 이를 받아 리소스를 제공하는 역할은 구분됩니다.

---

# 참고 자료

- [Spring Security - OAuth 2.0 Resource Server 개요](https://docs.spring.io/spring-security/reference/servlet/oauth2/)
