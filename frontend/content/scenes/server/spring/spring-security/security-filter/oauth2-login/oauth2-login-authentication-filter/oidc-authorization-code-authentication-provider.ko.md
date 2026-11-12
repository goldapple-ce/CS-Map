# 한눈에 보기

OidcAuthorizationCodeAuthenticationProvider는 OIDC Authorization Code Flow에서 `토큰 교환과 사용자 인증`을 수행하는 AuthenticationProvider입니다.
`ID Token`의 Signature와 Claims, `nonce를 검증`하고 `OidcUserService`를 통해 OidcUser를 생성합니다.
인증에 성공하면 OAuth2LoginAuthenticationToken을 반환하여 이후 OAuth2 로그인 성공 처리가 진행되도록 합니다.

---

# OidcAuthorizationCodeAuthenticationProvider란?

OidcAuthorizationCodeAuthenticationProvider는 Spring Security에서 OIDC Authorization Code Flow를 처리하는 AuthenticationProvider입니다.
`Authorization Code를 Access Token과 ID Token으로 교환`하고, ID Token을 검증한 뒤 OidcUser를 생성하여 `사용자 인증`을 완료합니다.
일반 OAuth2 로그인과 달리 Authorization Request의 Scope에 `openid`가 포함된 경우 해당 Provider가 인증을 처리합니다.

---

# OidcAuthorizationCodeAuthenticationProvider의 동작

OAuth2LoginAuthenticationFilter가 OAuth2LoginAuthenticationToken을 AuthenticationManager에 전달하면, OidcAuthorizationCodeAuthenticationProvider의 authenticate()가 호출됩니다.

핵심 구현은 다음과 같습니다.

```java
public class OidcAuthorizationCodeAuthenticationProvider implements AuthenticationProvider {

    private final OAuth2AccessTokenResponseClient<OAuth2AuthorizationCodeGrantRequest> accessTokenResponseClient;
    private final OAuth2UserService<OidcUserRequest, OidcUser> userService;
    private JwtDecoderFactory<ClientRegistration> jwtDecoderFactory = new OidcIdTokenDecoderFactory();

    @Override
    public Authentication authenticate(Authentication authentication) {
        OAuth2LoginAuthenticationToken authorizationCodeAuthentication = (OAuth2LoginAuthenticationToken) authentication;

        if (!authorizationCodeAuthentication.getAuthorizationExchange().getAuthorizationRequest().getScopes().contains("openid")) {
            return null;
        }

        OAuth2AccessTokenResponse accessTokenResponse = getResponse(authorizationCodeAuthentication);

        ClientRegistration clientRegistration = authorizationCodeAuthentication.getClientRegistration();
        OidcIdToken idToken = createOidcToken(clientRegistration, accessTokenResponse);

        validateNonce(authorizationRequest, idToken);

        OidcUser oidcUser = (OidcUser)this.userService.loadUser(new OidcUserRequest(clientRegistration, accessTokenResponse.getAccessToken(), idToken, additionalParameters));
        Collection<? extends GrantedAuthority> mappedAuthorities = this.authoritiesMapper.mapAuthorities(oidcUser.getAuthorities());

        return new OAuth2LoginAuthenticationToken(authorizationCodeAuthentication.getClientRegistration(), authorizationCodeAuthentication.getAuthorizationExchange(), oidcUser, mappedAuthorities, accessTokenResponse.getAccessToken(), accessTokenResponse.getRefreshToken());
    }

    private OAuth2AccessTokenResponse getResponse(OAuth2LoginAuthenticationToken authorizationCodeAuthentication) {
        return this.accessTokenResponseClient.getTokenResponse(new OAuth2AuthorizationCodeGrantRequest(authorizationCodeAuthentication.getClientRegistration(), authorizationCodeAuthentication.getAuthorizationExchange()));
    }
}
```

1. `openid 확인`: Authorization Request의 Scope에 openid가 포함되어 있는지 확인하고, 포함되지 않았다면 null을 반환합니다.
2. `getResponse()`: OAuth2AccessTokenResponseClient를 이용하여 Authorization Code를 Access Token과 ID Token으로 교환합니다.
3. `createOidcToken()`: Token 응답에서 ID Token을 추출하고 JwtDecoder를 통해 검증하여 OidcIdToken을 생성합니다.
4. `validateNonce()`: 최초 Authorization Request에 저장된 nonce와 ID Token의 nonce가 일치하는지 검증합니다.
5. `userService.loadUser()`: OidcUserService를 통해 검증된 ID Token을 기반으로 OidcUser를 생성합니다.
6. `OAuth2LoginAuthenticationToken`: 인증된 사용자와 토큰 정보를 포함한 결과를 반환합니다.

OAuth2LoginAuthenticationToken: 인증된 사용자 정보와 Access Token, Refresh Token을 포함한 인증 결과를 반환합니다.

