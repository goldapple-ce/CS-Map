# 한눈에 보기

HTTP는 Web Client와 Server가 요청과 응답을 주고받기 위한 Application Layer Protocol입니다.

Chrome이나 Spring 같은 Application 자체가 아니라, 두 Application이 Message를 어떤 형식과 의미로 주고받을지 정한 약속입니다.

---

# 요청과 응답

HTTP는 Web Client와 Server가 요청과 응답을 주고받기 위한 대표적인 Application Layer Protocol입니다.

```text
Client → HTTP Request → Server
Client ← HTTP Response ← Server
```

Request에는 Method, URL, Header와 선택적인 Body가 들어가고, Response에는 Status Code, Header와 선택적인 Body가 들어갑니다.

- `GET`: Resource 조회
- `POST`: 데이터 전달 또는 처리 요청
- `200`: 요청 처리 성공
- `404`: 요청한 Resource를 찾지 못함
- `500`: Server 내부 오류

HTTPS는 HTTP Message를 TLS로 보호하는 통신입니다. HTTP라는 Application Protocol이 없어지는 것이 아니라 HTTP와 TLS를 함께 사용하는 것입니다.

HTTP/1.1과 HTTP/2는 일반적으로 TCP 위에서 동작하고, HTTP/3는 UDP 위에 구현된 QUIC을 사용합니다.

---

# 개발자가 개입하는 지점

개발자는 HTTP Method, URL, Header, Status Code와 Body 형식을 설계합니다. 이 Map에서는 Browser가 요청을 만들고, NGINX와 Spring이 요청을 받아 처리합니다.

---

# 참고 자료

- [RFC 9110 — HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110.html)
