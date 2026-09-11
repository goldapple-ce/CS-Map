# 한눈에 보기

I/O Multiplexing은 많은 Client가 연결된 Redis에서 실제로 I/O가 가능한 Connection만 찾아 처리하도록 돕는 기술입니다.

Redis는 이를 Non-blocking I/O와 Event Loop에 연결해 적은 실행 자원으로 여러 Connection을 관리합니다.

---

# I/O Multiplexing 란

Redis에 Client 10,000개가 연결되어 있어도 같은 순간에 요청을 보내는 Client는 일부일 수 있습니다. I/O Multiplexing은 여러 Connection을 함께 감시하고 지금 읽거나 쓸 수 있는 Connection을 골라내는 방식입니다.

Connection은 Client와 Redis 사이의 통신 연결이고, Redis Server의 운영체제는 각 Connection의 통신 끝점을 Socket으로 관리합니다.

---

# Non-blocking I/O 란

Blocking I/O는 특정 Socket에 데이터가 들어올 때까지 실행 흐름을 멈추고 기다립니다. 이 상태에서는 다른 Socket에 요청이 먼저 도착해도 바로 처리할 수 없습니다.

Non-blocking Socket은 지금 읽을 데이터가 없으면 기다리지 않고 바로 돌아옵니다. 다만 Non-blocking만 사용하면 Redis가 많은 Socket을 계속 하나씩 확인해야 하므로, 어떤 Socket이 준비되었는지 효율적으로 찾는 방법이 더 필요합니다.

---

# 3. I/O Multiplexing 원리

Redis가 감시할 Socket들을 운영체제에 등록하면, 운영체제는 그중 현재 I/O가 가능한 Socket 목록을 돌려줍니다. Linux의 `epoll`과 macOS·BSD 계열의 `kqueue`가 이를 제공하는 기능입니다.

```text
10,000개 Socket 등록
        ↓ I/O Multiplexing
요청이 도착한 Socket A, C, D만 Ready 목록으로 반환
```

여기서 `Ready`는 요청 처리가 끝났다는 뜻이 아닙니다. Socket Buffer에 데이터가 있어 Redis가 지금 `read()`할 수 있다는 뜻입니다.

---

# Event Loop

Redis의 Event Loop는 I/O Multiplexing이 돌려준 Ready Socket의 Event를 처리합니다. Socket에서 RESP 요청을 읽고 Command로 해석해 실행한 뒤, 응답을 쓸 수 있는 Socket에 결과를 보냅니다. 이후 다시 Ready Socket을 확인하며 이 과정을 반복합니다.

```text
I/O Multiplexing → Ready Socket → 요청 읽기 → Command 실행 → 응답 쓰기 → I/O Multiplexing
```

---

# Single Thread에서도 의미 있는 이유

Redis의 핵심 Command는 일반적으로 하나의 Thread에서 하나씩 실행됩니다. I/O Multiplexing은 Command를 병렬로 실행하는 기술이 아닙니다.

대신 Single Thread가 요청이 없는 Socket을 기다리거나 모든 Socket을 직접 반복 확인하지 않도록 합니다. 실제로 처리할 Connection을 먼저 골라 주기 때문에, Connection 수보다 적은 실행 자원으로 Network 대기와 Connection 관리 비용을 줄일 수 있습니다.

오래 걸리는 Command 하나가 실행 흐름을 점유하면 뒤의 Command는 기다릴 수 있습니다. Redis 전체가 Thread 하나만 사용하는 것도 아니며, Version과 설정에 따라 Network I/O나 Persistence에는 별도의 Thread와 Background Process가 사용될 수 있습니다.

---

# 여러 요청이 동시에 들어오면 어떻게 될까?

여러 Socket에 요청이 도착하면 그 Socket들이 같은 Ready 목록에 포함될 수 있습니다. Event Loop는 준비된 Event를 처리하지만 핵심 Command 실행은 하나씩 순차적으로 진행됩니다.

따라서 여러 Client가 거의 동시에 요청했다고 해서 Command가 동시에 실행되는 것은 아닙니다. 또한 Application은 요청 도착 시각만 보고 서로 다른 Client Command의 정확한 실행 순서를 보장받는다고 가정해서는 안 됩니다. 순서나 원자성이 필요한 작업은 Redis가 제공하는 원자적 Command와 Transaction 같은 기능을 목적에 맞게 사용해야 합니다.

---

# 참고 자료

- [Redis — Client handling](https://redis.io/docs/latest/develop/reference/clients/)
- [Redis — Latency](https://redis.io/docs/latest/operate/oss_and_stack/management/optimization/latency/)
- [Redis — Transactions](https://redis.io/docs/latest/develop/using-commands/transactions/)
