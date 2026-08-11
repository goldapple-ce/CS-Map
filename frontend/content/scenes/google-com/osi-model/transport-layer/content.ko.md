# 한눈에 보기

Transport Layer는 서로 다른 Host에서 실행되는 Application Process 사이의 데이터 전달을 담당합니다.

IP 주소가 목적지 Host를 구분한다면 Port 번호는 그 Host에서 통신할 Process를 구분합니다.

---

# Port

하나의 Server에서는 Web Server, Database와 여러 Application이 동시에 통신할 수 있습니다. Transport Layer는 출발지와 목적지 Port를 이용해 받은 데이터를 알맞은 Process의 Socket으로 전달합니다.

```text
IP 주소 → 목적지 Host
Port 번호 → Host 안의 목적지 Process
```

Port는 Application 자체의 이름이 아니라 통신 Endpoint를 구분하기 위한 번호입니다. 같은 Port를 어느 Protocol과 Process가 사용하는지는 실행 환경과 설정에 따라 달라질 수 있습니다.

---

# TCP와 UDP

- `TCP`는 연결을 수립하고 순서 확인, 재전송, Flow Control과 Congestion Control을 제공합니다. TCP의 전송 단위를 Segment라고 합니다.
- `UDP`는 연결 수립 없이 독립적인 Datagram을 전달합니다. 도착, 순서와 재전송을 UDP 자체에서 보장하지 않습니다.

TCP와 UDP는 차례로 실행되는 단계가 아니라, 통신 목적에 따라 선택하는 서로 다른 Transport Layer Protocol입니다. 그래서 Scene에서도 두 Topic 사이에 화살표를 두지 않습니다.

---

# 어떤 Protocol을 사용하나요?

Application 개발자가 Socket 수준에서 TCP와 UDP를 직접 선택하지 않는 경우도 많습니다. 사용하는 Application Layer Protocol이나 Library가 아래쪽 전송 방식을 결정할 수 있기 때문입니다.

- HTTP/1.1과 HTTP/2: 일반적으로 TCP 사용
- HTTP/3: UDP 위에서 QUIC 사용
- 일반적인 DNS Query: UDP를 사용할 수 있으며 큰 응답이나 상황에 따라 TCP도 사용

UDP가 항상 TCP보다 빠른 것도 아니고, TCP가 모든 통신에 더 안전한 선택인 것도 아닙니다. 필요한 신뢰성, 지연 시간, Message 경계와 사용하는 상위 Protocol을 함께 고려해야 합니다.

---

# 개발자가 개입하는 지점

개발자는 통신 특성에 따라 TCP 또는 UDP를 선택하고, Port, 연결 Timeout, 재시도와 연결 Pool 등을 설정합니다.

문제가 발생하면 IP 수준에서 목적지 Host에 도달하지 못하는지, Transport 연결을 만들지 못하는지, 연결 이후 Application 응답이 늦는지를 구분해야 합니다.

---

# 참고 자료

- [RFC 9293 — Transmission Control Protocol](https://www.rfc-editor.org/rfc/rfc9293.html)
- [RFC 768 — User Datagram Protocol](https://www.rfc-editor.org/rfc/rfc768.html)
- [RFC 1122 — Requirements for Internet Hosts](https://www.rfc-editor.org/rfc/rfc1122.html)
