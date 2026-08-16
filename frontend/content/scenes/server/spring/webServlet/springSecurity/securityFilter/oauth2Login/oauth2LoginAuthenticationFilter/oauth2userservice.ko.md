# 개요

Access Token을 사용해 Provider의 UserInfo Endpoint에서 사용자 속성을 가져오고 `OAuth2User`를 반환하는 전략 인터페이스입니다.

---

# 입력

`OAuth2LoginAuthenticationProvider`는 다음 정보를 담은 `OAuth2UserRequest`를 전달합니다.

- `ClientRegistration`: UserInfo Endpoint URL과 사용자 이름 속성 설정
- `OAuth2AccessToken`: Resource Server 요청에 사용할 Bearer Token
- Token Endpoint가 반환한 추가 파라미터

# 기본 구현

`DefaultOAuth2UserService`는 Access Token을 `Authorization: Bearer` 헤더에 넣어 UserInfo Endpoint를 호출합니다. 응답의 JSON 속성을 Provider 설정에 맞게 읽어 `DefaultOAuth2User`로 반환합니다.

Provider마다 사용자 속성 이름이 표준화되어 있지 않습니다. 예를 들어 고유 사용자 키가 `id`, `login`, `sub`처럼 다를 수 있으므로 `ClientRegistration.ProviderDetails.UserInfoEndpoint.userNameAttributeName` 설정이 필요합니다.

커스텀 `OAuth2UserService`는 기본 서비스를 호출한 뒤 애플리케이션 회원을 조회·가입시키거나 권한을 변환하는 방식으로 구성할 수 있습니다.

---

# 참고 자료

- [Spring Security - DefaultOAuth2UserService API](https://docs.spring.io/spring-security/reference/api/java/org/springframework/security/oauth2/client/userinfo/DefaultOAuth2UserService.html)
- [Spring Security - OAuth2UserRequest API](https://docs.spring.io/spring-security/reference/api/java/org/springframework/security/oauth2/client/userinfo/OAuth2UserRequest.html)
