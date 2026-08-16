# 한눈에 보기

Redis는 일반적인 Command를 memory에 있는 데이터를 기준으로 처리하는 In-Memory Data Store입니다.

저장장치보다 빠르게 접근할 수 있지만 사용할 수 있는 memory가 한정되어 있고, 큰 Value와 많은 Key는 비용이 됩니다.

---

# Memory 사용

Redis가 사용하는 memory에는 Key와 Value뿐 아니라 Data Type을 관리하기 위한 정보, Key 만료 정보와 Client buffer 등도 포함됩니다.

따라서 Value 크기의 합만으로 필요한 memory를 정확히 계산할 수는 없습니다. 실제 환경에서는 `INFO memory`와 Key 크기 분포를 확인해야 합니다.

운영체제가 Redis memory를 저장장치로 swap하기 시작하면 In-Memory의 장점이 크게 줄고 응답 시간이 불안정해질 수 있습니다.

---

# maxmemory

`maxmemory`는 Redis가 데이터에 사용할 memory 한도를 정하는 주요 설정입니다.

한도에 도달했을 때의 동작은 `maxmemory-policy`로 정한 Eviction 정책에 따라 달라집니다. 일부 Key를 제거할 수도 있고, `noeviction`이면 새로운 쓰기 Command가 실패할 수 있습니다.

---

# 개발자가 개입하는 지점

개발자는 Redis에 저장할 데이터 양, 평균·최대 Value 크기, `maxmemory`와 Eviction 정책을 함께 정합니다.

Memory 사용량만 보지 말고 Eviction 횟수, 쓰기 실패, 큰 Key와 응답 지연도 관찰해야 합니다.

---

# 헷갈리기 쉬운 점

## In-Memory라고 memory가 무한한 것은 아닙니다

Redis가 빠르게 동작하려면 데이터 크기를 memory 용량 안에서 관리해야 합니다. 모든 데이터를 계속 쌓아 두는 구조는 Cache에 적합하지 않습니다.

---

# 참고 자료

- [Redis — Memory Optimization](https://redis.io/docs/latest/operate/oss_and_stack/management/optimization/memory-optimization/)
- [Redis — Key Eviction](https://redis.io/docs/latest/develop/reference/eviction/)
- [Redis — INFO](https://redis.io/docs/latest/commands/info/)
