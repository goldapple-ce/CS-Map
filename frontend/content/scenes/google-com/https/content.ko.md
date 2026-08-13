# 한눈에 보기

HTTPS는 Browser와 Server가 Network 연결을 준비하고 TLS로 안전한 통신 Channel을 만든 뒤 HTTP Request와 Response를 암호화해 주고받는 통신입니다.

이 Scene에는 실제 통신에 참여하거나 신뢰 기준을 제공하는 `Browser`, `Server`, `CA`만 Topic으로 둡니다. TCP와 TLS에서 실제로 오가는 Message는 Edge로 표현하고, 양쪽 내부에서 이루어지는 공유 비밀·Session Key 계산과 암복호화는 아래 설명에서 다룹니다.

---

# 연결 전 준비

Server는 접속을 받기 전에 Public Key와 Private Key를 만들고, CA로부터 Public Key와 Domain 정보가 포함된 Certificate를 발급받습니다.

CA는 Certificate에 전자서명합니다. Browser는 미리 신뢰하는 Root CA 정보를 가지고 있어, 접속할 때 CA Server를 매번 호출하지 않고도 Server가 보낸 Certificate Chain을 검증할 수 있습니다.

---

# 1~2. TCP Handshake

HTTP/1.1이나 HTTP/2를 사용하는 일반적인 HTTPS 연결에서는 TLS Handshake 전에 Browser와 Server가 TCP 연결을 수립합니다.

실제로는 `SYN → SYN-ACK → ACK`로 이루어진 3-Way Handshake이지만 Scene에서는 TCP Topic의 세부 내용을 반복하지 않고 Browser와 Server의 왕복 Edge로만 단순화합니다.

HTTP 자체에 이런 연결 Handshake가 있는 것은 아닙니다. TCP 연결이 준비된 뒤 그 위에서 TLS Handshake를 시작합니다.

HTTP/3는 TCP 대신 UDP 위의 QUIC을 사용하므로 이 TCP Handshake 흐름에 해당하지 않습니다. 현재 Scene은 HTTP/1.1과 HTTP/2의 일반적인 HTTPS 연결을 기준으로 합니다.

---

# 3. ClientHello

Browser는 `ClientHello`를 보내 TLS Handshake를 시작합니다.

ClientHello에는 지원하는 TLS Version과 Cipher Suite, `supported_groups`와 Client Key Share 등이 포함될 수 있습니다. Client Key Share는 Browser가 이번 연결을 위해 만든 임시 Public 값이며, 대응하는 Private 값은 Browser가 보관합니다.

---

# 4. ServerHello

Server는 선택한 TLS 조건과 Group, Server Key Share를 `ServerHello`로 알립니다. Server도 임시 Private 값은 보관하고 Public 값인 Key Share만 보냅니다.

`X25519` 같은 Named Group에는 Key Share를 계산할 규칙과 공개 기준점 `G`가 이미 정의되어 있습니다. 따라서 Browser가 `G` 자체를 매번 보내는 것이 아니라 지원하는 Group 이름을 알리고, Server가 같은 Group을 선택합니다.

개념적으로 Browser와 Server는 같은 `G`에 각자의 임시 Private 값을 적용해 서로 다른 Key Share를 만듭니다.

```text
Browser Private 값: a
Client Key Share:    A = a × G

Server Private 값:  b
Server Key Share:    B = b × G
```

여기서 `×`는 일반적인 숫자 곱셈이 아니라 선택한 Group에서 정의된 계산을 단순하게 표현한 것입니다.

---

# 5. Certificate와 CertificateVerify

Server는 Certificate Chain과 Handshake 정보에 대한 전자서명도 제공합니다. Browser는 다음을 확인합니다.

- 요청한 Domain과 Certificate가 일치하는가
- Certificate가 유효기간 안에 있는가
- 신뢰하는 Root CA까지 Certificate Chain이 이어지는가
- Certificate의 Public Key로 Server의 전자서명을 검증할 수 있는가

Server가 Certificate의 Public Key에 대응하는 Private Key를 실제로 가지고 있어야 올바른 서명을 만들 수 있습니다. Certificate의 Private Key는 Server 인증에 사용되며 Browser에게 보내지지 않습니다.

---

# 서로 같은 공유 비밀 만들기

Browser와 Server는 완성된 Session Key를 Network로 보내지 않습니다. 서로 교환한 Public Key Share와 자신만 보관한 임시 Private 값을 이용해 각자 계산합니다.

```text
Browser: a × B = a × (b × G) = a × b × G
Server:  b × A = b × (a × G) = b × a × G
```

