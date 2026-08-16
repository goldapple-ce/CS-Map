# 한눈에 보기

Browser는 HTTPS Client로서 TLS Handshake를 시작하고 Server Certificate를 검증한 뒤 암호화된 HTTP Request와 Response를 주고받습니다.

Browser는 운영체제 또는 자체 신뢰 저장소의 Root CA를 기준으로 Certificate Chain을 검증하고, TLS Library를 이용해 Key 생성과 암복호화를 수행합니다.

---

# 개발자가 개입하는 지점

Web 개발자가 Browser의 TLS 구현을 직접 작성할 일은 거의 없습니다. Certificate 오류, Mixed Content, Secure Cookie, CORS와 HTTPS Redirect처럼 Browser에 표시되는 보안 동작을 확인할 수 있습니다.

---

# 참고 자료

- [RFC 8446 — TLS 1.3](https://www.rfc-editor.org/rfc/rfc8446.html)
