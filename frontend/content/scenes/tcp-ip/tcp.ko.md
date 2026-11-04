# 한눈에 보기

TCP는 통신 전에 연결을 수립하고, 보낸 Byte가 순서대로 상대 Application에 전달되도록 관리하는 연결 지향 Protocol입니다.

TCP가 만드는 전송 단위를 Segment라고 합니다.

---

# Connection-Oriented

TCP는 데이터를 보내기 전에 연결을 수립하고, 통신이 끝나면 연결을 종료합니다. 연결하는 동안 양쪽 Host는 Sequence Number, 수신 상태와 같은 TCP 상태를 관리합니다.

## 연결 수립: 3-Way Handshake

```text
Client → SYN     → Server
Client ← SYN-ACK ← Server
Client → ACK     → Server
```

Client와 Server는 이 과정을 통해 서로 통신할 준비가 되었는지 확인하고, 데이터 순서를 관리할 초기 Sequence Number를 맞춥니다. Handshake가 끝난 뒤 Application Data를 전송합니다.

Server는 Client의 SYN을 확인하는 ACK와 자신의 SYN을 하나의 Segment에 담을 수 있습니다. 그래서 연결 시작은 일반적으로 3-Way Handshake가 됩니다.

## 연결 종료: 4-Way Handshake

TCP 연결은 일반적으로 FIN과 ACK를 네 번 주고받아 종료합니다.

```text
Client → FIN → Server
Client ← ACK ← Server
Client ← FIN ← Server
Client → ACK → Server
```

TCP는 양방향 통신이므로 Client가 `FIN`을 보내도 Client에서 Server로 보내는 방향만 종료됩니다. Server는 `ACK`로 이를 확인한 뒤, 자신도 보낼 데이터를 모두 처리하면 별도의 `FIN`을 보냅니다.

마지막 ACK가 유실될 가능성에 대비해 먼저 종료를 요청한 쪽은 일정 시간 `TIME_WAIT` 상태로 남을 수 있습니다.

Server의 ACK와 FIN이 하나로 합쳐지면 실제 Segment 수가 줄어들 수 있지만, 두 방향을 독립적으로 종료한다는 원리는 같습니다. 연결을 정상 절차 없이 즉시 중단하는 상황에서는 `RST`가 사용될 수 있습니다.

---

# 신뢰성 있는 전달

TCP의 Sequence Number는 Byte Stream에서 데이터의 위치를 나타냅니다. 수신자는 받은 범위를 ACK로 알리고, 송신자는 일정 시간 안에 확인받지 못한 데이터를 다시 전송할 수 있습니다.

Segment가 Network에서 서로 다른 순서로 도착하더라도 TCP가 순서를 맞춰 Application에 전달합니다. 중복된 데이터도 Sequence Number를 이용해 구분할 수 있습니다.

---

# Flow Control

Flow Control은 수신자가 처리할 수 있는 양보다 송신자가 너무 많이 보내지 않도록 조절하는 기능입니다.

수신자는 Receive Window를 통해 현재 더 받을 수 있는 데이터의 크기를 알립니다. 송신자는 이 범위를 고려해 전송량을 제한합니다.

---

# Congestion Control

Congestion Control은 수신자의 처리 속도가 아니라 Network가 감당할 수 있는 전송량을 고려합니다.

- `Slow Start`: 연결 초기에 적은 양부터 시작해 전송량을 빠르게 늘립니다.
- `Congestion Avoidance`: 일정 지점부터 전송량을 더 조심스럽게 늘립니다.
- Packet 손실이나 혼잡 신호를 감지하면 전송량을 줄입니다.

Flow Control은 수신자를 보호하고, Congestion Control은 중간 Network의 혼잡을 줄인다는 차이가 있습니다.

---

# 개발자가 개입하는 지점

개발자는 연결 Timeout, 재시도, Keepalive와 Connection Pool 등을 설정할 수 있습니다.

문제가 발생하면 3-Way Handshake가 완료되지 않는지, 재전송이 반복되는지, Receive Window나 Congestion Control로 전송이 제한되는지, 연결이 `TIME_WAIT`에 많이 남아 있는지 구분해야 합니다.

---

# 참고 자료

- [RFC 9293 — Transmission Control Protocol](https://www.rfc-editor.org/rfc/rfc9293.html)
- [RFC 5681 — TCP Congestion Control](https://www.rfc-editor.org/rfc/rfc5681.html)