---

# createOidcToken()

OIDC에서는 Authorization Server의 Token Endpoint가 Access Token과 함께 ID Token을 반환합니다.
OidcAuthorizationCodeAuthenticationProvider는 `createOidcToken()`을 통해 ID Token을 추출하고 검증합니다.

핵심 구현은 다음과 같습니다.

```java
private OidcIdToken createOidcToken( ClientRegistration clientRegistration, OAuth2AccessTokenResponse accessTokenResponse) {
    JwtDecoder jwtDecoder = this.jwtDecoderFactory.createDecoder(clientRegistration);
    Jwt jwt = this.getJwt(accessTokenResponse, jwtDecoder);
    return new OidcIdToken(jwt.getTokenValue(), jwt.getIssuedAt(), jwt.getExpiresAt(), jwt.getClaims());
}

private Jwt getJwt(OAuth2AccessTokenResponse accessTokenResponse, JwtDecoder jwtDecoder) {
    Map<String, Object> parameters = accessTokenResponse.getAdditionalParameters();
    return jwtDecoder.decode((String) parameters.get("id_token"));
}
```

1. `getAdditionalParameters()`: Token Response의 추가 정보에서 ID Token을 가져옵니다.
2. `jwtDecoderFactory.createDecoder()`: ClientRegistration에 해당하는 JwtDecoder를 생성합니다.
3. `jwtDecoder.decode()`: ID Token의 Signature와 Claims를 검증하고 Jwt 객체를 반환합니다.
4. `OidcIdToken`: 검증된 JWT를 OIDC에서 사용할 ID Token 객체로 변환합니다.

---

# ID Token의 Claims

ID Token은 JWT 형식으로 구성되며, Payload에는 사용자 식별 정보와 인증 결과를 검증하기 위한 Claims가 포함됩니다.

```json
{
  "iss": "https://accounts.google.com",
  "sub": "1234567890",
  "aud": "CLIENT_ID",
  "exp": 1794358800,
  "iat": 1794355200,
  "nonce": "NONCE_HASH"
}
```

- `iss` : ID Token을 발급한 `Authorization Server의 식별자`입니다.
  - Client는 `사전에 신뢰하도록 설정`한 Authorization Server의 issuer와 ID Token의 iss가 `일치`하는지 확인합니다.
- `sub` : Authorization Server가 인증한 `사용자의 식별자`입니다. Client는 해당 값을 이용하여 어떤 사용자가 인증되었는지 구분합니다.
  - 서로 다른 Authorization Server에서 동일한 `sub`가 존재할 수 있으므로, 사용자를 식별할 때는 `iss`와 `sub`를 함께 사용하는 것이 적절합니다.
- `aud` : ID Token이 어떤 `Client를 대상`으로 발급되었는지 나타냅니다. Client는 해당 값에 자신의 Client ID가 포함되어 있는지 확인해야 합니다.
  - 검증하면 다른 애플리케이션을 대상으로 발급된 ID Token을 우리 서비스의 인증에 사용하는 것을 방지할 수 있습니다.
- `exp` : ID Token의 `만료 시간`입니다.
  - ID Token의 Signature가 유효하더라도 무기한 사용하도록 허용한다면, 과거에 발급된 토큰을 탈취한 공격자가 오랫동안 재사용할 위험이 있습니다.
- `iat` : ID Token이 `발급된 시간`입니다.
  - Client가 최근에 발급된 ID Token만 허용하도록 정책을 구성했다면, iat를 이용하여 지나치게 오래전에 발급된 토큰을 거부할 수 있습니다.

## nonce — 현재 인증 요청에서 발급된 ID Token인가?

once는 ID Token이 현재 인증 요청에 대응하는지 확인하여, 이전에 발급된 인증 결과를 재사용하는 `Replay Attack을 방지`하기 위한 값입니다.
ID Token의 Signature, 다른 Claims 가 모두 유효하더라도 해당 토큰이 현재 로그인 요청에서 발급되었다는 사실까지 보장하지는 않습니다.

예를 들어 nonce를 검증하지 않는 상황에서 공격자가 자신의 Google 계정으로 Authorization Code를 발급받았다고 가정하겠습니다.

1. 공격자는 자신의 Google 계정으로 인증하여 유효한 `Authorization Code를 발급`받습니다.
2. 피해자가 우리 서비스에서 Google 로그인을 시도합니다.
3. 공격자는 피해자의 Callback 요청에 `자신의 Authorization Code가 사용되도록 주입`합니다.
4. Client가 해당 Code를 정상적으로 교환하면 공격자의 sub가 포함된 `ID Token을 전달`받습니다.
5. Client가 ID Token의 Signature와 Claims만 검증하면 정상적인 Google 인증 결과이므로 이를 수락할 수 있습니다.
6. 결과적으로 피해자는 `자신도 모르게 공격자의 계정으로 로그인`될 수 있습니다.

