# 한눈에 보기

Redis는 하나의 Key에 하나의 Value를 연결하여 데이터를 찾습니다. Key는 데이터를 식별하고, Value는 선택한 Redis Data Type의 실제 내용을 담습니다.

```text
product:1001 → "Keyboard"
member:42    → Hash
ranking      → Sorted Set
```

---

# Key 하나를 찾는 평균 비용은 O(1)입니다

Redis는 Key를 이용해 Value를 직접 찾습니다. `GET product:1001`처럼 하나의 Key를 조회하는 비용은 평균 O(1)입니다.

O(1)은 저장된 Key가 늘어나더라도 **Key 하나를 찾는 작업량이 평균적으로 크게 늘어나지 않는다**는 뜻입니다. 작업 시간이 항상 똑같거나 아무런 비용이 없다는 뜻은 아닙니다.

```text
Key 1개 조회   → 평균 O(1)
Key N개 조회   → 평균 O(N)
```

각 Key를 찾는 비용이 평균 O(1)이어도 여러 Key를 조회하면 조회한 개수만큼 전체 작업량이 늘어납니다. `MGET`으로 N개의 Key를 한 번에 요청해도 Command의 시간 복잡도는 O(N)입니다. 다만 여러 번 `GET`을 보내는 것보다 Network 왕복 횟수는 줄일 수 있습니다.

Value가 매우 크다면 Key를 빠르게 찾았더라도 Value를 읽고 응답으로 전송하는 데 시간이 더 걸릴 수 있습니다. 또한 Hash, List와 Set 같은 Value 내부 연산의 시간 복잡도는 사용하는 Command에 따라 달라집니다.

---

# Key 설계

Key는 의미를 알아볼 수 있고 서로 충돌하지 않도록 일정한 규칙으로 만듭니다.

```text
product:1001
member:42:profile
category:book:popular
```

구분자로 `:`을 사용하는 방식이 흔하지만 Redis가 특정 Key 이름 형식을 강제하는 것은 아닙니다.

Key가 지나치게 길면 Key 자체가 차지하는 memory가 커지고, 너무 짧고 모호하면 서로 다른 데이터가 충돌하거나 운영 중 의미를 파악하기 어려울 수 있습니다.

---

# Value

Value는 단순한 문자열만 뜻하지 않습니다. Redis는 Key마다 String, Hash, List, Set, Sorted Set와 Stream 같은 Data Type을 선택할 수 있습니다.

같은 데이터를 표현할 수 있어도 어떤 연산이 필요한지에 따라 알맞은 Data Type이 달라집니다.

---

# 개발자가 개입하는 지점

개발자는 Key 이름 규칙과 Value Data Type을 정합니다. 여러 서비스가 같은 Redis를 사용한다면 service와 기능을 구분하는 prefix도 정하는 것이 좋습니다.

큰 Key 목록을 한 번에 찾기 위해 운영 환경에서 `KEYS *`를 사용하면 Redis가 많은 Key를 순회하며 다른 Command를 지연시킬 수 있습니다. 점진적으로 탐색해야 한다면 `SCAN` 계열 Command를 고려합니다.

---

# 헷갈리기 쉬운 점

## Redis의 Key와 관계형 Database의 Primary Key는 역할이 완전히 같지 않습니다

둘 다 데이터를 식별하지만 Redis Key는 Data Type을 가진 Value 전체에 직접 연결됩니다. Table과 row 구조를 전제로 하지 않습니다.

---

# 참고 자료

- [Redis — Keyspace](https://redis.io/docs/latest/develop/use/keyspace/)
- [Redis — Data Types](https://redis.io/docs/latest/develop/data-types/)
- [Redis — GET](https://redis.io/docs/latest/commands/get/)
- [Redis — MGET](https://redis.io/docs/latest/commands/mget/)
- [Redis — SCAN](https://redis.io/docs/latest/commands/scan/)
