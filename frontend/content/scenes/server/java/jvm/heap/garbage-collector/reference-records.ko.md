# 한눈에 보기

Card Table과 Remembered Set은 GC가 Heap 전체를 다시 훑지 않고 필요한 Reference를 찾도록 돕는 추적 자료구조입니다.

---

# Card Table

Card Table은 Heap을 작은 Card 단위로 나누고 Reference 변경이 있었던 구역을 표시합니다. Old 영역의 Card가 Dirty 상태로 표시되면 Young GC는 Old 전체 대신 해당 구역을 우선 확인해 실제 Old→Young Reference를 찾을 수 있습니다.

Card가 표시됐다고 그 안의 모든 객체가 Young 객체를 가리킨다는 뜻은 아닙니다. 다시 확인해야 할 Memory 구역을 비교적 거친 단위로 알려주는 정보입니다.

---

# Remembered Set

Remembered Set은 수집하려는 Memory 영역으로 외부에서 들어오는 Reference 정보를 관리합니다. G1처럼 일부 Region을 선택해 수집하는 Collector는 이 정보를 이용해 Heap 전체를 다시 훑지 않고 선택한 Region의 살아 있는 객체를 찾을 수 있습니다.

---

# 둘의 차이와 관계

Card Table은 Reference 변경이 있었던 구역을 표시하고, Remembered Set은 특정 수집 영역으로 들어오는 외부 Reference를 관리하는 데 초점을 둡니다. 따라서 둘은 같은 개념이나 단순한 대체 관계가 아닙니다.

Collector 구현에서는 Card 단위 정보가 Remembered Set을 구성하거나 갱신하는 데 사용될 수 있습니다. Write Barrier는 Reference가 바뀌는 시점에 이런 추적 정보를 갱신할 수 있도록 추가 처리를 수행합니다.

---

# 참고 자료

- [Oracle Java 21 Garbage-First Garbage Collector](https://docs.oracle.com/en/java/javase/21/gctuning/garbage-first-garbage-collector.html)
