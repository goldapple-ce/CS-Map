# 개요

Spring Security의 OAuth 2.0 로그인은 Authorization Code Grant를 사용합니다. 이 흐름은 한 번의 요청 안에서 끝나지 않고, 사용자의 브라우저가 내 서버와 외부 Provider를 왕복하면서 진행됩니다.

`OAuth2AuthorizationRequestRedirectFilter`는 로그인을 시작하고, `OAuth2LoginAuthenticationFilter`는 인증 서버가 돌려보낸 콜백을 처리합니다. 두 필터는 서로 다른 요청에서 같은 로그인 흐름의 앞뒤를 담당합니다.

이 Scene은 `openid` scope가 없는 순수 OAuth 2.0 Login 흐름을 설명합니다. OpenID Connect 로그인은 ID Token과 OIDC 전용 Provider·UserService가 추가되는 별도 흐름입니다.

---

# 전체 흐름

```text
1. 브라우저 → 애플리케이션
   GET /oauth2/authorization/google

2. OAuth2AuthorizationRequestRedirectFilter
   Authorization Request 생성·저장
   Authorization Endpoint URL을 담은 리다이렉트 응답 반환

3. 브라우저가 리다이렉트 응답을 따라 Authorization Server로 이동
   사용자 로그인과 동의

4. Google → 브라우저 → 애플리케이션
   GET /login/oauth2/code/google?code=...&state=...

5. OAuth2LoginAuthenticationFilter
   콜백 검증 및 AuthenticationManager에 인증 요청

6. OAuth2LoginAuthenticationProvider
   OAuth2AuthorizationCodeAuthenticationProvider에 Code 교환 위임

7. 애플리케이션 → Provider Token Endpoint
   authorization code를 token으로 교환

8. OAuth2UserService → Resource Server
   Access Token으로 사용자 정보 조회

9. 사용자 정보 확인 후 로그인 완료
   OAuth2AuthenticationToken과 OAuth2AuthorizedClient 저장
```

브라우저가 애플리케이션의 콜백 URL로 전달하는 핵심 값은 Access Token이 아니라 짧게 사용할 수 있는 `authorization code`입니다. 내 서버가 이 Code를 Authorization Server의 Token Endpoint로 보내 Access Token을 받고, 이를 Resource Server의 사용자 정보 Endpoint에 보내 `OAuth2User`를 구성합니다.

---

# 1단계: OAuth2AuthorizationRequestRedirectFilter

기본적으로 `/oauth2/authorization/{registrationId}` 형태의 요청에서 OAuth 2.0 로그인을 시작합니다. `{registrationId}`는 `google`, `github`처럼 등록된 Client를 식별하는 값입니다.

필터는 `ClientRegistration` 정보를 바탕으로 Authorization Request를 만듭니다. 리다이렉트 URI에는 보통 다음 정보가 쿼리 파라미터로 포함됩니다.

- `client_id`: 인증 서버에 등록된 애플리케이션 식별자
- `scope`: 애플리케이션이 요청하는 범위
- `response_type=code`: Authorization Code를 요청한다는 뜻
- `redirect_uri`: 인증 서버가 처리를 마친 뒤 돌아올 애플리케이션 주소
- `state`: 시작 요청과 콜백을 연결하고 요청 위조를 방어하기 위한 값

생성한 `OAuth2AuthorizationRequest`는 `AuthorizationRequestRepository`에 임시 저장합니다. 나중에 콜백이 도착했을 때 원래 요청과 비교하고 검증하기 위해서입니다. 그런 다음 Authorization Endpoint URL을 `Location` 헤더에 담은 HTTP 리다이렉트 응답을 브라우저에 반환합니다. 실제로 Authorization Server에 새 요청을 보내는 주체는 이 응답을 받은 브라우저입니다.

이 필터 이름의 `Authorization`은 애플리케이션 리소스에 대한 접근 허용 여부를 판단하는 `AuthorizationFilter`의 인가와 다릅니다. 여기서는 OAuth 2.0 Authorization Request를 만들어 외부 인증 서버로 보내는 단계를 뜻합니다.

---

# 인증 서버에서 일어나는 일

사용자는 인증 서버에서 로그인하고, 요청된 scope에 대한 동의 화면을 볼 수 있습니다. 이 과정은 외부 인증 서버가 담당하며 애플리케이션의 `SecurityFilterChain` 안에서 실행되지 않습니다.

