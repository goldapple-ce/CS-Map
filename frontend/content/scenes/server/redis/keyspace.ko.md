# 한눈에 보기

Keyspace는 하나의 Redis Database가 `Key`와 `Value`를 관리하는 논리적인 공간입니다.

Redis의 데이터는 모두 Keyspace 안에서 `Key-Value` 형태로 관리됩니다. Scene의 `Hash Table`과 `Redis Object`는 이 Keyspace를 구성하는 내부 요소입니다.

Keyspace를 이해할 때는 Key를 어떻게 저장하고 찾는지만이 아니라, Key를 언제 제거하는지, 전체 Key를 어떻게 탐색하는지, 특정 Key에 요청이나 데이터가 몰릴 때 어떤 문제가 생기는지도 함께 볼 필요가 있습니다.

---

# Key와 Value

Redis는 데이터를 `Key-Value` 형태로 저장합니다.

```text
user:1 -> "Yongmin"
session:1 -> "abc123"
cart:10 -> Hash
```

Keyspace는 Key만 모아둔 공간이 아니라 각 Key와 Value의 연결 관계를 관리합니다.

Key는 하나의 Redis Database 안에서 고유하며, 이름에는 보통 다음과 같이 `:`를 사용해 의미를 구분합니다.

```text
user:1
user:2
session:100
reservation:2026-09-14:10
```

`:`는 Redis가 특별하게 해석하는 문법은 아니며, Key를 구분하기 위한 관례입니다.

Key 자체를 확인하거나 관리하는 명령도 제공합니다.

```text
EXISTS user:1
TYPE user:1
RENAME user:1 user:100
```

- `EXISTS`: Key가 존재하는지 확인합니다.
- `TYPE`: Value의 자료형을 확인합니다.
- `RENAME`: Key의 이름을 변경합니다.

---

# TTL과 Expiration

`TTL(Time To Live)`은 Key가 앞으로 얼마나 더 유지되는지를 나타냅니다.

`EXPIRE`로 만료 시간을 설정할 수 있고, `TTL`로 남은 시간을 확인할 수 있습니다.

```text
SET session:1 value
EXPIRE session:1 60
TTL session:1
```

TTL이 끝난 Key는 만료된 것으로 취급합니다.

Redis는 만료된 Key를 다음 두 방법으로 Keyspace에서 제거합니다.

- `Passive Expiration`: Client가 Key에 접근했을 때 만료 여부를 확인하고 제거합니다.
- `Active Expiration`: 다시 접근되지 않는 Key도 남지 않도록, 만료 시간이 설정된 Key 일부를 Redis가 주기적으로 확인하고 제거합니다.

Passive Expiration만 사용한다면 만료된 이후 다시 접근되지 않는 Key가 계속 Memory에 남을 수 있습니다. 이를 보완하기 위해 Redis는 Active Expiration을 함께 사용합니다.

## 만료된 Key를 즉시 삭제하지 않는 이유

Redis는 TTL이 끝난 모든 Key를 정확히 그 순간 한꺼번에 찾아 제거하지 않습니다.

Key를 확인하고 삭제하는 작업에도 CPU 시간이 필요하기 때문입니다. 같은 시점에 많은 Key가 만료되면 삭제 작업이 한꺼번에 몰려 다른 Command의 처리가 지연될 수 있습니다.

따라서 TTL이 끝났다는 것은 Key가 논리적으로 만료되었다는 의미이며, 실제 Memory에서 제거되는 시점은 조금 늦어질 수 있습니다.

---

# Key 삭제

Key를 명시적으로 제거하려면 `DEL`을 사용할 수 있습니다.

```text
DEL session:1
```

일반적인 Key라면 `DEL`로 충분하지만, 하나의 Key가 매우 큰 `Big Key`라면 삭제 과정에서 많은 Memory를 해제해야 할 수 있습니다.

Redis는 Command를 기본적으로 순차적으로 실행하므로, Memory 해제 작업이 오래 걸리면 다른 요청도 함께 지연될 수 있습니다.

이 경우 `UNLINK`를 사용할 수 있습니다.

```text
UNLINK session:1
```

`UNLINK`는 Key를 Keyspace에서 먼저 제거하고, 실제 Memory 해제 작업은 별도 Thread에서 비동기적으로 처리합니다.

따라서 큰 Key를 제거할 때 Main Thread가 Memory 해제 작업에 오래 점유되는 문제를 줄일 수 있습니다.

