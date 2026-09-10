# 한눈에 보기

Keyspace는 Redis가 현재 Database의 모든 Key를 관리하는 논리적 공간입니다. Event Loop가 Command를 해석하면 Keyspace에서 대상 Key를 찾아 Value를 조회하거나 변경합니다.

```text
product:1001 → "Keyboard"
member:42    → Hash
ranking      → Sorted Set
```

---

# Key 조회

Redis의 Keyspace는 Hash Table을 중심으로 구현됩니다. `GET product:1001`처럼 하나의 Key를 찾는 작업은 평균 O(1)입니다.

O(1)은 저장된 Key가 늘어나도 Key 하나를 찾는 평균 작업량이 크게 늘어나지 않는다는 뜻입니다. 여러 Key를 처리하거나 Value 내부의 많은 요소를 순회하는 Command까지 언제나 같은 시간이 걸린다는 뜻은 아닙니다.

Command 하나는 다른 Command가 중간에 끼어들지 않은 채 처리됩니다. 하지만 `GET`으로 읽고 Application에서 계산한 뒤 `SET`하는 여러 Command 사이에는 다른 Client의 작업이 실행될 수 있습니다.

---

# TTL

TTL(Time To Live)은 Key가 유지될 시간을 정합니다. 시간이 지나 만료된 Key는 더 이상 조회되지 않으며 Redis가 만료 처리 과정에서 제거합니다.

TTL은 Value의 일부가 아니라 Key 전체에 적용됩니다. Cache 데이터의 변경 주기와 오래된 값을 허용할 수 있는 시간을 기준으로 TTL을 정해야 합니다.

---

# Key 설계

Key는 의미를 알아볼 수 있고 서로 충돌하지 않도록 일정한 규칙으로 만듭니다.

```text
product:1001
member:42:profile
category:book:popular
```

구분자로 `:`을 사용하는 방식이 흔하지만 Redis가 특정 이름 형식을 강제하지는 않습니다. Key가 지나치게 길면 Key 자체가 차지하는 Memory가 커지고, 너무 짧고 모호하면 운영 중 의미를 파악하기 어렵습니다.

---

# 개발자가 개입하는 지점

개발자는 Key 이름 규칙과 TTL을 정하고, 여러 단계의 로직에는 목적에 맞는 원자적 Command나 Transaction이 필요한지 판단합니다. 여러 서비스가 같은 Redis를 사용한다면 서비스와 기능을 구분하는 Prefix도 정하는 것이 좋습니다.

운영 환경에서 전체 Key를 한 번에 찾으려고 `KEYS *`를 사용하면 많은 Key를 순회하며 다른 Command를 지연시킬 수 있습니다. 점진적으로 탐색해야 한다면 `SCAN` 계열 Command를 고려합니다.

---

# 참고 자료

- [Redis — Keyspace](https://redis.io/docs/latest/develop/use/keyspace/)
- [Redis — SCAN](https://redis.io/docs/latest/commands/scan/)
- [Redis — EXPIRE](https://redis.io/docs/latest/commands/expire/)
- [Redis — Transactions](https://redis.io/docs/latest/develop/using-commands/transactions/)
