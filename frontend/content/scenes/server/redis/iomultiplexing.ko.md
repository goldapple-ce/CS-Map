# 한눈에 보기

I/O Multiplexing은 여러 Client Connection 가운데 읽거나 쓸 준비가 된 Connection을 찾는 기술입니다. Redis의 Event Loop는 그 결과를 받아 Network I/O와 Command 처리를 이어 갑니다.

Redis는 Socket을 Non-blocking으로 사용하므로 아무 요청도 보내지 않은 Connection 하나를 기다리느라 다른 요청까지 멈추지 않습니다.

---

# Event Loop와 Single Thread

```text
Client A ─┐
Client B ─┼─ I/O Multiplexing → Event Loop → Command 실행
Client C ─┘
```

Event Loop는 준비된 Socket에서 RESP 요청을 읽고 해석한 뒤 Command를 실행합니다. 핵심 Command는 주로 하나의 Thread에서 순차적으로 실행되므로, 한 Command를 실행하는 중간에 다른 Command가 끼어들지 않습니다.

이 단순한 실행 구조는 Lock과 Thread 전환 비용을 줄입니다. 하지만 큰 Collection을 순회하는 느린 Command가 실행 흐름을 오래 점유하면 뒤의 요청도 기다려야 합니다.

Redis 전체가 Thread 하나만 사용하는 것은 아닙니다. Network I/O나 Persistence 작업에는 Version과 설정에 따라 다른 Thread 또는 Background Process가 사용될 수 있습니다.

---

# 개발자가 개입하는 지점

개발자가 I/O Multiplexing이나 Event Loop를 직접 구현할 일은 거의 없습니다. 대신 Client Connection과 Timeout을 관리하고, Command의 시간 복잡도와 데이터 크기를 확인해야 합니다.

---

# 참고 자료

- [Redis — Client handling](https://redis.io/docs/latest/develop/reference/clients/)
- [Redis — Latency](https://redis.io/docs/latest/operate/oss_and_stack/management/optimization/latency/)
- [Redis — Transactions](https://redis.io/docs/latest/develop/using-commands/transactions/)
