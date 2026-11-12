# 한눈에 보기

OAuth2LoginAuthenticationFilter는 Authorization Server에서 반환한 `Callback 요청을 처리`하고 AuthenticationManager에 `인증을 위임`합니다.
인증 결과를 OAuth2AuthenticationToken으로 변환하고, 외부에서 발급받은 토큰을 `OAuth2AuthorizedClientRepository에 저장`합니다.
이후 AbstractAuthenticationProcessingFilter의 인증 성공 처리를 통해 AuthenticationSuccessHandler가 실행됩니다.

---

# OAuth2LoginAuthenticationFilter란

OAuth2LoginAuthenticationFilter는 Authorization Server에서 반환한 `Authorization Code를 처리`하고, AuthenticationManager에 `인증을 위임`하는 Filter입니다.
앞서 OAuth2AuthorizationRequestRedirectFilter가 사용자를 Authorization Server로 리다이렉트했다면, OAuth2LoginAuthenticationFilter는 인증과 권한 승인이 완료된 후 Callback 요청을 처리합니다.

---

# OAuth2LoginAuthenticationFilter의 동작

Authorization Server는 인증과 권한 승인이 완료되면 Client의 Redirect URI로 Authorization Code와 state를 전달합니다.
Spring Security는 기본적으로 `/login/oauth2/code/{registrationId}` 경로에서 Callback 요청을 처리합니다.

```http
GET /login/oauth2/code/google?code=...&state=...
```

핵심 구현은 다음과 같습니다.

```java
public class OAuth2LoginAuthenticationFilter extends AbstractAuthenticationProcessingFilter {

    private ClientRegistrationRepository clientRegistrationRepository;
    private OAuth2AuthorizedClientRepository authorizedClientRepository;
    private AuthorizationRequestRepository<OAuth2AuthorizationRequest> authorizationRequestRepository = new HttpSessionOAuth2AuthorizationRequestRepository();

    @Override
    public Authentication attemptAuthentication(HttpServletRequest request, HttpServletResponse response) {
        MultiValueMap<String, String> params = OAuth2AuthorizationResponseUtils.toMultiMap(request.getParameterMap());

        OAuth2AuthorizationRequest authorizationRequest = this.authorizationRequestRepository.removeAuthorizationRequest(request, response);
        String registrationId = authorizationRequest.getAttribute(OAuth2ParameterNames.REGISTRATION_ID);
        ClientRegistration clientRegistration = this.clientRegistrationRepository.findByRegistrationId(registrationId);

        String redirectUri = /* 현재 Callback URI */;

        OAuth2AuthorizationResponse authorizationResponse = OAuth2AuthorizationResponseUtils.convert(params, redirectUri);
        OAuth2LoginAuthenticationToken authenticationRequest = new OAuth2LoginAuthenticationToken(clientRegistration, new OAuth2AuthorizationExchange(authorizationRequest, authorizationResponse));
        OAuth2LoginAuthenticationToken authenticationResult = (OAuth2LoginAuthenticationToken) this.getAuthenticationManager().authenticate(authenticationRequest);
        OAuth2AuthenticationToken oauth2Authentication = this.authenticationResultConverter.convert(authenticationResult);
        OAuth2AuthorizedClient authorizedClient = new OAuth2AuthorizedClient(authenticationResult.getClientRegistration(), oauth2Authentication.getName(), authenticationResult.getAccessToken(), authenticationResult.getRefreshToken());

        this.authorizedClientRepository.saveAuthorizedClient(authorizedClient, oauth2Authentication, request, response);

        return oauth2Authentication;
    }
}
```

1. `AuthorizationRequestRepository`: 최초 Authorization 요청에서 저장했던 OAuth2AuthorizationRequest를 가져오고 제거합니다.
2. `ClientRegistrationRepository`: Authorization Request에 저장된 registrationId로 Client 설정을 조회합니다.
3. `OAuth2AuthorizationExchange`: 최초 Authorization Request와 Callback으로 반환된 Authorization Response를 묶습니다.
4. `OAuth2LoginAuthenticationToken`: 인증에 필요한 정보를 담아 AuthenticationManager에 전달합니다.
5. `AuthenticationManager`: OAuth2LoginAuthenticationProvider 또는 OidcAuthorizationCodeAuthenticationProvider에 인증을 위임합니다.
6. `OAuth2AuthenticationToken`: 인증된 Principal과 GrantedAuthority를 포함하는 Authentication 객체로 변환합니다.
7. `OAuth2AuthorizedClientRepository`: 인증 과정에서 발급받은 외부 Access Token과 Refresh Token을 저장합니다.

---

# OAuth2LoginAuthenticationToken과 OAuth2AuthenticationToken의 차이

OAuth2LoginAuthenticationToken은 Authorization Code를 이용한 인증 요청과 그 처리 결과를 표현하는 객체입니다.
반면 OAuth2AuthenticationToken은 인증이 완료된 사용자를 나타내는 Authentication 객체입니다.

따라서 OAuth2LoginAuthenticationFilter는 AuthenticationManager가 반환한 OAuth2LoginAuthenticationToken을 OAuth2AuthenticationToken으로 변환합니다.

이후 발급받은 토큰을 OAuth2AuthorizedClient로 구성하여 OAuth2AuthorizedClientRepository에 저장합니다.
여기서 저장하는 Access Token은 Google과 같은 외부 Authorization Server에서 발급한 토큰이며, 우리 서비스에서 자체 발급하는 JWT와는 별개입니다.