사용자가 승인하면 인증 서버는 브라우저를 미리 등록된 `redirect_uri`로 돌려보내며 `code`와 `state`를 전달합니다. 거부하거나 오류가 발생한 경우에는 `error` 정보가 전달될 수 있습니다.

---

# 2단계: OAuth2LoginAuthenticationFilter

기본 콜백 경로는 `/login/oauth2/code/{registrationId}`입니다. `OAuth2LoginAuthenticationFilter`는 이 요청에서 `code`와 `state`가 담긴 Authorization Response를 읽습니다.

필터는 저장해 두었던 Authorization Request를 불러와 콜백과 연결합니다. 이 과정에서 요청이 시작될 때의 상태와 콜백의 상태가 맞지 않거나 필요한 값이 없다면 인증을 실패시킵니다.

검증할 수 있는 콜백이라면 `OAuth2LoginAuthenticationToken`을 만들어 `AuthenticationManager`에 전달합니다. 이후 인증 Provider가 다음 작업을 수행합니다.

1. Authorization Code를 인증 서버의 Token Endpoint로 보냅니다.
2. Access Token과 필요한 토큰 응답을 받습니다.
3. `OAuth2UserService`가 Access Token으로 Resource Server의 UserInfo Endpoint를 호출합니다.
4. 응답을 `OAuth2User`로 만들고 인증된 `OAuth2LoginAuthenticationToken`을 반환합니다.
5. 필터가 로그인 사용자를 나타내는 `OAuth2AuthenticationToken`을 만듭니다.

로그인이 성공하면 인증된 `OAuth2AuthenticationToken`은 `SecurityContext`에 들어가고, 설정된 `SecurityContextRepository`에 저장되어 다음 요청에서도 사용할 수 있습니다.

Access Token과 Client 등록 정보는 `OAuth2AuthorizedClient`로 연결되며 `OAuth2AuthorizedClientRepository` 또는 `OAuth2AuthorizedClientService`를 통해 관리됩니다. 이는 현재 로그인 사용자를 나타내는 `SecurityContext`와는 목적이 다릅니다.

---

# 두 필터의 차이

| 구분 | OAuth2AuthorizationRequestRedirectFilter | OAuth2LoginAuthenticationFilter |
| --- | --- | --- |
| 처리 시점 | 외부 로그인을 시작할 때 | 인증 서버에서 돌아온 콜백을 받을 때 |
| 기본 요청 | `/oauth2/authorization/{registrationId}` | `/login/oauth2/code/{registrationId}` |
| 주요 입력 | Client 등록 정보와 로그인 시작 요청 | `code`, `state` 또는 OAuth 2.0 오류 |
| 주요 결과 | 인증 서버로 리다이렉트 | 인증된 `OAuth2AuthenticationToken` |
| 직접 하는 일 | Authorization Request 생성·저장 | Authorization Response 처리와 인증 위임 |

---

# 자주 헷갈리는 점

- 리다이렉트 필터는 사용자를 인증하지 않습니다. 외부 인증을 시작할 요청을 만들 뿐입니다.
- 로그인 인증 필터가 Google 비밀번호를 받거나 검증하지 않습니다. 사용자의 자격 증명은 Google 같은 인증 서버가 처리합니다.
- Authorization Code는 Access Token이 아닙니다. 서버가 Token Endpoint에서 교환해야 합니다.
- `OAuth2AuthenticationToken`은 로그인한 사용자를 나타내고, `OAuth2AuthorizedClient`는 해당 사용자와 Client 등록 및 Access Token의 연결을 나타냅니다.
- OAuth 2.0 로그인 성공과 애플리케이션 리소스 접근 허용은 별개입니다. 로그인 뒤 실제 접근 가능 여부는 `AuthorizationFilter`와 `AuthorizationManager`가 판단합니다.

---

# 참고 자료

- [Spring Security - OAuth 2.0 Login](https://docs.spring.io/spring-security/reference/servlet/oauth2/login/)
- [Spring Security - Authorization Code Grant](https://docs.spring.io/spring-security/reference/servlet/oauth2/client/authorization-grants.html#oauth2Client-authorization-code-grant)
- [Spring Security - OAuth2AuthorizationRequestRedirectFilter API](https://docs.spring.io/spring-security/reference/api/java/org/springframework/security/oauth2/client/web/OAuth2AuthorizationRequestRedirectFilter.html)
- [Spring Security - OAuth2LoginAuthenticationFilter API](https://docs.spring.io/spring-security/reference/api/java/org/springframework/security/oauth2/client/web/OAuth2LoginAuthenticationFilter.html)
