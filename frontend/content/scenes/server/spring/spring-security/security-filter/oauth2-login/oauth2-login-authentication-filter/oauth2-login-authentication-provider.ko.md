# 한눈에 보기

OAuth2LoginAuthenticationProvider는 `Authorization Code를 Access Token으로 교환`하고 `사용자 정보를 조회`하여 OAuth2 인증을 완료합니다.
내부적으로 `OAuth2AuthorizationCodeAuthenticationProvider`에 토큰 교환을, `OAuth2UserService`에 사용자 정보 조회를 위임합니다.
Scope에 `openid`가 포함된 OIDC 로그인은 null 처리합니다.

---

# OAuth2LoginAuthenticationProvider

OAuth2LoginAuthenticationProvider는 Spring Security에서 `Authorization Code를 Access Token으로 교환`하고, `사용자 정보를 조회`하여 OAuth2 로그인 인증을 완료하는 AuthenticationProvider입니다.
앞서 OAuth2LoginAuthenticationFilter가 Callback 요청을 처리하고 AuthenticationManager에 인증을 위임했다면, OAuth2LoginAuthenticationProvider는 실제 토큰 교환과 사용자 정보 조회를 수행합니다.

---

## OAuth2LoginAuthenticationProvider의 동작

OAuth2LoginAuthenticationProvider는 AuthenticationProvider 인터페이스를 구현하며, OAuth2LoginAuthenticationToken을 전달받아 인증을 처리합니다.

핵심 구현은 다음과 같습니다.

```java
public class OAuth2LoginAuthenticationProvider
        implements AuthenticationProvider {

    private final OAuth2AuthorizationCodeAuthenticationProvider
            authorizationCodeAuthenticationProvider;

    private final OAuth2UserService<OAuth2UserRequest, OAuth2User> userService;

    @Override
    public Authentication authenticate(Authentication authentication) {

        OAuth2LoginAuthenticationToken loginToken =
                (OAuth2LoginAuthenticationToken) authentication;

        if (loginToken.getAuthorizationExchange()
                .getAuthorizationRequest()
                .getScopes().contains("openid")) {
            return null;
        }

        OAuth2AuthorizationCodeAuthenticationToken codeToken =
                (OAuth2AuthorizationCodeAuthenticationToken)
                        authorizationCodeAuthenticationProvider.authenticate(
                                new OAuth2AuthorizationCodeAuthenticationToken(
                                        loginToken.getClientRegistration(),
                                        loginToken.getAuthorizationExchange()
                                )
                        );

        OAuth2AccessToken accessToken = codeToken.getAccessToken();

        OAuth2User oauth2User = userService.loadUser(
                new OAuth2UserRequest(
                        loginToken.getClientRegistration(),
                        accessToken,
                        codeToken.getAdditionalParameters()
                )
        );

        return new OAuth2LoginAuthenticationToken(
                loginToken.getClientRegistration(),
                loginToken.getAuthorizationExchange(),
                oauth2User,
                oauth2User.getAuthorities(),
                accessToken,
                codeToken.getRefreshToken()
        );
    }
}
```

1. `OAuth2LoginAuthenticationToken`: OAuth2LoginAuthenticationFilter에서 전달받은 ClientRegistration과 Authorization Request 및 Response를 포함합니다.
2. `OAuth2AuthorizationCodeAuthenticationProvider`: Authorization Code를 검증하고 Token Endpoint를 통해 Access Token으로 교환합니다.
3. `OAuth2UserService`: 발급받은 Access Token을 이용하여 Resource Server의 UserInfo Endpoint에서 사용자 정보를 조회합니다.
4. `OAuth2LoginAuthenticationToken`: 조회한 사용자 정보와 Access Token, Refresh Token을 포함한 인증 결과를 반환합니다.

---

# OAuth2AuthorizationCodeAuthenticationProvider

OAuth2AuthorizationCodeAuthenticationProvider는 `Authorization Code를 Access Token으로 교환`하는 역할을 담당합니다.
OAuth2LoginAuthenticationProvider는 내부적으로 이 Provider를 호출하여 토큰 교환을 위임합니다.

핵심 구현은 다음과 같습니다.

```java
public class OAuth2AuthorizationCodeAuthenticationProvider
        implements AuthenticationProvider {

    private final OAuth2AccessTokenResponseClient<OAuth2AuthorizationCodeGrantRequest>
            accessTokenResponseClient;

    @Override
    public Authentication authenticate(Authentication authentication) {

        OAuth2AuthorizationCodeAuthenticationToken token =
                (OAuth2AuthorizationCodeAuthenticationToken) authentication;

        OAuth2AuthorizationExchange exchange = token.getAuthorizationExchange();

        if (!Objects.equals(
                exchange.getAuthorizationRequest().getState(),
                exchange.getAuthorizationResponse().getState())) {
            throw new OAuth2AuthorizationException(
                    new OAuth2Error("invalid_state_parameter")
            );
        }

        OAuth2AccessTokenResponse response =
                accessTokenResponseClient.getTokenResponse(
                        new OAuth2AuthorizationCodeGrantRequest(
                                token.getClientRegistration(), exchange
                        )
                );

        return new OAuth2AuthorizationCodeAuthenticationToken(
                token.getClientRegistration(),
                exchange,
                response.getAccessToken(),
                response.getRefreshToken(),
                response.getAdditionalParameters()
        );
    }
}
```

