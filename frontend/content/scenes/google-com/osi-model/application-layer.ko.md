# 한눈에 보기

Application Layer는 사용자가 이용하는 Network 기능과 가장 가까운 계층입니다. Application끼리 어떤 Message를 주고받고 그 의미를 어떻게 해석할지 정합니다.

이 계층은 Chrome이나 Spring 같은 Application 자체를 뜻하지 않습니다. Application이 통신할 때 사용하는 Protocol과 기능을 가리킵니다.

---

# HTTP

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

# 그 밖의 대표적인 Protocol

- `DNS`: Domain Name에 연결된 IP 주소와 DNS Record를 조회합니다.
- `SSH`: 원격 Terminal 접속, 명령 실행, 파일 전송과 Tunnel에 사용할 수 있는 보안 Protocol입니다.
- `SMTP`: Email을 전송합니다.

SSH는 암호화를 사용하지만 Protocol의 목적과 Message 형식까지 정의하므로 Presentation Layer가 아니라 Application Layer Protocol로 분류합니다.

---

# 개발자가 개입하는 지점

개발자는 HTTP Method, URL, Header, Status Code와 Body 형식을 설계하고 알맞은 Application Layer Protocol을 선택합니다. 이 Map의 Browser, DNS, NGINX와 Spring에서 가장 자주 마주치는 계층입니다.

---

# 참고 자료

- [RFC 9110 — HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110.html)
- [RFC 1034 — Domain Names, Concepts and Facilities](https://www.rfc-editor.org/rfc/rfc1034.html)
- [RFC 4251 — The Secure Shell Protocol Architecture](https://www.rfc-editor.org/rfc/rfc4251.html)
