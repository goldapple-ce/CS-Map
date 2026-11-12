# 한눈에 보기

ClientRegistrationRepository는 OAuth2 Client 설정을 `ClientRegistration 객체로 관리하고 조회`하는 인터페이스입니다.
Spring Boot는 `application.yml 설정을 기반`으로 ClientRegistration을 생성하며, 기본적으로 InMemoryClientRegistrationRepository에 보관합니다.
OAuth2AuthorizationRequestResolver와 OAuth2LoginAuthenticationFilter 등은 이 정보를 조회하여 Authorization 요청과 로그인 인증을 처리합니다.

---

# ClientRegistrationRepository이란?

ClientRegistrationRepository는 Spring Security에서 OAuth 2.0 `Client의 등록 정보를 관리하고 조회`하는 인터페이스입니다.
OAuth2 로그인에 필요한 Client ID, Client Secret, Redirect URI, Scope, Authorization Endpoint 등의 설정을 `ClientRegistration 객체로 관리`하며, `registrationId`를 이용하여 해당 Client 정보를 조회할 수 있습니다.

---

# ClientRegistration이란?

ClientRegistration은 Authorization Server에 등록된 OAuth2 `Client의 설정 정보`를 표현하는 객체입니다.
Spring Boot는 `application.yml`에 작성된 OAuth2 Client 설정을 기반으로 ClientRegistration 객체를 생성합니다.

주요 필드는 다음과 같습니다.

```java
public final class ClientRegistration {
    private String registrationId;
    private String clientId;
    private String clientSecret;
    private ClientAuthenticationMethod clientAuthenticationMethod;
    private AuthorizationGrantType authorizationGrantType;
    private String redirectUri;
    private Set<String> scopes;
    private ProviderDetails providerDetails;

    public class ProviderDetails {
        private String authorizationUri;
        private String tokenUri;
        private String userInfoEndpoint;
        private String jwkSetUri;
        private String issuerUri;
    }
}
```

위 코드는 주요 설정을 이해하기 위한 축약 형태입니다. 실제 구현에서는 ProviderDetails 내부에 별도 객체와 추가 필드가 존재합니다.

- `registrationId`: Spring Security 내부에서 Client 설정을 구분하는 식별자입니다.
- `clientId`: Authorization Server에 등록된 Client의 식별자입니다.
- `clientSecret`: Token Endpoint에서 Client 인증에 사용할 수 있는 비밀키입니다.
- `clientAuthenticationMethod`: Client 인증 방식입니다.
- `authorizationGrantType`: Authorization Code 등 권한 부여 방식입니다.
- `redirectUri`: Authorization Code를 전달받을 Callback 주소입니다.
- `scopes`: Client가 요청하는 접근 권한입니다.
- `providerDetails`: Authorization URI, Token URI 등 Authorization Server의 정보를 포함합니다.

---

# application.yml 설정

Spring Boot는 `application.yml`의 `spring.security.oauth2.client` 설정을 이용하여 ClientRegistration 객체를 생성하고, ClientRegistrationRepository에 등록합니다.
예를 들어 Google OAuth2 로그인을 사용하려면 다음과 같이 설정할 수 있습니다.

```yaml
spring:
  security:
    oauth2:
      client:
        registration:
          google:
            client-id: ${GOOGLE_CLIENT_ID}
            client-secret: ${GOOGLE_CLIENT_SECRET}
            authorization-grant-type: authorization_code
            redirect-uri: "{baseUrl}/login/oauth2/code/{registrationId}"
            scope:
              - openid
              - profile
              - email
```

---

# ClientRegistrationRepository의 동작

ClientRegistrationRepository는 다음과 같은 인터페이스로 정의되어 있습니다.

```java
public interface ClientRegistrationRepository {
    ClientRegistration findByRegistrationId(String registrationId);
}
```

`findByRegistrationId()`는 등록된 Client 정보를 조회하는 메서드이며, 해당하는 Client가 없다면 `null`을 반환합니다.

Spring Boot에서는 기본적으로 InMemoryClientRegistrationRepository 구현체를 사용하여 설정 정보를 메모리에서 관리합니다.
애플리케이션 실행 시 `application.yml`의 OAuth2 Client 설정을 ClientRegistration 객체로 변환하고, 이를 ClientRegistrationRepository에 등록합니다.
