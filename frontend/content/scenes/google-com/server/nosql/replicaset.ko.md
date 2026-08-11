# 한눈에 보기

Replica Set은 같은 데이터를 복제하여 보관하는 여러 MongoDB `mongod` Process의 묶음입니다.

고가용성을 위한 최소 권장 구성은 Primary 1개와 Secondary 2개로 이루어진 세 개의 데이터 보유 Member입니다. MongoDB 자체가 항상 3대를 요구한다는 뜻은 아닙니다.

---

# Primary와 Secondary

```text
                    oplog 복제
Primary ─────────────────────────→ Secondary A
   └─────────────────────────────→ Secondary B
```

Primary는 기본적으로 쓰기 요청을 처리합니다. Secondary는 Primary의 변경 기록인 `oplog`를 읽어 자신의 데이터에 순서대로 반영합니다.

복제는 비동기로 진행되므로 짧은 순간에는 Primary와 Secondary가 서로 다른 값을 가지고 있을 수 있습니다.

---

# 왜 세 개를 권장할까요?

Replica Set은 Primary를 선출할 때 투표 가능한 Member의 과반수가 필요합니다.

```text
3개 Member의 과반수 = 2개
1개 장애 발생
남은 2개로 과반수 유지
```

Primary에 장애가 발생하면 남은 Secondary 중 하나를 새로운 Primary로 선출할 수 있습니다. 두 개만 구성하면 한 개가 장애 났을 때 남은 한 개만으로 과반수를 만들 수 없습니다.

세 번째 Member를 Arbiter로 둘 수도 있지만 Arbiter는 투표만 하고 데이터를 저장하지 않습니다. 기본 설명에서는 Primary와 두 Secondary가 모두 데이터를 보관하는 구성을 사용합니다.

---

# Read Preference와 Concern

`Read Preference`는 Primary와 Secondary 중 어디에서 읽을지 정합니다. Secondary에서 읽으면 읽기 부하를 나눌 수 있지만 아직 복제되지 않은 이전 값을 받을 수 있습니다.

`Write Concern`은 몇 개 Member의 반영 확인을 받아야 쓰기 성공으로 볼지 정하고, `Read Concern`은 어떤 수준으로 확인된 데이터를 읽을지 정합니다.

가용성, 응답 시간과 데이터 정합성 사이의 선택이므로 모든 요청에 같은 설정이 정답은 아닙니다.

---

# BASE와의 관계

Replica Set은 일부 Member에 장애가 발생해도 가능한 범위에서 서비스를 이어 가고, 비동기 복제로 Member의 상태가 변하며, 추가 변경이 없다면 시간이 지나 같은 데이터로 수렴할 수 있습니다. 이런 특성은 BASE의 관점으로 설명할 수 있습니다.

- `Basically Available`: 일부 장애가 있어도 가능한 Member로 서비스를 계속 제공합니다.
- `Soft State`: 새로운 요청이 없어도 복제가 진행되면서 Secondary의 상태가 바뀔 수 있습니다.
- `Eventual Consistency`: 추가 변경이 없다면 Replica의 값이 결국 같아집니다.

그렇다고 MongoDB가 항상 약한 정합성만 제공한다는 뜻은 아닙니다. 읽기 위치와 Read·Write Concern 설정에 따라 더 강한 정합성을 요구할 수 있고, 그만큼 지연이나 가용성에 비용이 생길 수 있습니다.

---

# 개발자가 개입하는 지점

개발자는 Replica Set Member 주소가 포함된 Connection String을 구성하고 Read Preference, Read Concern과 Write Concern을 선택합니다.

운영 환경에서는 Member를 서로 다른 장애 영역에 배치하고 Failover 때 Driver가 새 Primary를 찾는 동안 발생할 수 있는 일시적인 오류와 재시도를 처리해야 합니다.

---

# 참고 자료

- [MongoDB — Replica Set Members](https://www.mongodb.com/docs/manual/core/replica-set-members/)
- [MongoDB — Three Member Replica Sets](https://www.mongodb.com/docs/manual/core/replica-set-architecture-three-members/)
- [MongoDB — Replication](https://www.mongodb.com/docs/manual/replication/)
- [MongoDB — Read Preference](https://www.mongodb.com/docs/manual/core/read-preference/)
- [MongoDB — Read Concern](https://www.mongodb.com/docs/manual/reference/read-concern/)
- [MongoDB — Write Concern](https://www.mongodb.com/docs/manual/reference/write-concern/)
