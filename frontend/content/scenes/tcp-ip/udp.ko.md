# 한눈에 보기

UDP는 통신 전에 연결을 수립하는 Handshake 없이 독립적인 Datagram을 전달하는 Transport Layer Protocol입니다.

---

# UDP가 제공하는 것

UDP Header에는 출발지와 목적지 Port, Datagram 길이와 오류 확인을 위한 Checksum이 들어갑니다.

TCP의 Byte Stream과 달리 UDP는 Application이 보낸 Message의 경계를 유지합니다. 한 번 보낸 Datagram은 수신 측에서도 하나의 Datagram 단위로 다룹니다.

---

# UDP가 보장하지 않는 것

UDP 자체는 다음 기능을 보장하지 않습니다.

- Datagram 도착 여부
- 도착 순서
- 중복 제거
- 손실된 Datagram의 재전송
- TCP와 같은 Flow Control과 Congestion Control

필요한 신뢰성, 순서 제어와 Congestion Control은 Application 또는 QUIC 같은 상위 Protocol이 구현할 수 있습니다.

---

# UDP를 사용하는 경우

UDP는 DNS Query처럼 작은 Message를 주고받거나, Voice와 Video처럼 일부 데이터 손실보다 낮은 지연을 중요하게 다루는 통신에 사용할 수 있습니다.

HTTP/3가 사용하는 QUIC도 UDP 위에서 동작합니다. 하지만 QUIC은 UDP의 기능만 그대로 사용하는 것이 아니라 연결, 신뢰성, 보안과 Congestion Control을 추가로 구현합니다.

Handshake와 재전송을 UDP 자체에서 제공하지 않는다고 해서 UDP가 모든 상황에서 TCP보다 빠른 것은 아닙니다. Application과 Network 환경을 함께 고려해야 합니다.

---

# 개발자가 개입하는 지점

개발자는 Datagram 크기, 수신 Timeout, 손실과 순서 변경을 Application에서 어떻게 처리할지 결정합니다.

UDP는 TCP와 같은 연결 상태가 없으므로 요청과 응답을 어떤 기준으로 연결할지, 재전송이 필요하다면 언제 수행할지도 상위 Protocol에서 설계해야 합니다.

---

# 참고 자료

- [RFC 768 — User Datagram Protocol](https://www.rfc-editor.org/rfc/rfc768.html)
- [RFC 9000 — QUIC](https://www.rfc-editor.org/rfc/rfc9000.html)
