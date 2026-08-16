# 한눈에 보기

Old Objects는 여러 번의 Garbage Collection에도 살아남아 Old Generation에서 관리되는 객체를 뜻합니다.

오랫동안 사용하는 Cache 객체, Application 전체에서 유지되는 상태와 생명주기가 긴 객체 등이 이 영역에 남을 수 있습니다. 객체의 종류만으로 위치가 정해지는 것은 아니며 실제 도달 가능성과 생존 기간이 중요합니다.

---

# Old Generation의 정리

Old Generation도 Garbage Collection의 대상입니다. 다만 Young Generation보다 살아 있는 객체가 많고 영역을 검사하거나 정리하는 비용이 커질 수 있습니다.

어떤 Collector는 Young 영역과 Old 영역을 구분해 수집하고, 어떤 Collector는 여러 Region을 선택하거나 Heap 전체를 함께 다룹니다. `Major GC`, `Old GC`, `Full GC` 같은 표현은 Collector와 도구에 따라 의미가 정확히 같지 않을 수 있으므로 GC log의 실제 event 이름과 범위를 확인해야 합니다.

---

# 개발자가 개입하는 지점

개발자는 Old Generation 사용량과 Promotion 속도, GC 정지 시간과 memory 회수량을 관찰합니다.

Old 영역의 사용량이 계속 증가하고 Garbage Collection 이후에도 줄어들지 않는다면 오래 유지되는 참조나 memory leak 가능성을 확인합니다. Cache처럼 의도적으로 오래 유지하는 객체라면 최대 크기와 제거 정책도 함께 설계해야 합니다.

---

# 참고 자료

- [Oracle Java — Garbage Collector Implementation](https://docs.oracle.com/en/java/javase/21/gctuning/garbage-collector-implementation.html)
- [Oracle Java — Garbage-First Garbage Collector](https://docs.oracle.com/en/java/javase/21/gctuning/garbage-first-garbage-collector.html)
