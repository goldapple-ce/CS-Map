# 한눈에 보기

Write Barrier는 객체의 Reference가 바뀔 때 GC가 필요한 추적 정보를 갱신하도록 실행되는 추가 처리입니다.

---

# 왜 필요할까

Old 객체가 Young 객체를 가리키기 시작했는데 JVM이 이를 기록하지 않으면 Young GC는 Old 전체를 확인해야 할 수 있습니다. Write Barrier는 Reference 대입 경로에서 변경을 감지해 Card Table을 표시하거나 Remembered Set을 갱신할 재료를 남깁니다. Barrier 자체가 Reference를 저장하는 자료구조는 아닙니다.

이 처리에는 조건 검사와 추가 Memory 쓰기 같은 작은 비용이 듭니다. 대신 수집 시 확인할 범위를 줄여 큰 탐색 비용과 pause를 낮출 수 있습니다.

---

# Concurrent Marking

GC가 Application과 동시에 Mark 작업을 하면 조사 중에도 객체 관계가 바뀝니다. Collector는 Barrier로 변경을 추적해 살아 있는 객체를 놓치지 않도록 합니다.

예를 들어 G1의 SATB는 Mark 시작 시점의 객체 관계를 보존하는 관점으로 이전 Reference를 기록합니다. 다른 Collector는 Mark 중 새 관계를 반영하는 Incremental Update 같은 접근을 사용할 수 있습니다. 구체적인 Barrier와 기록 방식은 Collector마다 다릅니다.

---

# 참고 자료

- [OpenJDK G1 GC Tuning Guide](https://docs.oracle.com/en/java/javase/21/gctuning/garbage-first-garbage-collector-tuning.html)
