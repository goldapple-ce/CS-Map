# 한눈에 보기

Client는 접속하려는 Domain Name의 IP 주소를 Recursive Resolver에 요청하고 최종 응답을 받습니다.

이 Scene에서는 이해를 단순하게 유지하기 위해 Browser, 운영체제의 Stub Resolver와 DNS 전송 방식은 따로 나누지 않습니다.

```text
Client → Recursive Resolver: google.com의 IP 주소는?
Client ← Recursive Resolver: A / AAAA Record의 주소
```

Client가 Root, TLD와 Authoritative DNS에 직접 차례대로 질의하지 않습니다. 그 과정은 Recursive Resolver가 대신 처리합니다.

---

# 개발자가 개입하는 지점

일반적인 Application 개발자는 URL에 Domain Name을 사용하며 DNS 탐색 과정은 운영체제와 Network 설정에 맡깁니다.

연결 장애가 발생하면 Domain Name으로 받은 IP 주소가 올바른지와 사용 중인 Recursive Resolver가 정상적으로 응답하는지 확인할 수 있습니다.

---

# 참고 자료

- [RFC 1034 — Resolvers](https://www.rfc-editor.org/rfc/rfc1034.html)
- [RFC 8499 — DNS Terminology](https://www.rfc-editor.org/rfc/rfc8499.html)
