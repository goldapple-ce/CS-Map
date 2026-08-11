# 한눈에 보기

Eviction은 Redis가 `maxmemory` 한도에 도달했을 때 어떤 Key를 제거할지 결정하는 기능입니다.

Cache에서는 모든 Key를 계속 보관할 수 없으므로 실제 접근 패턴에 맞는 `maxmemory-policy`를 선택해야 합니다.

---

# 정책 이름 읽는 법

- `allkeys-*`: TTL 설정 여부와 관계없이 모든 Key가 제거 대상입니다.
- `volatile-*`: TTL이 설정된 Key만 제거 대상입니다.

`volatile-*` 정책을 사용하지만 TTL이 설정된 Key가 없다면 제거할 대상이 없어 `noeviction`처럼 새로운 쓰기가 실패할 수 있습니다.

---

# Eviction 정책의 종류

- `noeviction`: Key를 제거하지 않고 memory가 더 필요해지는 쓰기 Command에 오류를 반환합니다.
- `allkeys-lru`: 모든 Key 중 최근에 가장 적게 사용된 Key를 우선 제거합니다.
- `allkeys-lfu`: 모든 Key 중 사용 빈도가 낮은 Key를 우선 제거합니다.
- `allkeys-lrm`: 모든 Key 중 최근에 변경되지 않은 Key를 우선 제거합니다.
- `allkeys-random`: 모든 Key 중 임의의 Key를 제거합니다.
- `volatile-lru`: TTL이 있는 Key 중 최근에 가장 적게 사용된 Key를 우선 제거합니다.
- `volatile-lfu`: TTL이 있는 Key 중 사용 빈도가 낮은 Key를 우선 제거합니다.
- `volatile-lrm`: TTL이 있는 Key 중 최근에 변경되지 않은 Key를 우선 제거합니다.
- `volatile-random`: TTL이 있는 Key 중 임의의 Key를 제거합니다.
- `volatile-ttl`: TTL이 있는 Key 중 남은 시간이 짧은 Key를 우선 제거합니다.

LRM 정책은 Redis 8.6부터 제공됩니다. 사용 중인 Redis version에서 지원하는 정책인지 확인해야 합니다.

Redis의 LRU와 LFU는 모든 Key를 완벽하게 비교하는 대신 일부 후보를 표본으로 확인하는 근사 방식입니다. 정확한 이론적 LRU 목록을 유지하는 것보다 memory와 처리 비용을 줄이기 위한 선택입니다.

---

# Cache에서 선택하기

Cache 전용 Redis라면 모든 Key를 제거 대상으로 삼는 `allkeys-*` 계열을 고려할 수 있습니다. 일부 Key만 만료·제거 대상으로 삼아야 한다면 `volatile-*` 계열을 사용할 수 있습니다.

정답이 하나로 정해져 있지는 않습니다. 최근 사용 여부가 중요한지, 사용 빈도가 중요한지와 TTL 없는 Key를 보호해야 하는지를 기준으로 선택합니다.

---

# 개발자가 개입하는 지점

개발자는 `maxmemory`와 `maxmemory-policy`를 설정하고 `evicted_keys`, memory 사용량과 쓰기 오류를 관찰합니다.

Eviction이 지나치게 자주 발생하면 memory가 부족하거나 Cache 대상과 TTL이 적절하지 않을 수 있습니다. 정책만 바꾸기 전에 큰 Key와 불필요한 데이터가 쌓이고 있는지도 확인해야 합니다.

---

# 헷갈리기 쉬운 점

## Eviction과 Expiration은 다릅니다

Expiration은 TTL 시간이 끝나 Key가 만료되는 것이고, Eviction은 memory 한도 때문에 정책이 Key를 제거하는 것입니다.

## LRU가 가장 오래된 Key를 제거한다는 뜻은 아닙니다

LRU는 생성된 지 가장 오래된 Key가 아니라 최근 사용 시점이 가장 오래된 Key를 우선합니다.

---

# 참고 자료

- [Redis — Key Eviction](https://redis.io/docs/latest/develop/reference/eviction/)
- [Redis — INFO](https://redis.io/docs/latest/commands/info/)
