# 한눈에 보기

Keyspace는 하나의 Redis Database가 Key와 Value를 관리하는 논리적인 공간입니다. Scene의 `Hash Table`과 `Redis Object`는 이 Keyspace를 구성하는 내부 요소입니다.

Keyspace를 운영할 때는 Key를 얼마나 빨리 찾는지만이 아니라, 언제 제거할지와 일부 Key에 부하나 데이터가 몰리지 않는지도 함께 봐야 합니다.

---

# TTL과 Expiration

`TTL(Time To Live)`은 Key가 앞으로 얼마나 더 유지되는지를 나타냅니다. `EXPIRE`로 만료 시간을 설정할 수 있고, `TTL`로 남은 시간을 확인할 수 있습니다.

```text
SET session:1 value
EXPIRE session:1 60
TTL session:1
```

TTL이 끝난 Key는 만료된 것으로 취급합니다. Redis는 만료된 Key를 다음 두 방법으로 Keyspace에서 제거합니다.

- `Passive Expiration`: Client가 Key에 접근했을 때 만료 여부를 확인하고 제거합니다.
- `Active Expiration`: 다시 접근되지 않는 Key도 남지 않도록, Redis가 만료 시간이 설정된 Key 일부를 주기적으로 확인하고 제거합니다.

따라서 TTL이 끝난 모든 Key를 정확히 그 순간 한꺼번에 찾아 지우는 방식은 아닙니다. 또한 TTL이 끝나 제거되는 Expiration은 Memory 한도 때문에 Key를 내보내는 Eviction과 다른 동작입니다.

---

# Hot Key와 Big Key

Key마다 요청량과 데이터 크기는 다를 수 있습니다.

- `Hot Key`: 요청이 한 Key에 지나치게 집중된 상태입니다. 그 Key의 연산과 Network 트래픽에 부하가 몰리고, Cluster에서는 해당 Key를 가진 Shard가 병목이 될 수 있습니다.
- `Big Key`: Value가 매우 크거나 Collection의 요소가 지나치게 많은 Key입니다. Memory를 많이 사용하며, 큰 범위를 한 번에 처리하는 Command는 다른 요청을 오래 기다리게 할 수 있습니다.

둘은 원인이 다릅니다. 작은 Key도 요청이 몰리면 Hot Key가 될 수 있고, 자주 사용하지 않는 Key도 Value가 크면 Big Key가 될 수 있습니다. 실제 환경에서는 요청 분포와 Key 크기를 따로 확인해야 합니다.

Hot Key는 특정 Shard의 CPU 사용량과 요청 분포를 관찰해 의심할 수 있습니다. LFU Eviction 정책을 사용하는 환경에서는 `redis-cli --hotkeys`로 표본을 확인할 수도 있습니다. Big Key는 `redis-cli --bigkeys`나 `--keystats`로 조사할 수 있습니다. 이런 조사도 Redis에 작업을 추가하므로 운영 환경에서는 실행 범위와 시점을 조절해야 합니다.

---

# Keyspace 전체를 확인할 때

`KEYS`는 조건에 맞는 Key를 한 번에 찾습니다. Key가 많은 운영 환경에서 실행하면 서버를 오래 점유해 다른 요청을 지연시킬 수 있습니다.

`SCAN`은 Cursor를 사용해 Keyspace를 여러 번에 나누어 확인합니다. 한 번의 호출이 서버를 오래 점유하는 것을 피할 수 있어 운영 중의 점진적인 조회에 적합합니다. 다만 조회하는 동안 Keyspace가 바뀔 수 있으므로, 한 시점의 고정된 목록을 반환하는 기능으로 보면 안 됩니다.

개발자는 처음부터 전체 Key 조회에 의존하지 않도록 Key 이름을 설계하고, 필요할 때 `SCAN`의 `MATCH` 조건으로 범위를 좁히는 편이 좋습니다.

---

# 참고 자료

- [Redis — Keys and values](https://redis.io/docs/latest/develop/using-commands/keyspace/)
- [Redis — EXPIRE](https://redis.io/docs/latest/commands/expire/)
- [Redis — SCAN](https://redis.io/docs/latest/commands/scan/)
- [Redis — Observability and monitoring](https://redis.io/docs/latest/operate/rs/monitoring/observability/)
- [Redis — Redis CLI](https://redis.io/docs/latest/develop/tools/cli/)
