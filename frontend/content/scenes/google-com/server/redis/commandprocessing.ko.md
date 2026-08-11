# 한눈에 보기

Command 처리는 Redis가 Client의 요청을 읽고, 요청에 맞는 연산을 실행한 뒤, 결과를 돌려주는 전체 흐름입니다.

여러 Connection을 다루는 방법은 `I/O Multiplexing`, 실제 Command가 순차적으로 실행되는 특징은 `Single Thread` 토픽에서 각각 설명합니다.

---

# Command 처리 흐름

```text
Client가 요청을 Socket에 전송
        ↓
운영체제가 해당 Socket을 읽을 수 있다고 알림
        ↓
I/O Multiplexing이 준비된 Connection 확인
        ↓
Redis가 요청을 읽어 Command로 해석
        ↓
Key와 Data Type에 맞는 연산 실행
        ↓
결과 응답
```

Client 입장에서는 Command를 보내는 것이 시작입니다. Redis Server 내부에서는 Socket에 데이터가 도착한 뒤 I/O Multiplexing으로 읽을 수 있는 Connection을 찾는 것부터 처리가 시작됩니다. 실제 Command 실행은 한 번에 하나씩 이어집니다.

---

# 느린 Command의 영향

Redis Command마다 처리해야 하는 데이터 양이 다릅니다. 한 개의 Key를 찾는 Command는 빠를 수 있지만, 매우 큰 Collection 전체를 순회하거나 큰 결과를 반환하는 Command는 Command 실행 흐름을 오래 점유할 수 있습니다.

따라서 Command 이름만 볼 것이 아니라 대상 요소 수와 시간 복잡도를 함께 확인해야 합니다.

---

# 개발자가 개입하는 지점

개발자는 큰 범위를 한 번에 처리하는 Command를 피하고 필요한 만큼 나누어 조회합니다. `SLOWLOG`, Command별 latency와 CPU 사용량을 확인하면 다른 요청을 막는 Command를 찾는 데 도움이 됩니다.

여러 요청을 보낼 때 Pipelining으로 network 왕복을 줄일 수 있지만, 처리해야 하는 Command 자체가 사라지는 것은 아닙니다. 한 번에 지나치게 많은 Command를 보내지 않도록 크기를 조절해야 합니다.

---

# 헷갈리기 쉬운 점

## 동시에 연결된 것과 동시에 실행되는 것은 다릅니다

여러 Client가 동시에 Redis에 연결하고 요청을 보낼 수 있습니다. 하지만 Redis가 핵심 Command를 동시에 여러 개 실행한다는 뜻은 아닙니다.

## Pipelining은 Command를 하나로 합치지 않습니다

Pipelining은 여러 Command를 모아 보내 Network 왕복 횟수를 줄입니다. Redis 안에서는 각 Command가 차례대로 처리됩니다.

---

# 참고 자료

- [Redis — Latency](https://redis.io/docs/latest/operate/oss_and_stack/management/optimization/latency/)
- [Redis — Benchmarking](https://redis.io/docs/latest/operate/oss_and_stack/management/optimization/benchmarks/)
- [Redis — INFO](https://redis.io/docs/latest/commands/info/)
