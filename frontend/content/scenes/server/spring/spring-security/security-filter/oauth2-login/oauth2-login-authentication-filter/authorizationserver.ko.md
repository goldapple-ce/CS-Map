# 개요

Authorization Code를 검증하고 Access Token을 발급하는 OAuth 2.0 Authorization Server입니다. 이 Scene은 콜백 이후의 Token Endpoint 통신에 초점을 둡니다.

---

# Token Endpoint 요청

Client 측 `OAuth2AccessTokenResponseClient`는 보통 다음 값을 Token Endpoint에 전송합니다.

- `grant_type=authorization_code`
- 콜백으로 받은 `code`
- 로그인 시작 때 사용한 `redirect_uri`
- Client ID와 Client 인증 정보
- PKCE를 사용했다면 `code_verifier`

Authorization Server는 Code가 유효하고 아직 사용되지 않았는지, Client와 redirect URI가 원래 요청과 일치하는지 등을 확인합니다. 성공하면 Access Token과 선택적 Refresh Token 및 추가 파라미터를 반환합니다.

브라우저가 이 교환을 수행하는 것이 아니라 일반적인 서버 애플리케이션에서는 내 서버와 Authorization Server 사이의 직접 요청으로 진행됩니다.

---

# 참고 자료

- [RFC 6749 - Access Token Request](https://www.rfc-editor.org/rfc/rfc6749#section-4.1.3)
