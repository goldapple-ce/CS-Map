# 한눈에 보기

Redis는 여러 Client의 요청을 받을 수 있지만 핵심 Command는 Single Thread에서 하나씩 순차적으로 실행합니다.

한 Command를 실행하는 중간에는 다른 Command가 끼어들지 않으므로, `INCR` 같은 하나의 Command는 원자적으로 처리됩니다.

---

# Single Thread의 장점

여러 Thread가 같은 데이터를 동시에 변경할 때 필요한 복잡한 Lock과 Thread 전환을 줄일 수 있습니다. Command의 실행 순서가 단순해지고 하나의 Command 안에서 데이터가 중간 상태로 노출되는 것도 막을 수 있습니다.

이 특징은 Redis가 빠른 이유 중 하나입니다. 다만 가장 큰 기반은 데이터를 memory에서 처리한다는 점이며, Non-blocking I/O와 효율적인 Data Type도 함께 작용합니다.

---

# 하나의 Command에는 다른 Command가 끼어들지 않습니다

```text
Client A: INCR count  ─ 실행 완료
Client B: GET count   ─ 그다음 실행
```

`INCR`가 값을 읽고 증가시키고 저장하는 중간에 다른 Client의 Command가 끼어들지 않습니다. 따라서 여러 Client가 같은 Counter를 증가시킬 때 `GET`과 `SET`을 조합하는 것보다 `INCR` 하나를 사용하는 것이 안전합니다.

---

# 여러 Command에는 Race Condition이 생길 수 있습니다

```text
Client A: GET count → Application에서 +1 → SET count
Client B:       GET count → Application에서 +1 → SET count
```

각 `GET`과 `SET`은 원자적으로 실행되지만, 두 Command 사이에는 다른 Client의 Command가 실행될 수 있습니다. 두 Client가 같은 값을 읽고 같은 결과를 저장하면 증가 한 번이 사라질 수 있습니다.

따라서 “Redis는 Single Thread라서 Race Condition이 없다”가 아니라 “하나의 Command 실행에는 Race Condition이 없지만 여러 Command로 만든 로직에는 생길 수 있다”가 정확합니다.

---

# 단점

오래 걸리는 Command 하나가 실행 Thread를 점유하면 다른 Client의 Command도 기다려야 합니다. 큰 Collection 전체 조회, 많은 요소를 한꺼번에 삭제하는 작업과 오래 실행되는 Script를 조심해야 합니다.

---

# 개발자가 개입하는 지점

개발자는 가능한 경우 `GET`과 `SET`을 조합하기보다 `INCR`, `SET NX`처럼 목적에 맞는 원자적 Command를 사용합니다.

여러 Command를 하나의 작업으로 보호해야 한다면 상황에 따라 `MULTI`/`EXEC`와 `WATCH`, Lua Script 등을 사용할 수 있습니다. 또한 Command의 시간 복잡도와 처리할 데이터 크기를 확인하고 `SLOWLOG`로 오래 걸리는 Command를 찾아야 합니다.

---

# 참고 자료

- [Redis — Latency](https://redis.io/docs/latest/operate/oss_and_stack/management/optimization/latency/)
- [Redis — Transactions](https://redis.io/docs/latest/develop/using-commands/transactions/)
- [Redis — INCR](https://redis.io/docs/latest/commands/incr/)
