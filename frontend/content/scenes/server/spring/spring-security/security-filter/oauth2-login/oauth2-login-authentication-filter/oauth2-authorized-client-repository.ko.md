# 한눈에 보기

OAuth2AuthorizedClientRepository는 OAuth2 인증으로 발급받은 `Access Token과 Refresh Token`을 `OAuth2AuthorizedClient 객체로 관리`하는 인터페이스입니다.
OAuth2LoginAuthenticationFilter는 인증 성공 후 해당 Repository에 OAuth2AuthorizedClient를 저장합니다.
이후 Client는 저장된 Access Token을 이용하여 Resource Server에 접근할 수 있습니다.

---

# OAuth2AuthorizedClientRepository란?

OAuth2AuthorizedClientRepository는 Spring Security에서 OAuth2 인증이 완료된 Client의 `Access Token과 Refresh Token을 저장하고 조회`하는 인터페이스입니다.
Authorization Server에서 발급받은 토큰을 `OAuth2AuthorizedClient 객체로 관리`하며, 이후 Client가 Resource Server에 접근할 때 해당 `토큰을 재사용`할 수 있도록 합니다.

---

# OAuth2AuthorizedClient

OAuth2AuthorizedClient는 Resource Owner로부터 접근 권한을 위임받은 Client의 정보를 표현하는 객체입니다.
ClientRegistration과 인증된 사용자, Authorization Server에서 발급받은 Access Token 및 Refresh Token을 연결하여 관리합니다.

주요 필드는 다음과 같습니다.

```java
public class OAuth2AuthorizedClient {
    private ClientRegistration clientRegistration;
    private String principalName;
    private OAuth2AccessToken accessToken;
    private OAuth2RefreshToken refreshToken;
}
```

- `clientRegistration`: 권한을 위임받은 OAuth2 Client의 등록 정보입니다.
- `principalName`: 권한을 승인한 사용자의 식별자입니다.
- `accessToken`: Resource Server에 접근하기 위한 토큰입니다.
- `refreshToken`: Access Token 만료 시 새로운 토큰을 발급받는 데 사용할 수 있는 토큰입니다.

위 코드는 주요 필드만 남긴 축약 형태이며, Refresh Token은 발급되지 않을 수도 있습니다.

---

# OAuth2AuthorizedClientRepository의 동작

Spring Security는 일반적인 OAuth2 Login 구성에서 AuthenticatedPrincipalOAuth2AuthorizedClientRepository를 사용합니다.
이 구현체는 사용자의 인증 상태에 따라 OAuth2AuthorizedClient의 저장과 조회를 다른 컴포넌트에 위임합니다.

```java
public final class AuthenticatedPrincipalOAuth2AuthorizedClientRepository
        implements OAuth2AuthorizedClientRepository {

    private final OAuth2AuthorizedClientService authorizedClientService;

    private OAuth2AuthorizedClientRepository anonymousAuthorizedClientRepository =
            new HttpSessionOAuth2AuthorizedClientRepository();

    @Override
    public <T extends OAuth2AuthorizedClient> T loadAuthorizedClient(
            String clientRegistrationId,
            Authentication principal,
            HttpServletRequest request) {

        if (isPrincipalAuthenticated(principal)) {
            return authorizedClientService.loadAuthorizedClient(
                    clientRegistrationId, principal.getName());
        }

        return anonymousAuthorizedClientRepository.loadAuthorizedClient(
                clientRegistrationId, principal, request);
    }

    @Override
    public void saveAuthorizedClient(
            OAuth2AuthorizedClient authorizedClient,
            Authentication principal,
            HttpServletRequest request,
            HttpServletResponse response) {

        if (isPrincipalAuthenticated(principal)) {
            authorizedClientService.saveAuthorizedClient(
                    authorizedClient, principal);
        } else {
            anonymousAuthorizedClientRepository.saveAuthorizedClient(
                    authorizedClient, principal, request, response);
        }
    }
}
```

- `OAuth2AuthorizedClientService`: 인증된 사용자의 OAuth2AuthorizedClient 저장과 조회를 담당합니다.
- `HttpSessionOAuth2AuthorizedClientRepository`: 인증되지 않은 사용자의 OAuth2AuthorizedClient를 HTTP Session에 저장합니다.
- `loadAuthorizedClient()`: 사용자 인증 상태에 따라 저장된 OAuth2AuthorizedClient를 조회합니다.
- `saveAuthorizedClient()`: 사용자 인증 상태에 따라 OAuth2AuthorizedClient를 저장합니다.

