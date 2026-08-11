# 한눈에 보기

Cache는 자주 사용하거나 만드는 비용이 큰 데이터의 복사본을 더 빠르게 접근할 수 있는 곳에 저장해 두고 재사용하는 방법입니다.

Cache에 원하는 데이터가 있으면 `Cache Hit`, 없으면 `Cache Miss`라고 합니다. Cache Hit가 발생하면 원본 저장소를 조회하는 작업을 줄일 수 있습니다.

```text
데이터 요청
   ↓
Cache 확인
   ├─ Hit  → Cache의 값 반환
   └─ Miss → 원본 저장소 조회 → Cache 저장 → 값 반환
```

일반적으로 Cache는 원본 데이터의 복사본을 저장합니다. Cache가 비거나 삭제되어도 원본 저장소에서 다시 가져올 수 있어야 합니다.

---

# 데이터 정합성

Cache에서 말하는 데이터 정합성은 Cache의 값과 원본 저장소의 값이 서로 맞는 상태를 뜻합니다.

원본 데이터가 변경되었는데 Cache에는 이전 값이 남아 있으면 Application이 오래된 데이터를 반환할 수 있습니다. Cache 전략을 선택할 때는 조회와 쓰기 속도뿐 아니라 **얼마나 오래된 값까지 허용할 수 있는지**도 정해야 합니다.

모든 요청에서 두 값이 완전히 같아야 한다면 Cache를 유지하는 비용과 복잡성이 커집니다. 반대로 잠시 이전 값이 보여도 되는 데이터라면 TTL이나 비동기 갱신을 이용해 성능을 높일 수 있습니다.

---

# Cache 전략

Cache 전략은 Cache Miss를 누가 처리하는지, 데이터를 변경할 때 Cache와 원본 저장소를 어떤 순서로 다룰지 정하는 방법입니다.

## Cache Aside

Application이 Cache를 먼저 확인하고, Cache Miss일 때 원본 저장소를 직접 조회한 뒤 결과를 Cache에 저장합니다. 필요한 데이터만 조회 시점에 저장하므로 `Lazy Loading`이라고도 합니다.

```text
Application → Cache
                ├─ Hit  → 값 반환
                └─ Miss → 원본 저장소 조회 → Cache 저장
```

구조가 단순하고 필요한 데이터만 Cache할 수 있어 자주 사용됩니다. 첫 조회는 Cache와 원본 저장소를 모두 거치므로 느릴 수 있습니다.

### 데이터 정합성

원본 저장소를 변경한 뒤 Cache Key를 삭제하면 다음 조회부터 새로운 값을 Cache에 저장할 수 있습니다. 하지만 Cache 삭제가 실패하거나 원본 저장소를 직접 변경하는 다른 경로가 있으면 이전 값이 남을 수 있습니다.

구현은 단순하지만 원본 변경과 Cache 삭제 사이의 짧은 시간에는 두 값이 다를 수 있습니다.

## Read Through

Application은 Cache 계층에만 조회를 요청합니다. Cache Miss가 발생하면 Cache Library나 별도의 Cache 계층이 원본 저장소에서 데이터를 가져와 Cache에 저장합니다.

Cache Aside와 동작은 비슷하지만, Cache Miss 이후의 원본 조회를 Application이 처리하는지 Cache 계층이 처리하는지가 다릅니다. Redis Server가 임의의 Database에 직접 연결한다는 뜻은 아닙니다.

### 데이터 정합성

Read Through는 Cache Miss를 처리하는 위치만 바꿉니다. 원본 데이터가 변경되었을 때 기존 Cache를 어떻게 삭제하거나 갱신할지는 별도의 쓰기 전략과 Invalidation 정책이 필요합니다.

따라서 Read Through를 사용한다고 Cache와 원본 저장소의 값이 자동으로 같아지는 것은 아닙니다.

## Write Around

데이터를 변경할 때 원본 저장소에만 기록하고 Cache에는 바로 저장하지 않습니다. 이후 조회에서 Cache Miss가 발생하면 원본 데이터를 Cache에 저장합니다.

자주 조회되지 않을 데이터가 Cache 공간을 차지하는 것을 줄일 수 있지만, 변경 후 첫 조회에서는 Cache Miss가 발생합니다. 기존 Cache 값이 있다면 오래된 값을 반환하지 않도록 삭제해야 합니다.

### 데이터 정합성

