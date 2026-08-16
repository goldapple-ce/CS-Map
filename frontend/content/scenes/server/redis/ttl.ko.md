# 한눈에 보기

TTL(Time To Live)은 Redis Key가 유지될 시간을 정합니다. 시간이 지나면 Key가 만료되어 더 이상 조회되지 않습니다.

---

# TTL 설정

```text
SET product:1001 "Keyboard" EX 300
```

이 Key는 300초 동안 유지됩니다. 이미 존재하는 Key에는 `EXPIRE`로 만료 시간을 설정할 수도 있고, `TTL`로 남은 시간을 확인할 수 있습니다.

TTL이 짧으면 Key가 자주 사라지고, 길면 오래된 Value가 더 오래 남을 수 있습니다. Cache 데이터가 얼마나 자주 바뀌고 얼마 동안 재사용되는지에 맞춰 정해야 합니다.

---

# TTL과 Key 변경

Key를 삭제하면 TTL도 함께 사라집니다. `SET`처럼 Value를 덮어쓰는 Command는 기존 TTL을 제거할 수 있으므로 새 Value를 저장할 때 만료 설정이 유지되는지 확인해야 합니다.

여러 Key가 같은 시점에 만료되면 Redis와 Cache를 사용하는 시스템에 순간적인 부하가 생길 수 있습니다. 필요하면 TTL에 작은 차이를 두어 만료 시점을 분산합니다.

---

# 개발자가 개입하는 지점

개발자는 Key별 TTL과 갱신 방식을 정하고 `expired_keys` 같은 지표를 관찰합니다.

TTL을 무조건 짧게 설정하기보다 데이터 변경 주기, 허용 가능한 오래된 값과 반복 조회 가능성을 함께 고려해야 합니다.

---

# 헷갈리기 쉬운 점

## TTL과 Eviction은 다릅니다

TTL은 Key마다 정한 시간이 지나서 만료되는 기능입니다. Eviction은 Redis가 memory 한도에 도달했을 때 정책에 따라 Key를 제거하는 기능입니다.

## TTL은 Value 일부가 아니라 Key에 적용됩니다

일반적인 TTL은 Key 전체를 만료시킵니다. Data Type 내부 요소의 만료 지원 여부는 사용하는 Redis version과 Data Type을 별도로 확인해야 합니다.

---

# 참고 자료

- [Redis — EXPIRE](https://redis.io/docs/latest/commands/expire/)
- [Redis — TTL](https://redis.io/docs/latest/commands/ttl/)
- [Redis — SET](https://redis.io/docs/latest/commands/set/)