이때 sub는 공격자의 계정을 정확하게 식별하고 있습니다. 문제는 사용자 식별이 잘못된 것이 아니라, 피해자가 시작한 로그인 요청에 공격자의 인증 결과가 사용되었다는 점입니다.
이를 방지하기 위해 Client는 인증 요청마다 무작위 nonce를 생성하고 저장한 뒤 Authorization Server에 전달합니다.
Authorization Server는 전달받은 nonce를 ID Token에 포함하며, Client는 반환된 ID Token의 nonce가 최초 요청에서 생성한 값과 일치하는지 확인합니다.
따라서 공격자가 이전에 발급받은 Authorization Code나 ID Token을 다른 로그인 요청에 주입하더라도 `nonce가 일치하지 않으면 인증을 거부`합니다.

다만 위 공격은 공격자가 Callback에 Authorization Code를 주입할 수 있고, 다른 검증에서도 차단되지 않는다는 가정이 필요합니다. 정상적인 state 검증과 PKCE 역시 이러한 공격을 방어하는 수단입니다.

---

# OidcUserService

OidcUserService는 Spring Security에서 OIDC 인증이 완료된 사용자의 정보를 구성하여 OidcUser 객체로 반환하는 구현체입니다.
OidcAuthorizationCodeAuthenticationProvider가 ID Token을 검증한 뒤 OidcUserService의 `loadUser()`를 호출하며, 필요한 경우 UserInfo Endpoint에서 추가 사용자 정보를 조회합니다.
일반 OAuth2 로그인에서 사용하는 DefaultOAuth2UserService와 달리, 검증된 ID Token만으로도 사용자 정보를 구성할 수 있습니다.

---

## OidcUserService의 동작

OidcUserService는 OAuth2UserService 인터페이스를 구현하며, OidcUserRequest를 전달받아 OidcUser를 생성합니다.

핵심 구현은 다음과 같습니다.

```java

public class OidcUserService implements OAuth2UserService<OidcUserRequest, OidcUser> {
    private OAuth2UserService<OAuth2UserRequest, OAuth2User> oauth2UserService = new DefaultOAuth2UserService();
    private Predicate<OidcUserRequest> retrieveUserInfo = OidcUserRequestUtils::shouldRetrieveUserInfo;
    private Converter<OidcUserSource, OidcUser> oidcUserConverter =  OidcUserRequestUtils::getUser;

    public OidcUser loadUser(OidcUserRequest userRequest) throws OAuth2AuthenticationException {
        OidcUserInfo userInfo = null;
        if (this.retrieveUserInfo.test(userRequest)) {
            OAuth2User oauth2User = this.oauth2UserService.loadUser(userRequest);

            Map<String, Object> claims = this.getClaims(userRequest, oauth2User);
            userInfo = new OidcUserInfo(claims);

            if (!userInfo.getSubject().equals(userRequest.getIdToken().getSubject())) {
                throw new OAuth2AuthenticationException(oauth2Error, oauth2Error.toString());
            }
        }

        return (OidcUser)this.oidcUserMapper.apply(userRequest, userInfo);
    }
}
```

1. `retrieveUserInfo.test()`: UserInfo Endpoint를 호출할지 판단합니다.
2. `oauth2UserService.loadUser()`: 호출 조건을 만족하면 DefaultOAuth2UserService를 통해 사용자 정보를 조회합니다.
3. `getClaims()`: 응답받은 사용자 속성을 필요한 타입으로 변환합니다.
4. `OidcUserInfo`: 조회한 사용자 정보를 OIDC 객체로 구성합니다.
5. `getSubject()`: ID Token과 UserInfo의 사용자 식별자가 일치하는지 확인합니다.
6. `oidcUserConverter.convert()`: ID Token과 UserInfo를 기반으로 OidcUser를 생성합니다.

---

## UserInfo Endpoint는 언제 호출할까?

OidcUserService는 ID Token에 사용자 정보가 부족한지 직접 판단하는 것이 아니라, `retrieveUserInfo`에 설정된 조건을 기준으로 UserInfo Endpoint 호출 여부를 결정합니다.
Spring Security 7.x의 기본 조건은 다음과 같습니다.

1. ClientRegistration에 UserInfo Endpoint가 설정되어 있어야 합니다.
2. Authorization Grant Type이 `authorization_code`여야 합니다.

두 조건을 만족하면 DefaultOAuth2UserService를 통해 UserInfo Endpoint를 호출합니다.
Spring Security 6.x에서는 Access Token의 Scope가 `profile, email, address, phone` 중 하나를 포함하거나 비어 있어야 한다는 추가 조건도 적용됩니다.

UserInfo Endpoint를 호출하지 않더라도 이미 검증된 ID Token을 통해 사용자를 식별할 수 있으므로 OidcUser를 생성할 수 있습니다.
