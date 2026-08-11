# 한눈에 보기

Session Layer는 Transport Layer보다 위에 있는 계층입니다. 이 Scene에서는 상위 계층의 Data가 TCP 또는 UDP로 내려오는 시작점을 보여주기 위해 배치했습니다.

실제 TCP/IP 구현에서는 Session Layer가 별도 Program으로 분리되지 않고 Application Protocol이나 Library가 관련 기능을 담당하는 경우가 많습니다.

---

# Transport Layer로 전달

상위 계층의 Data는 선택한 Transport Protocol로 전달됩니다.

- TCP는 Data를 Byte Stream으로 다루고 일부를 Segment에 담습니다.
- UDP는 Application이 전달한 Message의 경계를 유지해 Datagram에 담습니다.

---

# 개발자가 개입하는 지점

개발자는 사용하는 Application Protocol과 Library를 통해 TCP 또는 UDP 방식에 맞게 데이터를 읽고 씁니다.

---

# 참고 자료

- [ISO/IEC 7498-1 — OSI Basic Reference Model](https://www.iso.org/standard/20269.html)
