# OAuth 2.0이란?

OAuth 2.0은 사용자의 `자격 증명`을 제3자 애플리케이션에 `직접 제공하지 않고`, 특정 `리소스에 대한 접근 권한을 위임`하기 위한 Authorization Protocol입니다.
사용자가 특정 리소스에 대한 접근을 승인하면 애플리케이션은 `Access Token`을 발급받고, 해당 토큰을 이용하여 허용된 범위 내에서 리소스에 접근할 수 있습니다.
따라서 OAuth 2.0의 핵심은 사용자 인증 자체가 아니라, 제3자 애플리케이션에 제한된 접근 권한을 위임하는 것입니다.

---

# OAuth 2.0의 역할 4가지

OAuth 2.0은 권한 위임 과정에 참여하는 주체를 네 가지 역할로 구분합니다.

1. `Resource Owner`: 보호된 리소스에 대한 접근 권한을 부여할 수 있는 주체입니다. 일반적으로 `사용자`에 해당합니다.
2. `Client`: Resource Owner의 승인을 받아 보호된 리소스에 접근하려는 애플리케이션입니다. 예시에서는 `자사 서비스`에 해당합니다.
3. `Authorization Server`: Resource Owner를 인증하고 권한 승인을 확인한 뒤 Client에 Access Token을 발급하는 서버입니다. 예시에서는 `Google 인증 서버`에 해당합니다.
4. `Resource Server`: 보호된 리소스를 보유하고 있으며, Access Token을 확인하여 허용된 리소스를 제공하는 서버입니다. 예시에서는 `Google Calendar API`에 해당합니다.

여기서 Authorization Server와 Resource Server는 논리적으로 구분된 역할이며, 반드시 서로 다른 서버로 구성되어야 하는 것은 아닙니다.

---

# Authorization Code Flow

OAuth 2.0에서는 Client가 Resource Owner의 자격 증명을 직접 전달받지 않고, Authorization Server를 통해 리소스 접근 권한을 위임받습니다.
대표적인 Authorization Code Flow는 Authorization Server가 Access Token을 직접 전달하는 대신, Authorization Code를 먼저 발급하고 Client가 이를 Access Token으로 교환하는 방식입니다.

1. Resource Owner는 Client에게 `특정 리소스를 요청`합니다.
2. Client는 Resource Owner를 `Authorization Server로 리다이렉트`시켜 권한 승인을 요청합니다.
   - Redirect : {authorization_uri}?response_type=code&client_id=...&redirect_uri=...&scope=...&state=...
3. Resource Owner는 Authorization Server에서 인증하고 요청된 `접근 권한을 승인`합니다.
   - GET : {authorization_uri}?response_type=code&client_id=...&redirect_uri=...&scope=...&state=...
4. Authorization Server는 `Authorization Code를 발급`하고, 브라우저를 통해 Client의 Redirect URI로 전달합니다.
   - Redirect : {redirect_uri}?code=...&state=...
5. Client는 Authorization Code를 Authorization Server의 `Token Endpoint에 전달`합니다.
   - POST : {token_info_uri}
6. Authorization Server는 요청을 검증한 뒤 `Access Token을 발급`합니다.
7. Client는 Access Token을 이용하여 `Resource Server의 보호된 리소스에 접근`합니다.

## 주요 요청 파라미터

- `response_type`: Authorization Code Flow를 사용하기 위해 `code`로 설정합니다.
- `client_id`: Authorization Server에 등록된 Client의 식별자입니다.
- `redirect_uri`: 인증과 권한 승인 이후 브라우저가 돌아올 URL입니다.
- `scope`: Client가 요청하는 리소스 접근 권한의 범위입니다.
- `state`: Authorization 요청과 응답을 연결하고 CSRF 공격을 방어하기 위한 값입니다.
- `code`: Client가 Access Token으로 교환하기 위해 전달받는 Authorization Code입니다.

---

# OAuth 2.0 인증 구조

Spring Security에서는 OAuth 2.0 로그인 과정을 여러 Filter와 컴포넌트로 나누어 처리합니다.
각 컴포넌트는 Authorization 요청부터 Access Token 발급, 사용자 정보 조회, 인증 정보 등록까지의 역할을 담당합니다.

- `OAuth2AuthorizationRequestRedirectFilter`: OAuth2 로그인 요청을 처리하고, Authorization Server로 리다이렉트합니다.
- `AuthorizationRequestRepository`: Authorization 요청 정보를 저장하고, Callback 요청 시 이를 조회합니다.
- `OAuth2LoginAuthenticationFilter`: Authorization Server에서 반환한 Authorization Code를 전달받아 인증을 처리하고, 사용자 정보를 조회하는 인증 과정을 담당합니다.
- `SecurityContextHolder / SecurityContextRepository`: 인증에 성공한 Authentication을 SecurityContext에 등록하여 요청에서 사용할 수 있도록 관리합니다.

이러한 구조를 통해 Spring Security는 OAuth2 로그인 과정의 각 역할을 분리하고, 인증에 성공하면 AuthenticationSuccessHandler를 통해 JWT 발급과 같은 후속 작업을 수행할 수 있습니다.

---

# 왜 Authorization Code를 먼저 발급할까?

Authorization Code는 Client가 Access Token을 발급받기 위해 사용하는 일회성 코드입니다.
그렇다면 Authorization Server는 왜 Access Token을 바로 전달하지 않고 Authorization Code를 먼저 발급할까요?
Authorization 요청과 응답은 `브라우저의 리다이렉트를 통해 이루어지`므로, 이 과정에서 `Access Token을 직접 전달하면 토큰이 노출될 위험`이 있습니다.
Authorization Code Flow는 브라우저를 통해 전달하는 값을 Authorization Code로 제한하고, Access Token은 별도의 Token Endpoint에서 교환하도록 분리합니다.
또한 Authorization Code는 짧은 유효 기간과 일회성 사용을 전제로 하며, 발급받은 Client 및 Redirect URI와 연결되어 검증됩니다.
따라서 Authorization Code를 획득했다고 해서 누구나 Access Token을 발급받을 수 있는 것은 아닙니다.
