# 한눈에 보기

Redis는 일반적인 Command를 Memory에 있는 데이터를 기준으로 처리하는 In-Memory Data Store입니다.

Disk보다 빠르게 접근할 수 있지만 사용할 수 있는 Memory가 한정되어 있고, 큰 Value와 많은 Key는 비용이 됩니다.

---

# Memory와 Eviction

Redis가 사용하는 Memory에는 Key와 Value뿐 아니라 Data Type을 관리하기 위한 정보, Key 만료 정보와 Client Buffer 등도 포함됩니다.

따라서 Value 크기의 합만으로 필요한 Memory를 정확히 계산할 수는 없습니다. 실제 환경에서는 `INFO memory`와 Key 크기 분포를 확인해야 합니다.

`maxmemory`는 Redis가 데이터에 사용할 Memory 한도를 정합니다. 한도에 도달하면 `maxmemory-policy`에 따라 일부 Key를 Eviction하거나, `noeviction`이면 Memory가 더 필요한 쓰기 Command에 오류를 반환합니다. TTL에 따른 Expiration과 Memory 한도에 따른 Eviction은 서로 다른 동작입니다.

운영체제가 Redis Memory를 Disk로 Swap하기 시작하면 In-Memory의 장점이 크게 줄고 응답 시간이 불안정해질 수 있습니다.

---

# RDB, AOF와 Disk

Disk는 일반 Command의 Key 조회 경로에 포함되지 않습니다. Persistence를 사용하면 Redis가 재시작한 뒤 데이터를 복구하기 위한 파일을 Disk에 남길 수 있습니다.

- `RDB`: 특정 시점의 Memory Dataset을 Snapshot 파일로 저장합니다.
- `AOF`: 데이터를 변경한 쓰기 Command를 Log에 기록합니다.

재시작할 때 Redis는 설정에 따라 RDB 또는 AOF를 읽어 Dataset을 Memory에 다시 구성합니다. 복구가 끝난 뒤 일반 Command는 다시 Memory의 데이터를 대상으로 실행됩니다. Cache처럼 재시작 후 원본에서 데이터를 다시 채워도 되는 경우에는 Persistence를 사용하지 않을 수도 있습니다.

---

# 개발자가 개입하는 지점

개발자는 Redis에 저장할 데이터 양, 평균·최대 Value 크기, `maxmemory`와 Eviction 정책을 함께 정합니다. 데이터 손실 허용 범위와 복구 필요성을 기준으로 RDB와 AOF 사용 여부도 결정합니다.

Memory 사용량뿐 아니라 Eviction 횟수, 쓰기 실패, 큰 Key, 응답 지연과 Persistence Disk 사용량도 관찰해야 합니다.

---

# 참고 자료

- [Redis — Memory Optimization](https://redis.io/docs/latest/operate/oss_and_stack/management/optimization/memory-optimization/)
- [Redis — Key Eviction](https://redis.io/docs/latest/develop/reference/eviction/)
- [Redis — Persistence](https://redis.io/docs/latest/operate/oss_and_stack/management/persistence/)
- [Redis — INFO](https://redis.io/docs/latest/commands/info/)
