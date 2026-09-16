# 한눈에 보기

Redis Object는 Keyspace의 Hash Table Entry가 참조하는 Value를 Redis가 내부에서 표현한 객체입니다.

Redis Object에는 Value가 어떤 Data Type인지 나타내는 정보가 있습니다. Redis는 이 정보를 보고 같은 Key에 어떤 연산을 적용할 수 있는지 판단합니다.

---

# Value의 Data Type

Data Type은 Value가 표현하는 데이터의 모양과 Redis가 제공할 연산을 정합니다.

- `String`: 문자열, 숫자, Binary나 직렬화한 객체처럼 하나의 값을 표현합니다. 단순 조회·저장과 Counter에 적합합니다.
- `List`: 순서를 가진 값들을 표현하며 양쪽 끝에서 값을 넣고 꺼낼 수 있습니다. 간단한 Queue나 최근 항목 목록에 사용할 수 있습니다.
- `Hash`: 하나의 Key 아래에 여러 Field와 Value를 표현합니다. 객체의 일부 Field를 따로 읽고 변경할 때 적합합니다.
- `Set`: 중복 없는 값들의 모음입니다. 포함 여부 확인이나 합집합·교집합 같은 집합 연산에 적합합니다.
- `Sorted Set`: 중복 없는 Member마다 Score를 두고 순서를 관리합니다. Ranking이나 우선순위 목록에 적합합니다.
- `Stream`: ID를 가진 Entry를 추가 순서대로 기록합니다. Event 기록과 Consumer Group을 이용한 메시지 처리에 적합합니다.

여기서 Redis `Hash` Data Type은 사용자가 선택하는 Value 구조입니다. Keyspace가 Key를 찾을 때 사용하는 내부 Hash Table과는 역할이 다릅니다.

---

# Memory와 개발자의 선택

Redis Object와 객체가 가리키는 실제 데이터는 Memory에 존재합니다. Value의 내용뿐 아니라 객체 Metadata와 내부 자료구조도 Memory를 사용합니다.

개발자는 데이터의 겉모양보다 필요한 연산을 기준으로 Data Type을 선택하고, Value 크기와 요소 수가 계속 커지지 않도록 관리합니다.

---

# 참고 자료

- [Redis — Data types](https://redis.io/docs/latest/develop/data-types/)
- [Redis — Memory optimization](https://redis.io/docs/latest/operate/oss_and_stack/management/optimization/memory-optimization/)