- `state 검증`: 최초 Authorization Request와 Callback Response의 state가 일치하는지 확인합니다.
- `OAuth2AccessTokenResponseClient`: Token Endpoint에 Authorization Code를 전달하고 Access Token을 발급받습니다.
- `OAuth2AuthorizationCodeGrantRequest`: ClientRegistration과 AuthorizationExchange를 묶어 토큰 요청에 필요한 정보를 제공합니다.

실제 HTTP 요청에서는 ClientRegistration의 Token URI와 Client 인증 설정을 사용합니다.
Confidential Client가 client_secret_basic 방식을 사용한다면 `Client ID와 Client Secret`을 이용해 인증합니다.
Authorization Code의 유효 기간, 재사용 여부, Client와 Redirect URI의 일치 여부 및 PKCE의 유효성은 Authorization Server가 Token Endpoint에서 최종 검증합니다.

---

# DefaultOAuth2UserService

DefaultOAuth2UserService는 Access Token을 이용하여 Resource Server의 UserInfo Endpoint에서 사용자 정보를 조회하고, OAuth2User 객체로 변환하는 구현체입니다.
OAuth2LoginAuthenticationProvider는 Authorization Code를 Access Token으로 교환한 뒤, DefaultOAuth2UserService의 `loadUser()`를 호출하여 사용자 정보를 조회합니다.

핵심 구현은 다음과 같습니다.

```java
public class DefaultOAuth2UserService
        implements OAuth2UserService<OAuth2UserRequest, OAuth2User> {

    private RestOperations restOperations;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) {
        String userNameAttributeName = this.getUserNameAttributeName(userRequest);
        RequestEntity<?> request = (RequestEntity) this.requestEntityConverter.convert(userRequest);
        ResponseEntity<Map<String, Object>> response = this.getResponse(userRequest, request);

        Map<String, Object> attributes = response.getBody();

        return new DefaultOAuth2User(authorities, attributes, userNameAttributeName);
    }

    private ResponseEntity<Map<String, Object>> getResponse(
            OAuth2UserRequest userRequest, RequestEntity<?> request) {
        return this.restOperations.exchange(request, PARAMETERIZED_RESPONSE_TYPE);
    }
}
```

위 코드는 사용자 정보 조회 과정을 이해하기 위한 축약 코드이며, `authorities`를 생성하는 로직과 일부 필드 및 예외 처리는 생략했습니다.

1. `getUserNameAttributeName()`: ClientRegistration에서 사용자 식별에 사용할 속성 이름을 가져옵니다.
2. `requestEntityConverter.convert()`: OAuth2UserRequest에 포함된 Access Token과 ClientRegistration 정보를 이용하여 UserInfo Endpoint에 전송할 HTTP 요청을 생성합니다.
3. `getResponse()`: 생성된 요청을 `restOperations.exchange()`로 전송하고, Resource Server에서 반환한 사용자 정보를 받습니다.
4. `response.getBody()`: 응답에 포함된 사용자 정보를 Map 형태로 가져옵니다.
5. `DefaultOAuth2User`: 사용자 정보와 권한, 사용자 식별 속성 이름을 이용하여 OAuth2User 객체를 생성합니다.

## UserInfo Endpoint 요청

`requestEntityConverter.convert()`는 ClientRegistration에 설정된 UserInfo Endpoint와 Access Token을 이용하여 HTTP 요청을 구성합니다.
예를 들어 UserInfo 요청은 다음과 같이 전달됩니다.

```http
GET /userinfo
Authorization: Bearer ACCESS_TOKEN
```

Resource Server는 Access Token을 검증하고 허용된 사용자 정보를 반환합니다.
DefaultOAuth2UserService는 반환된 정보를 DefaultOAuth2User로 변환하여 OAuth2LoginAuthenticationProvider에 전달합니다.

---

## OidcAuthorizationCodeAuthenticationProvider와의 차이

Spring Security는 일반 OAuth2 로그인과 OIDC 로그인을 서로 다른 AuthenticationProvider에서 처리합니다.
OAuth2LoginAuthenticationProvider는 Authorization Request의 Scope에 `openid`가 포함되어 있으면 `null`을 반환하여 인증 처리를 다른 Provider에 맡깁니다.

- `OAuth2LoginAuthenticationProvider`: 일반 OAuth2 로그인에서 Access Token을 발급받고 OAuth2UserService를 통해 사용자 정보를 조회합니다.
- `OidcAuthorizationCodeAuthenticationProvider`: OIDC 로그인에서 Access Token과 ID Token을 처리하고, ID Token을 검증하여 OidcUser를 생성합니다. 필요에 따라 UserInfo Endpoint의 정보도 활용합니다.

예를 들어 `application.yml`의 Google Scope에 `openid`, `profile`, `email`이 포함되어 있다면 OidcAuthorizationCodeAuthenticationProvider가 인증을 처리합니다.
따라서 앞서 설정한 Google 로그인은 일반 OAuth2LoginAuthenticationProvider가 아니라 OIDC Provider의 인증 경로를 따릅니다.
