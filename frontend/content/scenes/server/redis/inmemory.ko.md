# 한눈에 보기

Redis는 일반적인 Command를 Memory의 데이터로 처리합니다. 사용할 수 있는 Memory는 한정되어 있으므로 `maxmemory` 한도에 도달했을 때 어떤 Key를 제거할지 Eviction 정책으로 정합니다.

Eviction은 Cache 공간을 관리하는 기능입니다. TTL 시간이 끝난 Key를 만료시키는 Expiration과는 시작 조건이 다릅니다.

---

# maxmemory에 도달하면

Redis의 Memory 사용량이 `maxmemory`를 넘으면 설정된 `maxmemory-policy`를 확인합니다. Key를 제거하는 정책이라면 후보 중 일부를 Eviction해 새 데이터를 위한 공간을 확보합니다.

Eviction이 자주 발생한다면 정책만의 문제가 아닐 수 있습니다. `maxmemory`가 너무 작거나, Value가 크거나, 불필요한 Key가 계속 쌓이는지 함께 확인해야 합니다.

---

# 어떤 Key를 후보로 삼을까?

정책 이름의 앞부분은 Eviction 후보 범위를 나타냅니다.

- `allkeys-*`: TTL 설정 여부와 관계없이 모든 Key를 후보로 삼습니다.
- `volatile-*`: TTL이 설정된 Key만 후보로 삼습니다.

`volatile-*` 정책을 사용하는데 TTL이 설정된 Key가 없다면 제거할 후보가 없습니다. 이 경우 Memory가 더 필요한 쓰기는 `noeviction`과 비슷하게 실패할 수 있습니다.

---

# 후보 중 무엇을 제거할까?

정책 이름의 뒷부분은 후보를 고르는 기준입니다.

- `LRU`: 최근에 사용되지 않은 Key를 우선합니다.
- `LFU`: 사용 빈도가 낮은 Key를 우선합니다.
- `Random`: 후보 중 임의의 Key를 고릅니다.
- `TTL`: 남은 만료 시간이 짧은 Key를 우선합니다. `volatile-ttl`에서 사용합니다.

Redis의 LRU와 LFU는 모든 Key를 완벽하게 비교하지 않습니다. 일부 후보를 Sampling해 근사적으로 선택함으로써 Memory와 처리 비용을 줄입니다.

---

# noeviction

`noeviction`은 Memory를 확보하기 위해 Key를 제거하지 않습니다. 한도에 도달하면 Memory를 더 사용해야 하는 쓰기 Command에 오류를 반환합니다.

데이터를 임의로 제거하면 안 되는 경우에 사용할 수 있지만, Application은 쓰기 실패를 처리해야 합니다. `noeviction`이라는 이름이 Memory 제한을 없애 준다는 뜻은 아닙니다.

---

# 정책 선택과 관찰

Cache 전체를 필요에 따라 제거할 수 있다면 `allkeys-lru`나 `allkeys-lfu`처럼 모든 Key를 후보로 삼는 정책을 고려할 수 있습니다. TTL이 있는 Key만 제거해야 한다면 `volatile-*` 계열이 맞는지 확인합니다.

정책은 실제 접근 패턴을 기준으로 선택해야 합니다. Memory 사용량, `evicted_keys`, `expired_keys`, 쓰기 오류와 Cache Hit 비율을 함께 관찰하고 조정합니다.

---

# 참고 자료

- [Redis — Key eviction](https://redis.io/docs/latest/develop/reference/eviction/)
- [Redis — INFO](https://redis.io/docs/latest/commands/info/)
- [Redis — Memory optimization](https://redis.io/docs/latest/operate/oss_and_stack/management/optimization/memory-optimization/)
