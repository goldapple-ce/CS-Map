# 한눈에 보기

Redis는 memory를 중심으로 Key와 여러 종류의 Value 자료구조를 저장하고 명령으로 조작하는 Data Store입니다.

Redis는 Session, Queue, 순위표와 분산 Lock 등에도 사용할 수 있지만, 이 Scene에서는 Cache로 사용할 때 알아야 할 Redis 자체의 특징만 다룹니다.

---

# 내부 흐름

```text
Client가 Socket으로 요청 전송
   ↓
I/O Multiplexing이 준비된 Connection 발견
   ↓
Command 읽기·해석·실행
   ↓
Key로 Value 찾기
   ↓
Memory에서 결과 처리
```

Command는 Single Thread에서 순차적으로 실행되고, Value에는 목적에 맞는 Data Type을 사용합니다. TTL은 Key를 정해진 시간 뒤 만료시키고, Eviction은 설정한 memory 한도에 도달했을 때 어떤 Key를 제거할지 결정합니다.

---

# Redis가 빠른 이유를 단순화하면

- 데이터를 주로 memory에서 읽고 씁니다.
- I/O Multiplexing과 Non-blocking I/O로 여러 Connection을 효율적으로 확인합니다.
- Key로 필요한 Value를 바로 찾습니다.
- Command를 Single Thread에서 순차적으로 실행하여 Thread 전환과 복잡한 Lock 경쟁을 줄입니다.
- String뿐 아니라 Hash, List, Set과 Sorted Set 같은 자료구조 연산을 Server에서 제공합니다.

그렇다고 모든 Command가 항상 빠른 것은 아닙니다. 한 번에 많은 요소를 순회하거나 큰 Value를 반환하는 Command는 오래 걸릴 수 있고, 뒤의 Command까지 기다리게 할 수 있습니다.

---

# 개발자가 개입하는 지점

개발자는 Key 규칙, Data Type, TTL, `maxmemory`와 Eviction 정책을 정합니다.

Cache 용도라도 memory 사용량, 느린 Command, 만료와 제거된 Key 수를 관찰해야 합니다. Redis가 빠르다는 이유만으로 큰 Value나 비용이 큰 Command를 무제한 사용하면 지연이 커질 수 있습니다.

---

# 헷갈리기 쉬운 점

## Redis는 단순한 String Cache가 아닙니다

String 외에도 Hash, List, Set, Sorted Set와 Stream 등 여러 Data Type과 그에 맞는 원자적 Command를 제공합니다.

## Redis 전체가 하나의 Thread만 사용하는 것은 아닙니다

핵심 Command 실행은 주로 하나의 Event Loop에서 순차적으로 처리됩니다. Network I/O나 저장장치 작업에는 별도의 Thread나 Background 작업이 사용될 수 있습니다.

## Single Thread라고 모든 Race Condition이 사라지는 것은 아닙니다

하나의 Command가 실행되는 중간에는 다른 Command가 끼어들지 않습니다. 하지만 `GET`으로 읽고 Application에서 계산한 뒤 `SET`하는 것처럼 로직을 여러 Command로 나누면 그사이에 다른 Client가 값을 변경할 수 있습니다.

---

# 참고 자료

- [Redis — Data Types](https://redis.io/docs/latest/develop/data-types/)
- [Redis — Latency](https://redis.io/docs/latest/operate/oss_and_stack/management/optimization/latency/)
- [Redis — Key Eviction](https://redis.io/docs/latest/develop/reference/eviction/)