원본 저장소만 변경하고 기존 Cache를 삭제하지 않으면 Cache Hit 때 이전 값이 반환됩니다. 원본 변경과 함께 관련 Cache Key를 삭제해야 정합성을 유지할 수 있습니다.

삭제가 완료되면 다음 조회는 원본 저장소의 최신 값을 읽어 Cache를 다시 채웁니다.

## Write Through

쓰기 요청이 끝나기 전에 원본 저장소와 Cache에 변경 내용을 모두 반영합니다.

변경 직후에도 최신 값을 Cache에서 조회할 수 있지만, 쓰기마다 두 곳을 갱신하므로 쓰기 시간이 늘어날 수 있습니다. 한쪽만 성공했을 때 두 작업이 하나의 Transaction으로 자동 rollback되는 것은 아닙니다.

### 데이터 정합성

응답하기 전에 원본 저장소와 Cache를 모두 갱신하므로 변경 직후 두 값이 같을 가능성이 높습니다.

하지만 한쪽 쓰기만 성공하면 값이 달라질 수 있습니다. 실패한 작업의 재시도나 Cache 삭제 같은 복구 방법이 필요하며, 두 저장소에 쓴다는 이유만으로 완전한 정합성이 자동 보장되지는 않습니다.

## Write Behind

Cache에 먼저 기록하고 응답한 뒤, 원본 저장소에는 비동기로 나중에 반영합니다. `Write Back`이라고도 합니다.

쓰기 응답은 빠르지만 원본 저장소에 반영되기 전에 Cache나 Queue의 데이터가 사라지면 변경을 잃을 수 있습니다. Redis에 값을 쓰는 것만으로 완성되는 방식은 아니며, Queue와 재시도 및 장애 복구가 필요합니다.

### 데이터 정합성

Cache에는 새로운 값이 있지만 원본 저장소에는 아직 반영되지 않은 시간이 의도적으로 생깁니다. 즉시 같은 값을 유지하는 대신 일정 시간이 지나면 값이 맞춰지는 최종적 정합성을 전제로 합니다.

원본 반영이 실패하거나 변경 순서가 뒤바뀌면 값이 계속 어긋날 수 있으므로 안전한 Queue, 순서 보장, 재시도와 중복 처리 대책이 중요합니다.

---

# Cache Invalidation

원본 데이터가 바뀌었는데 Cache의 값이 남아 있으면 오래된 데이터를 반환할 수 있습니다. 이를 막기 위해 Cache 값을 삭제하거나 갱신해야 합니다.

- 원본 데이터 변경 뒤 관련 Cache Key를 삭제합니다.
- Cache의 값을 새로운 값으로 갱신합니다.
- TTL을 설정하여 일정 시간이 지나면 자동으로 만료시킵니다.

TTL은 오래된 값이 계속 남는 것을 막지만 만료 전까지는 이전 값이 반환될 수 있습니다. Cache를 사용하는 것보다 언제 지우고 갱신할지를 정하는 일이 더 어려울 수 있습니다.

---

# Redis와의 관계

Redis는 빠른 In-Memory Key-Value 저장소이므로 Cache 저장소로 자주 사용됩니다. 하지만 Redis가 Cache 전략을 자동으로 선택하는 것은 아닙니다.

Application 코드, Framework의 Cache 기능 또는 별도의 Cache 계층이 전략을 구현하고 Redis는 Cache 데이터를 저장합니다.

---

# 개발자가 개입하는 지점

개발자는 어떤 데이터를 Cache할지, Cache Key를 어떻게 만들지, 어떤 전략과 TTL을 사용할지 결정합니다. 원본 데이터가 변경될 때 Cache를 삭제하거나 갱신하는 시점과 어느 정도의 오래된 값까지 허용할지도 설계해야 합니다.

Cache Hit 비율뿐 아니라 Cache Miss 때 원본 저장소에 생기는 부하와 Cache 장애 시 원본 저장소로 요청이 몰리는 상황도 확인해야 합니다.

---

# 참고 자료

- [Redis — Cache-Aside](https://redis.io/docs/latest/develop/use-cases/cache-aside/)
- [Microsoft — Cache-Aside Pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/cache-aside)
- [AWS — Database Caching Strategies](https://docs.aws.amazon.com/whitepapers/latest/database-caching-strategies-using-redis/caching-patterns.html)
- [AWS — Reactive Systems Caching Strategies](https://docs.aws.amazon.com/whitepapers/latest/reactive-systems-on-aws/responsive.html)
