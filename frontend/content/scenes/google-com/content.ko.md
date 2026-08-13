# 한눈에 보기

사용자가 Browser 주소창에 `google.com`을 입력하면 어떤 일이 발생하는지 보여줍니다.

가운데 줄은 요청이 실제 Network를 따라 이동하는 흐름이고, 위쪽 줄은 Server와 통신할 때 사용하는 Protocol을 보여줍니다.

```text
이름 확인: Browser → 사용자 기기 → Router → DNS
Server 통신: Browser → HTTPS → OSI 7계층 → Router → Server
```

---

# 기본 개념

- `Protocol`: 서로 통신할 때 지켜야 하는 약속입니다. 어떤 형식으로 Data를 보내고, 받은 쪽이 어떻게 해석할지를 정합니다. HTTP, HTTPS와 DNS가 대표적인 예입니다.
- `Cache`: 이전에 얻은 결과를 다시 사용하기 위해 저장해 두는 임시공간입니다. 같은 작업을 반복하지 않아도 되므로 응답이 빨라지고 불필요한 요청을 줄일 수 있습니다.
- `IP 주소`: Network에서 목적지를 찾기 위한 주소입니다. 집 주소처럼 이 주소를 알아야 요청을 Server로 보낼 수 있습니다.
- `Domain Name`: `google.com`처럼 사람이 읽기 쉬운 이름입니다. 실제 통신에는 IP 주소가 필요하므로 DNS를 통해 IP 주소를 찾습니다.

---

# 구성 요소

- `Browser`: URL 입력을 받고 요청을 시작합니다. IP 주소가 Cache되어 있으면 DNS 조회를 생략할 수 있습니다.
- `사용자 기기`: Browser가 실행되는 Computer나 Smartphone입니다. 운영체제도 DNS 응답을 Cache할 수 있습니다.
- `Router`: Packet을 다음 Network로 전달합니다. 가정용 공유기도 Router 기능을 포함합니다.
- `DNS`: `Domain Name System`의 약자로, Domain Name에 대응하는 IP 주소를 찾아 Browser 쪽으로 반환합니다.
- `Server`: 요청을 받아 처리하고 응답합니다.
- `HTTPS`: HTTP Data를 암호화하고 Server를 인증하는 통신 방식입니다.
- `OSI 7계층`: Network Protocol의 역할을 일곱 계층으로 나누어 이해하는 개념입니다.

---

# 동작 과정

1. 사용자가 Browser에 `google.com`을 입력합니다.
2. Browser와 운영체제가 Cache된 IP 주소를 확인합니다.
3. 없으면 Router를 통해 DNS에 질의하고 IP 주소를 받습니다.
4. Browser가 해당 IP 주소로 Server 통신을 시작합니다.
5. HTTP Data를 HTTPS로 보호해 Router를 거쳐 Server로 보냅니다.

DNS Query와 Server 요청 모두 실제로는 Router를 거칩니다. 그림에서는 이해하기 쉽도록 Internet 안의 여러 Router와 반환 경로를 생략했습니다.

---

# 참고 자료

- [RFC 1034 — Domain Names, Concepts and Facilities](https://www.rfc-editor.org/rfc/rfc1034.html)
- [RFC 1035 — Domain Names, Implementation and Specification](https://www.rfc-editor.org/rfc/rfc1035.html)
- [RFC 8484 — DNS Queries over HTTPS](https://www.rfc-editor.org/rfc/rfc8484.html)
- [RFC 8446 — TLS 1.3](https://www.rfc-editor.org/rfc/rfc8446.html)
- [RFC 9110 — HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110.html)
