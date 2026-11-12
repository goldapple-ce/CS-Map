# 한눈에 보기

Authorization Server는 Resource Owner의 인증과 권한 승인을 확인하고 `Authorization Code와 Access Token을 발급`하는 서버입니다.
Authorization Endpoint에서는 Authorization Code를 발급하고, Token Endpoint에서는 `Client와 Code의 유효성을 검증`하여 Access Token으로 교환합니다.

---

# Authorization Server란?

Authorization Server는 OAuth 2.0에서 Resource Owner를 인증하고, Client에 대한 권한 승인을 확인한 뒤 `Authorization Code와 Access Token을 발급`하는 서버입니다.
예를 들어 Google OAuth2를 사용하는 경우 Google의 인증 서버가 Authorization Server에 해당합니다.
Authorization Code Flow에서는 Authorization Endpoint와 Token Endpoint를 통해 권한 승인과 토큰 발급을 처리합니다.

---

# Authorization Endpoint

Authorization Endpoint는 Client가 요청한 접근 권한을 Resource Owner에게 승인받고, `Authorization Code를 발급`하는 Endpoint입니다.
Client가 Authorization Request를 전달하면 Authorization Server는 다음 과정을 수행합니다.

1. client_id, redirect_uri, response_type, scope 등의 `요청 정보를 검증`합니다.
2. Resource Owner를 인증하고 요청된 `접근 권한에 대한 동의`를 확인합니다.
3. 인증과 권한 승인이 완료되면 일회성 `Authorization Code를 생성`합니다.
4. 브라우저를 `Client의 Redirect URI로 리다이렉트`하여 Authorization Code를 전달합니다.

```http
HTTP/1.1 302 Found
Location: {redirect_uri}?code=...&state=...
```

이때 Authorization Code는 특정 Client와 `Redirect URI에 연결`되며, `짧은 유효 기간과 일회성 사용`을 전제로 합니다.
또한 Authorization Server는 요청받은 Redirect URI가 사전에 `등록된 URI와 일치하는지 검증`하여, 공격자가 임의의 주소로 Authorization Code를 전달받는 것을 방지합니다.

---

# Token Endpoint

Token Endpoint는 Client가 Authorization Code를 `Access Token으로 교환`하는 Endpoint입니다.
Client는 Authorization Server에 Authorization Code를 전달하며, Authorization Server는 해당 요청이 유효한지 확인한 뒤 Access Token을 발급합니다.

```http
POST /token
Authorization: Basic BASE64(client_id:client_secret)

grant_type=authorization_code&code=...&redirect_uri=...
```

- `grant_type`: Authorization Code를 이용한 토큰 발급 요청임을 나타냅니다.
- `code`: 앞서 발급받은 Authorization Code입니다.
- `redirect_uri`: Authorization Code 발급에 사용한 Redirect URI입니다.

위 요청은 Client Secret을 사용하는 서버 기반 Client의 예시입니다.
Authorization Server는 요청을 받으면 다음 항목을 검증합니다.

1. Client 인증: 등록된 Client가 요청한 것인지 확인합니다.
2. Authorization Code: 유효 기간이 지나지 않았고 이전에 사용되지 않았는지 확인합니다.
3. Client 및 Redirect URI: Authorization Code가 해당 Client와 Redirect URI에 발급된 것인지 확인합니다.

검증에 성공하면 Authorization Code를 재사용할 수 없도록 처리하고 Access Token을 발급합니다.
Authorization Server의 정책에 따라 Refresh Token도 함께 발급할 수 있습니다.

---

# client-secret은 왜 필요할까?

Authorization 요청에서 사용하는 `client_id`는 `Client를 구분하는 공개 식별자`이므로, 해당 값을 알고 있다는 사실만으로는 정당한 Client임을 증명할 수 없습니다.
따라서 `비밀키`를 안전하게 보관할 수 있는 Confidential Client는 `client-secret`을 이용하여 자신이 등록된 Client임을 증명합니다.

예를 들어 공격자가 Authorization Code를 탈취했더라도 Client Secret을 모른다면, Client 인증이 필요한 Token Endpoint에서 정상적으로 토큰을 발급받기 어렵습니다.
즉, client_id는 Client를 식별하고, client-secret은 Client를 인증하는 역할을 합니다.

다만 브라우저에서 실행되는 JavaScript 애플리케이션이나 모바일 앱처럼 비밀키를 안전하게 보관하기 어려운 Public Client는 Client Secret을 이용한 인증에 의존할 수 없습니다.
이러한 환경에서는 PKCE를 이용하여 Authorization Code의 악용을 방지합니다.
