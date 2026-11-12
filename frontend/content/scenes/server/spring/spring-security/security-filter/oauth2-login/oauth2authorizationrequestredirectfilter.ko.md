# 한눈에 보기

OAuth2AuthorizationRequestRedirectFilter는 OAuth 2.0의 Authorization Code Flow를 시작하는 Filter입니다.
OAuth2AuthorizationRequestResolver를 통해 `Authorization Request를 생성`하고, AuthorizationRequestRepository에 저장합니다.
이후 `Authorization Server로 브라우저를 리다이렉트`하여 사용자 인증과 권한 승인 과정을 시작합니다.

---

# OAuth2AuthorizationRequestRedirectFilter란?

OAuth2AuthorizationRequestRedirectFilter는 OAuth 2.0의 Authorization Code Flow를 시작하는 Filter입니다.
사용자가 OAuth2 로그인을 요청하면 `Authorization Request를 생성`하고, 이를 저장한 뒤 브라우저를 `Authorization Server로 리다이렉트`합니다.
Spring Security에서는 기본적으로 `/oauth2/authorization/{registrationId}` 경로를 통해 OAuth2 로그인을 시작합니다.

---

# Authorization 요청 처리

예를 들어 사용자가 Google 로그인을 요청하면 다음 URL로 접근합니다.

```http
GET /oauth2/authorization/google
```

OAuth2AuthorizationRequestRedirectFilter는 OncePerRequestFilter를 상속하며, `doFilterInternal()`에서 Authorization 요청을 처리합니다.

```java
public class OAuth2AuthorizationRequestRedirectFilter extends OncePerRequestFilter {
    private OAuth2AuthorizationRequestResolver authorizationRequestResolver;
    private AuthorizationRequestRepository<OAuth2AuthorizationRequest>
            authorizationRequestRepository = new HttpSessionOAuth2AuthorizationRequestRepository();
    private RedirectStrategy authorizationRedirectStrategy = new DefaultRedirectStrategy();

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        OAuth2AuthorizationRequest authorizationRequest = this.authorizationRequestResolver.resolve(request);

        this.sendRedirectForAuthorization(request, response, authorizationRequest);
    }

    private void sendRedirectForAuthorization(
            HttpServletRequest request,
            HttpServletResponse response,
            OAuth2AuthorizationRequest authorizationRequest
    ) throws IOException {

        this.authorizationRequestRepository.saveAuthorizationRequest(
            authorizationRequest, request, response);

        this.authorizationRedirectStrategy.sendRedirect(
                request, response, authorizationRequest.getAuthorizationRequestUri());
    }
}
```

- `authorizationRequestResolver.resolve()`: 요청 URL의 registrationId를 확인하고, Client 설정을 이용해 OAuth2AuthorizationRequest를 생성합니다.
- `sendRedirectForAuthorization()`: 생성된 Authorization Request를 저장하고 Authorization Server로 리다이렉트하는 메서드입니다.
- `authorizationRequestRepository.saveAuthorizationRequest()`: Callback 요청에서 사용할 Authorization Request를 저장합니다.
- `authorizationRedirectStrategy.sendRedirect()`: `authorizationRequestUri`를 이용해 브라우저를 Authorization Server로 이동시킵니다.
- `filterChain.doFilter()`: OAuth2 Authorization 요청이 아니라면 다음 Filter로 요청을 전달합니다.
