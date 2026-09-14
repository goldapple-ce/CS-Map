# 한눈에 보기

Redis Object는 Keyspace의 Hash Table Entry가 참조하는 Value를 Redis가 내부에서 표현하는 객체입니다. 객체에는 Value의 Data Type과 실제 데이터를 표현하는 내부 Encoding 등의 정보가 들어 있습니다.

---

# Data Type과 Encoding

String, Hash, List, Set, Sorted Set와 Stream 같은 Data Type은 Value의 구조와 Client가 사용할 수 있는 Command를 정합니다. 예를 들어 String은 `GET`과 `SET`, Hash는 Field 단위 조회와 변경, Sorted Set은 Score 기반 순위 연산에 적합합니다.

같은 Data Type도 데이터의 크기와 모양에 따라 서로 다른 내부 Encoding을 사용할 수 있습니다.

예를 들어 작은 값에 적합한 압축된 표현과 큰 값의 변경에 적합한 표현은 Memory 사용량과 연산 비용이 다릅니다. Redis는 조건에 따라 내부 Encoding을 선택하거나 바꿀 수 있으므로 Application이 특정 Encoding에 의존해서는 안 됩니다.

---

# Memory와의 관계

Redis Object와 객체가 가리키는 실제 데이터는 Memory에 존재합니다. 따라서 Value의 Payload뿐 아니라 객체 Metadata와 자료구조가 사용하는 공간도 Memory 사용량에 포함됩니다.

일반 Command의 조회와 변경은 이 Memory의 객체를 대상으로 합니다. RDB와 AOF를 설정했더라도 매번 Disk에서 Value를 찾아오는 구조는 아닙니다.

---

# 개발자가 개입하는 지점

개발자는 데이터 모양보다 필요한 연산에 맞는 Data Type을 고르고 Value 크기와 요소 수를 제한합니다. 내부 Encoding은 Redis가 관리하지만 `OBJECT ENCODING`으로 특정 Key가 사용하는 표현을 진단할 수 있습니다.

---

# 참고 자료

- [Redis — Data types](https://redis.io/docs/latest/develop/data-types/)
- [Redis — Memory optimization](https://redis.io/docs/latest/operate/oss_and_stack/management/optimization/memory-optimization/)
- [Redis — OBJECT ENCODING](https://redis.io/docs/latest/commands/object-encoding/)
