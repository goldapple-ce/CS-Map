# 한눈에 보기

Hash Table은 Keyspace에서 Key에 연결된 Redis Object를 찾는 내부 조회 구조입니다.

Redis는 Key의 Hash 값으로 확인할 위치를 빠르게 좁힙니다. Key가 늘어나 Table 크기를 바꿔야 할 때는 데이터를 한 번에 모두 옮기지 않고 여러 작업에 걸쳐 점진적으로 Rehashing합니다.

---

# Key 조회와 Collision

Redis는 입력받은 Key로 Hash 값을 계산하고, 그 값으로 Hash Table에서 확인할 위치를 정합니다. 해당 위치에서 같은 Key를 가진 Entry를 찾으면 Entry가 참조하는 Redis Object에 접근합니다.

```text
Key → Hash 계산 → 확인할 위치 → Entry → Redis Object
```

서로 다른 Key가 같은 위치를 가리키는 Collision이 생길 수도 있습니다. 이 경우 Redis는 해당 위치의 Entry들을 비교해 실제로 요청한 Key를 찾습니다.

---

# Resize가 필요한 이유

Key가 계속 늘어나 Table의 공간이 부족해지면 Collision이 많아질 수 있습니다. 반대로 Key가 크게 줄어든 뒤에도 너무 큰 Table을 유지하면 Memory가 낭비될 수 있습니다.

Redis는 Key를 적절히 분산하고 공간을 관리하기 위해 필요할 때 Hash Table의 크기를 조정합니다. 크기가 바뀐 Table에서는 각 Key가 들어갈 위치도 다시 계산해야 하므로 기존 Entry를 새 Table로 옮기는 Rehashing이 필요합니다.

---

# Incremental Rehashing

Entry가 많은 Table을 한 번에 전부 옮기면 그 작업이 Redis의 실행 흐름을 오래 점유할 수 있습니다. 그동안 다른 Command의 처리가 지연될 수 있습니다.

Redis는 이런 긴 정지를 줄이기 위해 Entry 이동을 여러 작업에 나눠 조금씩 진행합니다. 이를 Incremental Rehashing이라고 합니다.

```text
이전 Table ── 일부 Entry씩 이동 ──→ 새 Table
```

이 작업은 별도의 Thread가 전체 Table을 알아서 옮기고 끝내는 방식이 아닙니다. Redis가 Hash Table 작업과 주기적인 처리 과정에서 Rehashing을 조금씩 진행합니다.

---

# 두 Table이 함께 있는 동안의 조회

Incremental Rehashing이 끝나기 전에는 이전 Table과 새 Table이 잠시 함께 존재합니다. 어떤 Key는 이미 새 Table로 이동했고, 다른 Key는 아직 이전 Table에 남아 있을 수 있습니다.

```text
이전 Table: 아직 이동하지 않은 Entry
새 Table:   이동을 마친 Entry와 새로 추가된 Entry
```

Redis는 이 기간에 Key를 놓치지 않도록 두 Table을 고려해 조회합니다. 모든 Entry의 이동이 끝나면 이전 Table을 정리하고 새 Table만 사용합니다.

---

# 평균 O(1)의 의미

일반적인 Key 조회가 평균 O(1)이라는 말은 Key가 많아져도 매번 전체 Key를 처음부터 순회하지 않는다는 뜻입니다.

Collision이 생기면 같은 위치의 Entry를 추가로 비교할 수 있고, Rehashing 중에는 두 Table을 확인할 수도 있습니다. 따라서 모든 조회가 정확히 같은 작업량을 가진다는 뜻은 아니지만, Hash 값으로 탐색 범위를 좁히므로 일반적인 조회 비용은 평균적으로 일정한 수준을 유지합니다.

Value가 매우 크거나 Value 내부에서 많은 요소를 처리하는 Command의 비용까지 O(1)이라는 뜻도 아닙니다.

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

- [Redis source — dict.c](https://github.com/redis/redis/blob/unstable/src/dict.c)
- [Redis source — dict.h](https://github.com/redis/redis/blob/unstable/src/dict.h)
- [Redis — Keys and values](https://redis.io/docs/latest/develop/using-commands/keyspace/)
- [Redis — Data types](https://redis.io/docs/latest/develop/data-types/)