이 계산의 성질 때문에 양쪽은 같은 공유 비밀을 얻습니다. 공유 비밀을 계산하는 시점에는 `G`를 다시 직접 사용할 필요가 없습니다. 이미 `A`와 `B`를 만들 때 `G`가 계산에 포함되었기 때문입니다.

HTTPS 통신을 가로채 저장한 대상은 공개된 Group에서 `G`를 알 수 있고, Network에서 `A`와 `B`도 볼 수 있습니다. 하지만 다음 Private 값은 전송되지 않습니다.

```text
공격자가 아는 값: G, A, B
공격자가 모르는 값: a, b
```

실제 X25519에서는 `G`와 `A = a × G`를 보고 `a`를 역으로 구하는 문제가 현실적인 계산량으로 풀기 어렵도록 설계되어 있습니다. 따라서 `G`, `A`, `B`를 모두 탈취해도 임시 Private 값이나 계산된 Session Key가 함께 유출되지 않는 한 같은 공유 비밀을 만들기 어렵습니다.

Certificate와 서명 검증은 이 Key Share를 보낸 상대가 실제 Server인지 확인해 중간자 공격을 막는 역할을 합니다.

---

# Session Key 만들기

Browser와 Server는 같은 공유 비밀과 Handshake 정보를 이용해 같은 Session Key들을 각각 계산합니다.

하나의 Key만 만드는 것이 아니라 Browser에서 Server 방향, Server에서 Browser 방향과 용도에 따라 여러 Key가 만들어집니다. 이 Key들도 Network로 직접 전송하지 않습니다.

---

# HTTP Request와 Response 암복호화

Certificate의 Public Key와 Private Key는 Server 인증에 사용됩니다. 실제 HTTP Data는 Session Key를 사용하는 대칭키 방식으로 보호합니다.

```text
Browser
HTTP Request → Session Key로 암호화 → 전송

Server
수신 → Session Key로 복호화 → HTTP Request 처리
HTTP Response → Session Key로 암호화 → 전송

Browser
수신 → Session Key로 복호화 → HTTP Response 사용
```

대칭키 암호화는 많은 Data를 효율적으로 처리할 수 있습니다. TLS 1.3은 암호화와 함께 Data가 중간에서 변경되지 않았는지도 검증합니다.

---

# 비대칭키와 대칭키의 역할

- `비대칭키`: 서로 다른 Public Key와 Private Key를 사용합니다. HTTPS에서는 Server 인증과 안전한 공유 비밀 생성에 관련됩니다.
- `대칭키`: 같은 비밀 Key를 기준으로 암호화하고 복호화합니다. 실제 HTTP Data 보호에 사용됩니다.

TLS 1.3에서는 “Browser가 Session Key를 만든 뒤 Server Certificate의 Public Key로 암호화해 전송한다”는 방식으로 설명하면 정확하지 않습니다. 양쪽이 Key Share로 같은 공유 비밀을 계산하고, 그 결과에서 Session Key를 각각 만듭니다.

---

# HTTPS가 제공하는 것

- `기밀성`: 중간에서 HTTP 내용을 쉽게 읽을 수 없게 합니다.
- `무결성`: 전송 중 암호화된 Data가 변경되었는지 확인합니다.
- `Server 인증`: Browser가 연결한 Server의 신원을 Certificate로 확인합니다.

HTTPS를 사용해도 Server Application의 취약점이나 사용자가 직접 제공한 민감 정보까지 자동으로 안전해지는 것은 아닙니다.

---

# 개발자가 개입하는 지점

개발자나 운영자는 Certificate와 Private Key, TLS Version, HTTPS Port, HTTP에서 HTTPS로의 Redirect, Secure Cookie와 HSTS 등을 설정할 수 있습니다.

Application 개발자가 Key Exchange와 암호 Algorithm을 직접 구현해서는 안 됩니다. 검증된 Browser, Web Server와 TLS Library가 이를 처리하도록 해야 합니다.

---

# 참고 자료

- [RFC 8446 — TLS 1.3](https://www.rfc-editor.org/rfc/rfc8446.html)
- [RFC 5280 — Internet X.509 PKI Certificate Profile](https://www.rfc-editor.org/rfc/rfc5280.html)
- [RFC 9525 — Service Identity in TLS](https://www.rfc-editor.org/rfc/rfc9525.html)
- [RFC 9110 — HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110.html)
- [RFC 9293 — Transmission Control Protocol](https://www.rfc-editor.org/rfc/rfc9293.html)
