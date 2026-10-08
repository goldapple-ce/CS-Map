# 한눈에 보기

Old Objects는 여러 번의 수집에도 살아남아 Old Generation에 놓인 객체입니다.

---

# 오래 산 객체와 Reference

Old 객체는 Cache나 Application 전역 상태처럼 실제로 오래 필요할 수도 있고, 불필요하지만 Reference가 남아 있어 수집되지 못한 객체일 수도 있습니다. Old 사용량이 GC 뒤에도 계속 증가한다면 GC Monitoring으로 추세를 확인하고 필요하면 Heap Dump로 객체를 붙잡는 Reference 경로를 분석합니다.

Old 객체가 Young 객체를 가리키면 Young GC도 그 Reference를 알아야 합니다. Old 전체를 매번 탐색하는 대신 Reference가 저장되는 순간 Write Barrier가 추적 정보를 갱신할 수 있습니다.

---

# Old와 Full GC

Major GC는 흔히 Old Generation 수집을 뜻하지만 Collector와 도구에 따라 가리키는 범위가 다를 수 있습니다. Full GC는 일반적으로 Young과 Old를 포함한 넓은 범위를 수집하며, 경우에 따라 Class unloading 같은 작업도 함께 일어날 수 있습니다.

Young GC, Major GC, Full GC는 반드시 차례로 실행되는 단계 이름이 아닙니다. 실제 수집 범위와 pause는 사용하는 Collector의 문서와 GC Log로 확인해야 합니다.

Old 영역은 크고 오래 살아남은 객체가 많아 수집 비용이 커질 수 있습니다. G1과 ZGC 같은 Collector는 일부 작업을 Application과 동시에 수행해 pause를 줄이지만, 구체적인 방식과 정지 구간은 Collector마다 다릅니다.

---

# 참고 자료

- [Oracle Java 21 Generations](https://docs.oracle.com/en/java/javase/21/gctuning/generations.html)
- [Oracle Java 21 Garbage-First Garbage Collector](https://docs.oracle.com/en/java/javase/21/gctuning/garbage-first-garbage-collector.html)
- [Oracle Java 21 Z Garbage Collector](https://docs.oracle.com/en/java/javase/21/gctuning/z-garbage-collector.html)
