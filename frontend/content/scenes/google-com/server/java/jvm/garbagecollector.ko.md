# 한눈에 보기

Garbage Collector는 Heap에서 더 이상 사용할 수 없는 객체가 차지한 memory를 찾아 회수하는 Execution Engine의 구성요소입니다.

Java에 memory 해제가 없는 것이 아니라, 개발자가 객체마다 직접 해제 명령을 호출하는 대신 Garbage Collector가 객체의 도달 가능성을 기준으로 정리합니다.

---

# 무엇을 정리하는가

실행 중인 thread의 Stack과 static field 같은 현재 사용 중인 기준점에서 참조를 따라가 도달할 수 있는 객체는 살아 있는 것으로 봅니다. 어느 기준점에서도 도달할 수 없는 객체는 이후 Garbage Collection의 회수 대상이 될 수 있습니다.

변수에 `null`을 대입했다고 그 순간 즉시 memory가 반환되는 것은 아닙니다. 해당 객체를 가리키는 다른 참조가 없어야 하고 Garbage Collector가 실제 수집 작업을 수행해야 합니다.

---

# GC와 Application 정지

Garbage Collector는 객체를 찾고 이동하거나 memory를 정리하는 일부 과정에서 Application thread를 멈출 수 있습니다. 이를 흔히 `Stop-The-World`라고 부릅니다.

모든 GC 작업 동안 Application이 같은 길이로 완전히 멈추는 것은 아닙니다. Collector에 따라 Application thread와 동시에 수행하는 작업의 범위와 정지 방식이 다릅니다.

따라서 GC는 memory 회수량뿐 아니라 정지 시간, 실행 빈도와 Application 응답 시간에 미치는 영향을 함께 봐야 합니다.

---

# 개발자가 개입하는 지점

개발자는 JVM option으로 Heap 크기와 Garbage Collector를 선택하고 GC log를 남길 수 있습니다. 그러나 먼저 불필요한 객체 생성, 오래 유지되는 참조와 memory leak 가능성을 Application Code에서 확인해야 합니다.

GC가 자주 실행된다고 무조건 Collector를 바꾸기보다 Heap 사용량, 객체 할당 속도, 정지 시간과 처리량을 측정해 원인을 구분합니다.

---

# 참고 자료

- [Java Virtual Machine Specification — Heap](https://docs.oracle.com/javase/specs/jvms/se21/html/jvms-2.html#jvms-2.5.3)
- [Oracle Java — Garbage Collection Tuning Guide](https://docs.oracle.com/en/java/javase/21/gctuning/)