---

# Keyspace 전체를 확인할 때

`KEYS`는 조건에 맞는 Key를 한 번에 찾습니다.

```text
KEYS user:*
```

하지만 `KEYS`는 Keyspace를 전체적으로 확인해야 하므로 Key가 많을수록 작업량이 증가합니다.

Redis는 Command를 기본적으로 순차적으로 처리하기 때문에, 큰 Keyspace에서 `KEYS`를 실행하면 해당 Command가 서버를 오래 점유하면서 다른 요청까지 지연시킬 수 있습니다.

운영 환경에서는 보통 `SCAN`을 사용합니다.

```text
SCAN 0 MATCH user:* COUNT 100
```

`SCAN`은 Cursor를 사용해 Keyspace를 여러 번에 나누어 순회합니다.

전체 Keyspace를 끝까지 확인한다면 총 작업량 자체가 사라지는 것은 아니지만, 한 번의 Command가 Redis를 오래 점유하는 것을 줄일 수 있습니다.

다만 `SCAN`을 수행하는 동안에도 Keyspace는 계속 변경될 수 있습니다. 따라서 `SCAN`은 특정 한 시점의 Key 목록을 Snapshot처럼 반환하는 기능으로 보면 안 됩니다.

또한 애플리케이션이 처음부터 전체 Key 조회에 의존하지 않도록 Key 이름을 설계하고, 필요한 경우 `MATCH` 조건으로 탐색 범위를 좁히는 편이 좋습니다.

---

# Hot Key와 Big Key

Key마다 요청량과 데이터 크기는 다를 수 있습니다.

## Hot Key

`Hot Key`는 특정 Key에 요청이 지나치게 집중된 상태입니다.

Value 자체가 작더라도 하나의 Key에 요청이 몰리면 해당 Key를 처리하는 Redis에 CPU와 Network 부하가 집중될 수 있습니다.

Cluster 환경에서는 특정 Key가 위치한 Shard로 요청이 집중되면서 해당 Shard만 병목이 될 수도 있습니다.

Hot Key가 Cache 용도로 사용되고 있다면 만료 시점에도 주의해야 합니다. 요청이 많던 Key가 만료되면 동일한 데이터를 다시 조회하기 위한 요청이 Backend나 Database로 한꺼번에 몰릴 수 있습니다.

## Big Key

`Big Key`는 하나의 Key가 지나치게 큰 데이터를 가지고 있는 상태입니다.

예를 들어 큰 String을 저장하거나, 하나의 `Hash`, `List`, `Set` 등에 매우 많은 요소가 들어 있는 경우가 해당합니다.

Big Key는 단순히 Memory를 많이 사용하는 것에서 끝나지 않습니다.

많은 데이터를 한꺼번에 조회하거나 삭제하는 Command는 실행 시간이 길어질 수 있고, Redis의 다른 Command까지 기다리게 만들 수 있습니다. 큰 데이터를 Client로 전송할 때는 Network 비용도 증가합니다.

Hot Key와 Big Key는 서로 다른 문제입니다.

- 작은 Key도 요청이 집중되면 Hot Key가 될 수 있습니다.
- 거의 사용하지 않는 Key도 Value가 크면 Big Key가 될 수 있습니다.
- 하나의 Key가 Hot Key이면서 동시에 Big Key일 수도 있습니다.

따라서 운영 환경에서는 Key별 요청 분포와 데이터 크기를 따로 확인해야 합니다.

Hot Key는 특정 Node나 Shard의 CPU 사용량과 요청 분포를 관찰해 의심할 수 있습니다. LFU Eviction 정책을 사용하는 환경에서는 `redis-cli --hotkeys`를 통해 표본을 확인할 수도 있습니다.

Big Key는 `redis-cli --bigkeys`나 `--keystats` 등을 이용해 조사할 수 있습니다.

이러한 조사 역시 Redis에 추가 작업을 발생시키므로 운영 환경에서는 실행 범위와 시점을 조절해야 합니다.

---

# 참고 자료

- [Redis — Keys and values](https://redis.io/docs/latest/develop/using-commands/keyspace/)
- [Redis — EXPIRE](https://redis.io/docs/latest/commands/expire/)
- [Redis — SCAN](https://redis.io/docs/latest/commands/scan/)
- [Redis — Redis CLI](https://redis.io/docs/latest/develop/tools/cli/)
