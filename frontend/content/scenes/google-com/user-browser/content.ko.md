# 한눈에 보기

사용자가 Browser에 `google.com`을 입력하면 Browser가 접속에 필요한 Network 통신을 시작합니다.

이 Scene은 사용자와 Browser를 하나의 시작 Topic으로 묶고, 안전한 Web 통신인 HTTPS와 그 통신을 역할별로 이해하기 위한 OSI 7계층으로 이어집니다.

---

# 이 흐름을 보는 이유

```text
사용자 / 브라우저 → HTTPS → OSI 7계층
```

- `사용자 / 브라우저`: 주소를 입력하고 Web 접속을 시작합니다.
- `HTTPS`: HTTP Data를 TLS로 보호해 Server와 주고받습니다.
- `OSI 7계층`: HTTPS 통신에 참여하는 HTTP, TLS, TCP·UDP, IP와 아래 계층의 역할을 나누어 봅니다.

`HTTPS → OSI 7계층`은 실제 Packet이 다음 장비로 이동한다는 뜻이 아닙니다. HTTPS 통신을 계층별로 풀어서 이해하는 학습 흐름입니다.

---

# 개발자가 개입하는 지점

Web 개발자는 URL, HTTP 요청과 응답, TLS 인증서와 Network 오류를 자주 다룹니다. OSI 7계층을 직접 구현하지는 않지만 문제가 HTTP, Transport, IP 또는 물리 연결 중 어디에서 발생했는지 구분하는 기준으로 활용할 수 있습니다.

---

# 참고 자료

- [RFC 9110 — HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110.html)
- [RFC 8446 — TLS 1.3](https://www.rfc-editor.org/rfc/rfc8446.html)
- [ISO/IEC 7498-1 — OSI Basic Reference Model](https://www.iso.org/standard/20269.html)
