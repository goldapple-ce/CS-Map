# 한눈에 보기

Redis의 Value는 단순한 문자열뿐 아니라 목적에 맞는 여러 Data Type을 사용할 수 있습니다. 각 Data Type은 Server에서 바로 실행할 수 있는 전용 Command를 제공합니다.

---

# 주요 Data Type

- String: text, binary, 숫자와 직렬화한 객체처럼 가장 기본적인 값을 저장합니다. `GET`, `SET`, `INCR` 등을 사용합니다.
- Hash: 하나의 Key 안에 여러 field-value를 저장합니다. 객체의 일부 field를 읽거나 변경할 때 사용할 수 있습니다.
- List: 입력 순서를 유지하는 값의 나열입니다. 양쪽 끝에 값을 넣고 꺼낼 수 있습니다.
- Set: 중복 없는 값의 모음입니다. 포함 여부, 합집합과 교집합 연산을 제공합니다.
- Sorted Set: 중복 없는 member마다 score를 부여하여 순서를 유지합니다. 순위와 점수 범위 조회에 사용할 수 있습니다.
- Stream: 시간 순서로 추가되는 entry를 저장하고 Consumer Group으로 처리할 수 있습니다.

Cache에서 객체 전체를 단순히 저장할 때는 String을, field 일부를 자주 다룰 때는 Hash를 고려할 수 있습니다. 다른 Data Type도 요구하는 연산에 맞을 때 선택합니다.

---

# Server에서 처리하는 연산

Redis는 Value를 Client로 모두 가져오지 않고도 Data Type에 맞는 연산을 수행할 수 있습니다.

```text
INCR view:count
SADD online:users 42
ZADD ranking 9800 member:42
HSET member:42 nickname map-user
```

이런 Command 하나는 Redis 안에서 원자적으로 처리됩니다.

---

# 개발자가 개입하는 지점

개발자는 데이터 모양보다 필요한 연산을 기준으로 Data Type을 선택합니다. 같은 정보를 여러 Data Type에 중복 저장하면 갱신 누락과 memory 낭비가 생길 수 있습니다.

Collection에 요소가 계속 쌓인다면 최대 길이, 삭제 방법과 TTL 적용 단위를 함께 설계해야 합니다.

---

# 헷갈리기 쉬운 점

## Hash는 Java HashMap 자체를 저장하는 기능이 아닙니다

Redis Hash는 Redis Server의 Data Type입니다. Client library가 Java 객체와 Redis field-value 사이의 변환을 담당합니다.

## List와 Sorted Set은 같은 순서 구조가 아닙니다

List는 값이 들어간 순서를 중심으로 관리하고, Sorted Set은 각 member의 score를 기준으로 정렬합니다.

---

# 참고 자료

- [Redis — Data Types](https://redis.io/docs/latest/develop/data-types/)
- [Redis — Compare Data Types](https://redis.io/docs/latest/develop/data-types/compare-data-types/)
