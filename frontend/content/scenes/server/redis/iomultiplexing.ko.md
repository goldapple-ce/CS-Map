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

# Non-blocking I/O

Blocking Socket에서는 데이터가 아직 도착하지 않았다면 read()가 대기합니다.

```
read()
  ↓
데이터 없음
  ↓
Thread 대기
Non-blocking Socket에서는 데이터가 없다면 기다리지 않고 바로 반환합니다.
read()
  ↓
데이터 없음
  ↓
즉시 반환
하지만 이것만으로는 문제가 해결되지 않습니다.
수만 개의 Socket을 계속 하나씩 확인한다면,
Socket 1 확인
Socket 2 확인
Socket 3 확인
...
Socket 10000 확인
```

대부분 아무 데이터도 없는 Socket을 확인하는 데 CPU를 낭비하게 됩니다.

---

# 참고 자료

- [Redis — Client handling](https://redis.io/docs/latest/develop/reference/clients/)
- [Redis — Latency](https://redis.io/docs/latest/operate/oss_and_stack/management/optimization/latency/)
- [Redis — Transactions](https://redis.io/docs/latest/develop/using-commands/transactions/)
