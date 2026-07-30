# 개요

사용자를 인증하고 Client에 대한 권한 제공 동의를 받은 뒤 Authorization Code와 Access Token을 발급하는 OAuth 2.0 서버입니다.

---

# 두 Endpoint

## Authorization Endpoint

브라우저의 요청을 받아 사용자를 로그인시키고 동의를 처리합니다. 성공하면 Authorization Code와 `state`를 담아 브라우저를 내 서버의 `redirect_uri`로 돌려보냅니다.

## Token Endpoint

내 서버가 Authorization Code와 Client 인증 정보를 보내는 서버 간 Endpoint입니다. Code, Client, redirect URI 등을 검증하고 Access Token을 반환합니다.

Authorization Server가 사용자를 인증하는 것은 권한 부여 결정을 위한 과정입니다. 순수 OAuth 2.0에서는 그 결과를 Client용 로그인 증명인 ID Token으로 제공하지 않으므로, Client는 Access Token으로 사용자 정보 Endpoint를 호출해 사용자를 식별합니다.

---

# 참고 자료

- [RFC 6749 - Authorization Code Grant](https://www.rfc-editor.org/rfc/rfc6749#section-4.1)
