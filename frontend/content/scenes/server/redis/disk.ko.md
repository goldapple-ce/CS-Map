# 한눈에 보기

Disk는 Redis의 일반적인 Key 조회 경로가 아닙니다. Redis는 RDB나 AOF Persistence를 설정했을 때 재시작 후 데이터를 복구할 수 있도록 파일을 Disk에 저장합니다.

Persistence가 필요하지 않은 Cache라면 RDB와 AOF를 사용하지 않을 수도 있습니다.

---

# RDB와 AOF

- `RDB`: 특정 시점의 Memory Dataset을 Snapshot 파일로 저장합니다. 마지막 Snapshot 이후의 변경은 장애가 발생하면 복구되지 않을 수 있습니다.
- `AOF`: 데이터를 변경한 쓰기 Command를 Log에 기록합니다. Disk에 동기화하는 주기에 따라 성능과 장애 시 손실될 수 있는 범위가 달라집니다.

두 방식을 하나만 사용하거나 함께 사용할 수 있습니다. 어떤 방식을 선택해도 일반 `GET`이 Value를 찾기 위해 매번 Disk를 읽는 구조로 바뀌지는 않습니다.

---

# 재시작 복구

Redis가 재시작하면 설정된 RDB Snapshot이나 AOF Log를 읽어 Dataset을 Memory에 다시 구성합니다. 복구가 끝난 뒤 일반 Command는 Memory의 데이터를 대상으로 실행됩니다.

따라서 Scene의 `Memory → Disk` Edge는 모든 요청이 거치는 순서가 아니라 선택적인 저장과 복구 관계를 나타냅니다.

---

# 개발자가 개입하는 지점

개발자는 허용 가능한 데이터 손실 범위, Disk I/O 비용과 복구 시간을 기준으로 RDB와 AOF 사용 여부 및 저장 주기를 정합니다. Persistence 파일의 Disk 용량, Backup과 실제 복구 절차도 함께 확인해야 합니다.

---

# 참고 자료

- [Redis — Persistence](https://redis.io/docs/latest/operate/oss_and_stack/management/persistence/)
- [Redis — Configuration](https://redis.io/docs/latest/operate/oss_and_stack/management/config/)
