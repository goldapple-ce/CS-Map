# 한눈에 보기

Heap은 JVM이 객체와 배열을 생성하는 공유 memory 영역입니다. 하나의 JVM process 안에 있는 여러 Thread가 같은 Heap을 사용합니다.

Garbage Collector는 Heap에서 더 이상 도달할 수 없는 객체를 찾아 memory를 회수합니다. 변수에 `null`을 대입했다고 객체가 즉시 삭제되는 것은 아니며 다른 참조가 없어야 하고 실제 Garbage Collection도 수행되어야 합니다.

---

# Heap과 객체 참조

method 안의 local variable은 JVM Stack의 frame에 존재할 수 있지만, 그 변수가 가리키는 객체는 Heap에 존재할 수 있습니다.

```text
Thread의 JVM Stack              공유 Heap
┌─────────────────┐           ┌──────────────┐
│ order 참조 ─────┼──────────→│ Order 객체   │
└─────────────────┘           └──────────────┘
```

서로 다른 Thread의 local variable이 같은 Heap 객체를 가리킬 수도 있습니다. 그 객체의 변경 가능한 상태를 동시에 수정한다면 동시성 제어가 필요합니다.

---

# 개발자가 개입하는 지점

개발자는 JVM option으로 초기 Heap 크기와 최대 Heap 크기를 설정하고 Heap 사용량, 객체 할당 속도와 Garbage Collection 상태를 관찰할 수 있습니다.

Heap이 계속 증가한다면 크기만 늘리기보다 필요 없는 객체가 참조로 계속 유지되는지 확인해야 합니다. Heap dump와 profiler를 이용하면 어떤 객체가 memory를 차지하고 무엇이 그 객체를 참조하는지 분석할 수 있습니다.

---

# 참고 자료

- [Java Virtual Machine Specification — Heap](https://docs.oracle.com/javase/specs/jvms/se21/html/jvms-2.html#jvms-2.5.3)
- [Oracle Java — Java Command Options](https://docs.oracle.com/en/java/javase/21/docs/specs/man/java.html)
