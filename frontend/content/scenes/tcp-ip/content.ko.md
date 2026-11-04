# 한눈에 보기

TCP/IP는 인터넷 통신에 실제로 사용되는 Protocol들을 역할별로 묶어 이해하는 모델입니다.

이 Scene은 Application이 만든 HTTP 데이터가 Transport Layer, Internet Layer와 Network Access Layer를 거쳐 전달되는 관계를 보여줍니다. HTTPS는 HTTP를 TLS로 보호하는 방식이며, TCP와 UDP는 Application Protocol에 따라 선택되는 서로 다른 전달 방식입니다.

---

# 네 계층

- `Application Layer`: HTTP처럼 Application끼리 주고받을 Message의 의미와 형식을 정합니다. HTTPS는 HTTP Message를 TLS로 보호합니다.
- `Transport Layer`: Port로 Process를 구분하고 TCP 또는 UDP로 데이터를 전달합니다.
- `Internet Layer`: IP 주소를 이용해 목적지 Host까지 Packet을 전달합니다.
- `Network Access Layer`: Ethernet이나 Wi-Fi로 현재 Network 구간의 Frame을 전달하고 Bit를 실제 신호로 보냅니다.

Application Layer Area는 HTTP와 HTTPS를, Transport Layer Area는 TCP와 UDP를 같은 역할 범위로 묶습니다. HTTPS는 HTTP 다음에 거치는 별도 Application Protocol이 아니며, TCP와 UDP도 차례로 실행되는 단계가 아닙니다.

---

# HTTP 데이터가 전달되는 과정

HTTP/1.1과 HTTP/2는 일반적으로 TCP를 사용합니다. TCP가 만든 Segment는 Internet Layer에서 IP Packet에 담기고, Network Access Layer에서 현재 구간의 Ethernet이나 Wi-Fi Frame으로 전달됩니다.

HTTP/3는 QUIC을 사용하며 QUIC은 UDP 위에서 동작합니다. UDP Datagram도 Internet Layer와 Network Access Layer를 거쳐 전달되지만, 신뢰성·순서·암호화 같은 필요한 기능은 QUIC이 추가로 제공합니다.

Router는 IP Packet의 목적지 주소를 보고 다음 Network로 전달합니다. Packet이 Router를 지날 때 각 구간의 Frame은 달라질 수 있습니다.

---

# OSI 7계층과의 관계

OSI 7계층은 통신 역할을 일곱 부분으로 나누어 비교하는 참조 모델입니다. 이 Scene은 TCP/IP를 Application, Transport, Internet, Network Access 계층으로 설명합니다.

OSI의 Presentation Layer와 Session Layer 역할은 TCP/IP에서 독립된 계층으로 고정되지 않습니다. 데이터 표현과 대화 상태 관리는 Application Protocol이나 Library가 맡을 수 있고, HTTP를 보호하는 TLS의 자세한 동작은 HTTPS Child Scene에서 다룹니다.

---

# 개발자가 개입하는 지점

Application 개발자는 HTTP Method와 Header, 데이터 형식, Timeout과 재시도 정책을 구성합니다. Network나 Infrastructure를 다룬다면 Port, IP Route, 방화벽, Network Interface와 TLS 설정까지 확인할 수 있습니다.

장애를 분석할 때는 HTTP 응답 문제인지, TCP 연결 문제인지, IP Route 문제인지, Network Access 연결 문제인지 계층별로 범위를 좁힐 수 있습니다.

---

# 참고 자료

- [RFC 1122 — Requirements for Internet Hosts](https://www.rfc-editor.org/rfc/rfc1122.html)
- [RFC 8200 — Internet Protocol, Version 6](https://www.rfc-editor.org/rfc/rfc8200.html)
- [RFC 9293 — Transmission Control Protocol](https://www.rfc-editor.org/rfc/rfc9293.html)
- [RFC 9110 — HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110.html)
