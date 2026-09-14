# 한눈에 보기

Hash Table은 Keyspace에서 Key에 연결된 Redis Object를 찾는 내부 조회 구조입니다.

```text
GET user:1 → Hash 계산 → Entry 조회 → Redis Object
```

---

# Key를 찾는 과정

Redis는 입력받은 Key로 Hash 값을 계산하고, 그 값으로 Hash Table에서 확인할 위치를 정합니다. 해당 위치의 Entry에서 같은 Key를 찾으면 Entry가 참조하는 Redis Object에 접근합니다.

```text
Key → Hash 함수 → 확인할 위치 → Entry → Redis Object
```

서로 다른 Key가 같은 위치를 가리키는 충돌이 생길 수 있으므로, Redis는 해당 위치의 Entry들을 비교해 실제 Key를 확인합니다.

일반적인 Key 조회가 평균 O(1)인 이유는 모든 Key를 처음부터 하나씩 훑지 않고 Hash 값으로 범위를 바로 좁히기 때문입니다. 다만 이는 평균적인 조회 비용이며, Value의 크기나 Value 내부에서 수행하는 연산까지 항상 O(1)이라는 뜻은 아닙니다.

---

# Redis Hash와는 다릅니다

이 Topic의 Hash Table은 Keyspace에서 Key를 찾기 위한 Redis 내부 조회 구조입니다.

Redis의 `Hash`는 사용자가 하나의 Key 아래에 여러 Field와 Value를 저장할 때 선택하는 Data Type입니다. 이름은 비슷하지만 역할이 다릅니다.

```text
Keyspace Hash Table → Key를 찾아 Redis Object를 참조
Redis Hash          → Client가 선택해 사용하는 Value Data Type
```

---

# 참고 자료

- [Redis — Keys and values](https://redis.io/docs/latest/develop/using-commands/keyspace/)
- [Redis — Data types](https://redis.io/docs/latest/develop/data-types/)
