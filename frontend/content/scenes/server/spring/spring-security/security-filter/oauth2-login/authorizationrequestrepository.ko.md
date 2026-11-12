# 한눈에 보기

AuthorizationRequestRepository는 OAuth 2.0 인증 과정에서 `Authorization Request를 저장`하고 `Callback 요청 시 조회`하는 인터페이스입니다.
Authorization Request에는 Client ID, Redirect URI, Scope, State 및 PKCE 관련 정보가 포함됩니다.
Spring Security는 기본적으로 `HttpSessionOAuth2AuthorizationRequestRepository`를 통해 HTTP Session에 요청 정보를 저장합니다.

---

# AuthorizationRequestRepository란?

AuthorizationRequestRepository는 OAuth 2.0 인증 과정에서 `Authorization Request를 저장하고 조회`하는 인터페이스입니다.
Authorization Code Flow에서는 Client가 Authorization Server로 사용자를 리다이렉트한 뒤, 인증이 완료되면 Callback 요청을 받습니다.
이때 최초 Authorization 요청과 Callback 요청은 `서로 다른 HTTP 요청`이므로, `두 요청을 연결하기 위해` Authorization Request를 저장해야 합니다.

---

# HttpSessionOAuth2AuthorizationRequestRepository란

HttpSessionOAuth2AuthorizationRequestRepository는 AuthorizationRequestRepository의 기본 구현체로,
OAuth2AuthorizationRequest를 `HttpSession에 저장하고 Callback 요청에서 조회`합니다.

핵심 구현은 다음과 같습니다.

```java
public final class HttpSessionOAuth2AuthorizationRequestRepository implements AuthorizationRequestRepository<OAuth2AuthorizationRequest> {

    public void saveAuthorizationRequest(OAuth2AuthorizationRequest authorizationRequest, HttpServletRequest request, HttpServletResponse response) {
        request.getSession().setAttribute(this.sessionAttributeName, authorizationRequest);
    }

    public OAuth2AuthorizationRequest loadAuthorizationRequest(HttpServletRequest request) {
        String stateParameter = this.getStateParameter(request);
        OAuth2AuthorizationRequest authorizationRequest = this.getAuthorizationRequest(request);

        return authorizationRequest != null
            && stateParameter.equals(authorizationRequest.getState())
            ? authorizationRequest : null;
    }

    public OAuth2AuthorizationRequest removeAuthorizationRequest(HttpServletRequest request, HttpServletResponse response) {
        OAuth2AuthorizationRequest authorizationRequest = this.loadAuthorizationRequest(request);

        if (authorizationRequest != null) {
            request.getSession().removeAttribute(this.sessionAttributeName);
        }

        return authorizationRequest;
    }

    private OAuth2AuthorizationRequest getAuthorizationRequest(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        return session != null ? (OAuth2AuthorizationRequest)session.getAttribute(this.sessionAttributeName) : null;
    }
}
```

위 코드는 주요 메서드만 남긴 축약 코드입니다. 입력값 검증과 일부 내부 구현은 생략했습니다.

1. `saveAuthorizationRequest()`: 현재 요청의 HttpSession에 Authorization Request를 저장합니다.
2. `loadAuthorizationRequest()`: Callback의 `state`와 저장된 Authorization Request의 `state`를 비교하여 일치하는 요청을 반환합니다.
3. `removeAuthorizationRequest()`: 일치하는 Authorization Request를 Session에서 제거하고 반환합니다.
4. `getAuthorizationRequest()`: 현재 요청에 연결된 HttpSession에서 저장된 Authorization Request를 조회합니다.

---

## Session에 여러 Authorization Request를 저장할 수 있을까?

기본 구현에서는 하나의 HttpSession에 OAuth2AuthorizationRequest 객체 하나만 저장합니다.
따라서 동일한 Session에서 여러 OAuth2 로그인 요청을 시작하면 마지막으로 저장한 요청이 기존 요청을 덮어쓸 수 있습니다.

이후 이전 로그인 요청의 Callback이 도착하면 저장된 `state`와 일치하지 않아 인증에 실패할 수 있습니다.
여러 인증 요청을 동시에 관리해야 한다면 `state`를 Key로 사용하는 Map 등의 별도 저장 방식을 구현할 수 있습니다.

---

## 서로 다른 HTTP 요청에서 동일한 HttpSession을 사용하는 방법

Authorization 요청과 Callback 요청은 서로 다른 HTTP 요청이지만, 브라우저가 동일한 Session ID를 전달하면 같은 HttpSession을 사용할 수 있습니다.

