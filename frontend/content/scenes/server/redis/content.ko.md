# 한눈에 보기

Redis는 메모리 기반 Key-Value 데이터 저장소로, 낮은 Latency와 높은 Throughput이 필요한 환경에서 사용됩니다.

단순한 요청 처리 구조와 In-Memory 접근을 통해 많은 요청을 적은 비용으로 처리합니다.

---

# Latency와 Throughput

- Latency : 요청 하나를 보내고 결과를 받을 때까지 걸리는 시간
- Throughput : 일정한 시간 동안 완료할 수 있는 요청의 수

낮은 Latency는 Throughput을 높이는 데 도움이 되지만, 둘은 같은 의미가 아닙니다.  
예를 들어 가상의 두 저장소가 있다고 가정해 보겠습니다.

```
Storage A
- Operation Latency : 100ns
- Throughput : 500 QPS

Storage B
- Operation Latency : 100µs
- Throughput : 5,000 QPS
```

Storage A가 더 빠르지만, 초당 5,000개의 요청이 필요하다면 Storage B가 적합합니다.

Redis를 볼 때도 마찬가지입니다. Redis가 단순히 하나의 요청을 빠르게 처리한다는 것보다, 많은 요청을 `적은 비용으로 처리할 수 있는가를 살펴보는 것이 중요`합니다.

---

# 내부 흐름

요청을 받으면 대략 다음과 같은 흐름으로 처리합니다.

```text
RESP → I/O Multiplexing → Keyspace의 Hash Table → Redis Object
```

- `RESP(Redis Serialization Protocol)` : Client와 Server가 데이터를 주고받기 위해 사용하는 `통신 프로토콜`입니다.
- `I/O Multiplexing` : 하나의 프로세나 스레드가 여러 소켓을 동시에 감시하고, 실제로 준비가 된 Socket을 찾아내는 기술입니다.
- `Keyspace` : Redis Database가 Key와 Value를 관리하는 논리적 공간이며, Scene에서는 Hash Table과 Redis Object를 묶어 보여줍니다.
- `Hash Table` : Key를 이용해 연결된 Value를 찾는 내부 조회 구조입니다.
- `Redis Object` : Redis가 Value를 내부적으로 표현하는 객체입니다.
- `Memory` : Redis Object와 실제 데이터가 존재하는 공간이며, 일반 요청의 다음 처리 단계가 아닙니다.

---

# 어떻게 많은 요청을 처리할까?

요청 하나를 처리하는 비용을 낮추는 방식으로 높은 Throughput을 만듭니다.

- `RESP` : 데이터 타입을 Prefix로 구분하고, 데이터의 길이를 미리 전달하는 단순한 구조를 사용합니다. 따라서 Payload 전체를 탐색하거나 복잡한 `문법을 해석하는 비용을 줄여` 빠르게 Parsing할 수 있습니다.
- `In-Memory` : Storage I/O 없이 `Memory`에서 데이터에 접근합니다.
- `I/O Multiplexing + Event Loop` : 여러 Connection 중 I/O가 `준비된 요청만 찾아` Event Loop에서 처리함으로써, 많은 Connection을 적은 실행 자원으로 관리합니다.
- `Hash Table` : Hash Table 기반 구조를 사용합니다. 일반적인 Key 조회는 평균 `O(1)`에 수행되므로 데이터 탐색 비용이 작습니다.

---

# 어디에 사용할까?

빠른 접근과 높은 처리량이 필요한 데이터를 다루는 데 주로 사용됩니다.

- `Cache` : 반복적으로 조회되는 데이터를 저장해 Database의 요청을 줄입니다.
- `Session` : 여러 Application Server가 사용자 상태를 공유할 수 있도록 저장합니다.
- `Queue / Stream` : List나 Stream을 이용해 메시지나 작업을 순서대로 처리할 수 있습니다.

---

# 헷갈리기 쉬운 점

## Redis 전체가 하나의 Thread만 사용하는 것은 아닙니다

핵심 Command 실행은 주로 하나의 Event Loop에서 순차적으로 처리됩니다. Network I/O나 저장장치 작업에는 별도의 Thread나 Background 작업이 사용될 수 있습니다.

## Single Thread라고 모든 Race Condition이 사라지는 것은 아닙니다

하나의 Command가 실행되는 중간에는 다른 Command가 끼어들지 않습니다. 하지만 `GET`으로 읽고 Application에서 계산한 뒤 `SET`하는 것처럼 로직을 여러 Command로 나누면 그사이에 다른 Client가 값을 변경할 수 있습니다.

## In-Memory라고 Disk를 전혀 사용하지 않는 것은 아닙니다

Redis의 데이터 접근은 Memory를 중심으로 하지만, 필요하면 RDB나 AOF를 이용해 데이터를 Disk에 저장할 수 있습니다

---

# 참고 자료

- [Redis — Data Types](https://redis.io/docs/latest/develop/data-types/)
- [Redis — Latency](https://redis.io/docs/latest/operate/oss_and_stack/management/optimization/latency/)
- [Redis — Benchmarking](https://redis.io/docs/latest/operate/oss_and_stack/management/optimization/benchmarks/)
- [Redis — Pipelining](https://redis.io/docs/latest/develop/using-commands/pipelining/)
- [Redis — Key Eviction](https://redis.io/docs/latest/develop/reference/eviction/)
- [싱글스레드 Redis가 수십만 QPS를 내는 구조적 비밀](https://www.youtube.com/watch?v=H-jSrhvnaLY&t=932s)
