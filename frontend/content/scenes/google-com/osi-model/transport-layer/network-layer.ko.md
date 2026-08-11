# 한눈에 보기

Network Layer는 Transport Layer보다 아래에 있는 계층입니다. TCP Segment나 UDP Datagram을 받아 목적지 IP 주소 등이 포함된 IP Packet에 담습니다.

```text
TCP Segment 또는 UDP Datagram
→ IP Header 추가
→ IP Packet
```

이 Scene에서는 TCP와 UDP가 만든 전송 단위가 다음 계층으로 내려가는 지점을 보여주기 위해 배치했습니다.

---

# Transport Layer에서 받는 것

- TCP를 사용하면 Network Layer가 TCP Segment를 전달받습니다.
- UDP를 사용하면 Network Layer가 UDP Datagram을 전달받습니다.

Network Layer는 내부 데이터가 TCP인지 UDP인지 IP Header의 Protocol 또는 Next Header 값을 통해 구분할 수 있습니다.

---

# 개발자가 개입하는 지점

Application 개발자가 이 Encapsulation을 직접 구현할 일은 거의 없습니다. 운영체제의 Network Stack이 Transport Layer의 데이터를 IP Packet에 담습니다.

그럼에도 이 관계를 알면 TCP나 UDP의 Port 문제와 IP Route 문제를 서로 다른 계층의 문제로 구분하는 데 도움이 됩니다.

---

# 참고 자료

- [RFC 791 — Internet Protocol](https://www.rfc-editor.org/rfc/rfc791.html)
- [RFC 8200 — Internet Protocol, Version 6](https://www.rfc-editor.org/rfc/rfc8200.html)