---

# 인증 상태에 따라 저장 방식을 구분하는 이유

AuthenticatedPrincipalOAuth2AuthorizedClientRepository는 인증된 사용자와 익명 사용자의 OAuth2AuthorizedClient를 서로 다른 방식으로 관리합니다.
이는 OAuth2AuthorizedClient를 저장하고 다시 조회할 때 사용할 수 있는 사용자 식별 정보가 다르기 때문입니다.

## 인증된 사용자 — OAuth2AuthorizedClientService

인증된 사용자는 `Principal을 통해 사용자를 식별`할 수 있습니다.
따라서 OAuth2AuthorizedClientService는 `clientRegistrationId`와 `principalName`을 기준으로 OAuth2AuthorizedClient를 저장하고 조회합니다.
이 방식은 `HTTP Session에 의존하지 않으므로`, 이후 다른 요청에서도 동일한 사용자 식별자를 이용하여 저장된 토큰을 조회할 수 있습니다.

## 익명 사용자 — HttpSessionOAuth2AuthorizedClientRepository

익명 사용자는 인증된 Principal이 없으므로, `사용자 식별자를 기준으로 토큰을 관리하기 어렵습니다`.
특히 여러 익명 요청이 동일한 익명 Principal 이름을 사용할 수 있기 때문에, 이를 저장소의 식별자로 사용하면 서로 다른 사용자의 토큰이 충돌할 위험이 있습니다.
따라서 HttpSessionOAuth2AuthorizedClientRepository는 `HTTP Session을 이용`하여 각 브라우저 세션의 OAuth2AuthorizedClient를 구분하고 관리합니다.

즉, 인증된 사용자는 Principal을 기준으로, 익명 사용자는 HTTP Session을 기준으로 OAuth2AuthorizedClient를 구분하기 위해 저장 방식을 나누는 것입니다.

---

# OAuth2AuthorizedClientService

OAuth2AuthorizedClientService는 HTTP 요청에 의존하지 않고 ClientRegistrationId와 Principal 이름을 기준으로 OAuth2AuthorizedClient를 관리하는 인터페이스입니다.

대표적인 구현체는 다음과 같습니다.

- `InMemoryOAuth2AuthorizedClientService`: 애플리케이션 메모리에 저장합니다.
- `JdbcOAuth2AuthorizedClientService`: 데이터베이스에 저장합니다.

즉, AuthenticatedPrincipalOAuth2AuthorizedClientRepository는 사용자 인증 상태에 따라 저장 및 조회를 위임하고, OAuth2AuthorizedClientService는 인증된 사용자의 OAuth2AuthorizedClient를 실제 저장소에서 관리하는 역할을 수행합니다.

---

# 로그인했는데 익명 사용자일 수 있나요?

OAuth2AuthorizedClient가 존재한다고 해서 반드시 사용자가 로그인한 상태인 것은 아닙니다.
이는 `OAuth 2.0`이 사용자 `인증을 위한 프로토콜이 아니라`, Resource Owner가 Client에 리소스 접근 권한을 위임하기 위한 프로토콜이기 때문입니다.

예를 들어 사용자가 우리 서비스에 로그인하지 않은 상태에서 Google Calendar 접근 권한을 승인했다고 가정해 보겠습니다.
우리 서비스는 Google로부터 Access Token을 발급받아 Google Calendar API를 호출할 수 있지만, 이 사실만으로 사용자가 우리 서비스에 로그인한 것은 아닙니다.
따라서 Spring Security에서는 익명 사용자로 취급하면서도 OAuth2AuthorizedClient를 보유할 수 있습니다.

반면 OIDC를 이용한 OAuth2 Login에서는 Google의 인증 결과를 기반으로 Spring Security의 Authentication을 생성하므로, 로그인 성공 후에는 인증된 사용자로 처리됩니다.

즉, `OAuth2AuthorizedClient의 존재 여부와 우리 서비스의 로그인 여부는 별개의 개념`이며, 이 때문에 Spring Security는 인증된 사용자와 익명 사용자의 OAuth2AuthorizedClient를 서로 다른 방식으로 관리할 수 있습니다.
