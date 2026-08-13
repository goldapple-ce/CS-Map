# 한눈에 보기

사용자가 주소창에 `google.com`을 입력하면 Browser가 접속 처리를 시작합니다. DNS로 목적지 주소를 확인하고 Network를 통해 Server에 Packet을 전달하며, Browser와 Server 사이에는 HTTPS 보안 통신이 수립됩니다.

이 Scene은 실제 전달 경로와 종단 간 보안 통신, 통신을 해석하는 학습 모델을 구분해 보여줍니다.

> 이 지도는 공개적으로 확인된 인터넷 표준과 학습용 일반 웹 서비스 구조를 구분합니다. Google 내부 서버의 실제 배치나 비공개 구현을 단정하지 않습니다.

---

# 전체 구조

```text
                    HTTPS → OSI 7계층
                 ↗                    ↘
┌──── 사용자 기기 Area ────┐
│ Browser → 사용자 기기     │ → DNS → Router → Server
└───────────────────────────┘
```

- `Browser → 사용자 기기`: Browser와 OS가 사용자 기기 안에 Cache된 DNS 응답이 있는지 확인합니다.
- `사용자 기기 → DNS → Router → Server`: Cache Miss이면 DNS로 목적지 주소를 확인하고 Packet을 Server까지 전달합니다.
- `Browser → HTTPS → OSI 7계층 → Server`: HTTPS Data가 계층별 통신 처리를 거쳐 Server로 전달되는 학습 흐름입니다.

OSI 7계층은 실제로 Packet이 거쳐 가는 별도 장비가 아닙니다. `HTTPS → OSI 7계층 → Server`는 HTTPS 통신을 HTTP, TLS, TCP·UDP와 IP 등 계층별 역할로 풀어 본 뒤 Server 수신으로 이어지는 학습 흐름입니다. HTTPS Data도 실제로는 Router와 여러 Network를 통과합니다.

---

# 구성 요소

- `Browser`: 사용자의 입력을 받아 URL을 해석하고 DNS 조회, Network 연결과 HTTP 요청을 시작합니다.
- `사용자 기기`: Browser나 OS가 이전 DNS 응답을 Cache하고 있다면 외부 DNS Query 없이 IP 주소를 재사용할 수 있습니다.
- `DNS`: Domain Name에 대응하는 목적지 IP 주소를 확인합니다.
- `Router`: Packet의 목적지 주소를 보고 다음 Network 경로로 전달합니다.
- `Server`: 요청을 받아 처리하고 응답을 반환합니다.
- `HTTPS`: HTTP Data를 TLS로 보호해 Browser와 Server가 안전하게 통신하도록 합니다.
- `OSI 7계층`: HTTP, TLS, TCP·UDP, IP와 아래 계층의 역할을 나누어 이해하기 위한 참조 모델입니다.

---

# 필요한 이유

주소 하나에 접속하는 과정에도 이름 확인, 로컬 네트워크, 인터넷 라우팅, 보안 연결과 서버 처리가 함께 관여합니다. 전체 흐름을 먼저 보면 DNS, Router, TLS, Proxy, Application Server와 Database가 어느 맥락에서 연결되는지 이해할 수 있습니다.

# 동작 과정

1. 사용자가 브라우저 주소창에 `google.com`을 입력합니다.
2. Browser와 OS가 사용자 기기 안에 Cache된 DNS 응답이 있는지 확인합니다.
3. 유효한 Cache가 없으면 DNS를 이용해 목적지 주소를 확인합니다.
4. Packet이 기본 Gateway와 여러 Network 경로를 거쳐 목적지로 이동합니다.
5. 목적지 Server와 Transport 연결을 만들고 TLS Handshake로 Server를 인증하며 Session Key를 준비합니다.
6. Browser와 Server가 HTTPS로 암호화된 HTTP 요청과 응답을 주고받습니다.

화면의 연결선은 중요한 학습 관계를 단순화한 것입니다. 실제 DNS 질의도 Router와 Network를 사용하며 HTTPS Packet도 같은 Network 경로를 통과하므로 모든 Packet을 시간순으로 빠짐없이 그린 것은 아닙니다.

---

# 내부 구조

Browser, 사용자 기기와 Router는 설명을 바로 여는 말단 Topic입니다. HTTPS, OSI 7계층, DNS와 Server는 각 Topic의 내부 Scene으로 들어가 더 자세히 탐색할 수 있습니다.

---

# 실패 상황

- 주소가 잘못되었거나 DNS에서 이름을 확인하지 못할 수 있습니다.
- 로컬 네트워크, 기본 게이트웨이 또는 인터넷 경로에 문제가 생길 수 있습니다.
- 서버 인증서를 신뢰할 수 없거나 안전한 연결 협상에 실패할 수 있습니다.
- 목적지 서버에 연결할 수 없거나 서버가 요청을 처리하지 못할 수 있습니다.

---

# 개발자가 개입하는 지점

개발자는 URL과 HTTP 요청·응답을 작성하고 DNS, Network, TLS와 Server 설정을 구성하거나 관찰할 수 있습니다.

문제를 조사할 때는 주소 입력부터 Server 도달까지를 하나의 실패 지점으로 취급하지 않습니다. DNS 응답, 기본 Gateway, Routing 경로, TLS 연결과 Server 응답을 나누어 관찰해야 원인을 좁힐 수 있습니다.

---

# 참고 자료

- [RFC 1034 — Domain Names, Concepts and Facilities](https://www.rfc-editor.org/rfc/rfc1034.html)
- [RFC 8446 — The Transport Layer Security Protocol Version 1.3](https://www.rfc-editor.org/rfc/rfc8446.html)
- [ISO/IEC 7498-1 — OSI Basic Reference Model](https://www.iso.org/standard/20269.html)