HttpSessionOAuth2AuthorizationRequestRepository가 `request.getSession()`을 호출하여 Session을 생성하면, Tomcat과 같은 Servlet Container는 응답의 `Set-Cookie` 헤더를 통해 Session ID를 브라우저에 전달합니다.

브라우저는 이를 쿠키에 저장하고, Authorization Server에서 돌아오는 Callback 요청에도 `JSESSIONID`를 포함하여 전송합니다.
따라서 서버는 동일한 HttpSession을 조회하여 이전에 저장한 Authorization Request를 가져올 수 있습니다.

---

# Authorization Request란?

Authorization Request는 Client가 Authorization Server에 `사용자의 인증 및 권한 승인을 요청하기 위해` 생성하는 요청 정보입니다.
Spring Security에서는 이를 OAuth2AuthorizationRequest 객체로 표현하며, Authorization Server로 전달할 URL과 관련 정보를 관리합니다.

대표적으로 다음과 같은 정보를 포함합니다.

```java
public final class OAuth2AuthorizationRequest implements Serializable {
    private String clientId;
    private String redirectUri;
    private Set<String> scopes;
    private String state;
    private Map<String, Object> additionalParameters;
    private String authorizationRequestUri;
    private Map<String, Object> attributes;
}
```

- `clientId`: Authorization Server에 등록된 Client의 식별자입니다.
- `redirectUri`: 인증과 권한 승인 이후 돌아올 URL입니다.
- `scopes`: Client가 요청하는 접근 권한의 범위입니다.
- `state`: 최초 Authorization 요청과 Callback 응답을 연결하고 CSRF 공격을 방어하기 위한 값입니다.
- `additionalParameters`: PKCE의 `code_challenge` 등 추가 요청 파라미터를 관리합니다.
- `authorizationRequestUri`: Authorization Server로 리다이렉트할 때 사용하는 최종 요청 URL입니다.
- `attributes`: PKCE의 `code_verifier` 등 Authorization 요청에 필요한 내부 정보를 보관할 수 있습니다.

여기서 중요한 점은 Authorization Request가 Authorization Server에 전달하는 HTTP 요청뿐 아니라, Callback 이후 검증에 필요한 정보도 포함한다는 것입니다.

---

# state는 왜 필요할까?

state는 Authorization 요청과 Callback 응답을 연결하여 `CSRF 공격을 방어`하기 위해 사용합니다.
만약 Client가 Callback으로 전달된 Authorization Code를 아무런 검증 없이 처리한다면, 공격자가 자신의 계정으로 발급받은 Authorization Code를 다른 사용자에게 전달하는 `Login CSRF 공격이 발생`할 수 있습니다.

예를 들어 다음과 같은 상황을 생각할 수 있습니다.
공격자가 자신의 Google 계정으로 OAuth2 로그인을 진행하고 Authorization Code를 획득합니다.
공격자는 해당 Code가 포함된 Callback URL을 피해자에게 전달합니다.
피해자가 해당 URL에 접근하면 Client는 공격자의 Authorization Code를 이용해 인증을 완료합니다.
결과적으로 피해자의 브라우저가 공격자의 계정으로 로그인될 수 있습니다.
이렇게 되면 피해자가 자신의 계정을 사용한다고 생각하고 입력한 정보가 공격자의 계정에 저장되는 등의 문제가 발생할 수 있습니다.

이를 방지하기 위해 Client는 Authorization 요청마다 예측하기 어려운 state를 생성하여 저장하고, Authorization Server에 함께 전달합니다.
Authorization Server는 인증이 완료되면 전달받았던 state를 Callback 응답에 포함합니다.
Client는 Callback으로 반환된 `state와 기존에 저장한 값을 비교`하여, 자신이 시작한 인증 요청에 대한 응답인지 검증합니다.

```
Authorization 요청
...?state=RANDOM_STATE

Callback 응답
...?code=AUTHORIZATION_CODE&state=RANDOM_STATE
```

두 값이 일치하지 않거나 저장된 요청이 존재하지 않는다면 인증을 거부해야 합니다.
이를 통해 공격자가 임의로 생성한 Authorization Code를 다른 사용자의 로그인 과정에 주입하는 공격을 방어할 수 있습니다.
다만 state만이 유일한 CSRF 방어 수단은 아니며, 올바르게 적용된 PKCE를 이용해 요청을 연결하는 방식도 있습니다.
