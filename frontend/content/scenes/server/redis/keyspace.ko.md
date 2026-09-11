# 한눈에 보기

Keyspace는 Redis가 현재 Database의 모든 Key를 관리하는 논리적 공간입니다. Event Loop가 Command를 해석하면 Keyspace에서 대상 Key를 찾아 Value를 조회하거나 변경합니다.

```text
GET user:1 → Keyspace → Key Lookup → Redis Object
```

---

# Key-Value

Redis의 데이터는 기본적으로 Key와 Value의 관계로 저장됩니다.

```text
name    → "redis"
count   → 10
user:1  → Value
```

Client는 Value의 위치를 직접 알 필요 없이 Key를 이용해 데이터에 접근합니다.

Key는 Binary Safe한 문자열이며, Value에는 String, Hash, List, Set, Sorted Set 등 다양한 Data Type을 저장할 수 있습니다.

---

# Hash Table

Redis는 Key를 빠르게 찾기 위해 Keyspace를 Hash Table 기반 구조로 관리합니다.

```text
"user:1"
    ↓
  Hash
    ↓
Hash Table
    ↓
 Value
```

Key를 Hashing하여 탐색하기 때문에 일반적인 Key Lookup은 평균적으로 `O(1)`에 수행됩니다.

즉 Key가 많아져도 처음부터 하나씩 탐색하는 방식이 아닙니다.

---

# Key Lookup

예를 들어 다음 Command가 실행되었다고 해보겠습니다.

```text
GET user:1
```

Redis는 `user:1`을 이용해 Keyspace에서 해당 Entry를 찾습니다.

```text
"user:1"
    ↓
Hash 계산
    ↓
Keyspace 탐색
    ↓
Value 발견
```

Key가 존재하면 연결된 Value에 접근하고, 존재하지 않는다면 Key가 없는 것으로 처리합니다.

이때 찾은 Value를 Redis 내부에서 표현하는 것이 Redis Object입니다.

---

# Expiration

Redis의 Key에는 만료 시간을 설정할 수 있습니다.

```text
SET session:1 value
EXPIRE session:1 60
```

이 경우 `session:1`은 60초 뒤 만료됩니다.

Redis는 Key와 함께 Expiration 정보를 관리하며, 만료된 Key는 더 이상 존재하는 데이터처럼 사용할 수 없습니다.

만료된 Key를 정리하는 방식은 크게 두 가지입니다.

- Passive Expiration : Key에 접근했을 때 만료 여부를 확인하고 제거
- Active Expiration : Redis가 주기적으로 만료된 Key를 찾아 제거

따라서 TTL이 끝난 순간 모든 Key를 즉시 한꺼번에 삭제하는 방식은 아닙니다.

---

# 참고 자료

- [Redis — Keyspace](https://redis.io/docs/latest/develop/use/keyspace/)
- [Redis — SCAN](https://redis.io/docs/latest/commands/scan/)
- [Redis — EXPIRE](https://redis.io/docs/latest/commands/expire/)
- [Redis — Transactions](https://redis.io/docs/latest/develop/using-commands/transactions/)
- [Medium - architecture](https://ashutoshkumars1ngh.medium.com/redis-architecture-why-redis-is-so-fast-and-a-deep-dive-into-internals-d153c064a549)
