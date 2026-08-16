# 한눈에 보기

Heap은 JVM이 객체와 배열을 생성하는 공유 memory 영역입니다. 하나의 JVM process 안에 있는 여러 Thread가 같은 Heap을 사용합니다.

많은 Garbage Collector는 대부분의 객체가 짧게 사용된다는 특성을 활용하기 위해 Heap을 세대별로 관리합니다. 이 Scene은 그 전형적인 흐름을 크게 보여줍니다.

```text
Young Generation                              Old Generation
┌──────────────────────────────┐              ┌───────────────┐
│ Eden → Survivor             │              │               │
│        ┌──────────────┐      │ ─Promotion→ │ Old Objects   │
│        │ S0 ⇄ S1      │      │              │               │
│        └──────────────┘      │              │               │
└──────────────────────────────┘              └───────────────┘
                  ↑                                  ↑
                  └────── Garbage Collector ─────────┘
```

새 객체는 일반적으로 Young Generation의 Eden에서 시작합니다. Garbage Collection 이후에도 필요한 객체는 S0와 S1 중 현재 `To Survivor` 역할을 맡은 공간으로 이동합니다. 다음 Garbage Collection에서는 두 공간이 역할을 바꾸며, 충분히 오래 살아남은 객체는 Old Generation으로 Promotion될 수 있습니다.

이 이동과 memory 회수를 수행하는 주체가 Garbage Collector입니다. Young 영역을 수집할 때는 도달할 수 없는 객체를 제거하고 살아남은 객체를 Survivor나 Old 영역으로 옮길 수 있습니다. Old 영역의 객체도 계속 살아 있는지 확인하고 필요 없어진 객체의 memory를 회수합니다.

---

# 구성 요소

- `Eden`: 새 객체가 일반적으로 처음 생성되는 Young Generation 영역입니다.
- `S0`, `S1`: Young GC에서 살아남은 객체를 보관하는 두 Survivor 공간입니다. 한쪽이 From, 다른 쪽이 To 역할을 맡고 GC가 끝날 때마다 역할을 교대합니다.
- `Old Objects`: 여러 번의 GC에도 살아남아 Old Generation에서 관리되는 객체입니다.
- `Garbage Collector`: GC Roots에서 객체를 따라가 생존 여부를 판단하고, 필요 없는 객체의 memory를 회수하며 살아 있는 객체를 이동할 수 있습니다.
- `Young Generation`: 새 객체와 생명주기가 짧은 객체를 주로 관리하며 비교적 자주 수집됩니다.
- `Old Generation`: 오래 살아남아 Promotion된 객체를 관리하며 일반적으로 Young 영역보다 덜 자주 수집되지만 한 번의 작업이 더 무거울 수 있습니다.

---

# 왜 세대를 나누는가

Application에서 만들어지는 많은 객체는 method 처리나 한 번의 요청이 끝나면 금방 필요 없어집니다. 새 객체가 모인 영역을 자주 확인하면 Heap 전체를 매번 같은 방식으로 검사하지 않고도 많은 memory를 회수할 수 있습니다.

반대로 여러 번의 Garbage Collection에도 살아남은 객체는 앞으로도 오래 사용할 가능성이 있다고 보고 Old Generation에서 관리합니다.

세대를 나눈다고 객체가 반드시 일정 횟수만큼 살아남아야 한다는 하나의 고정 규칙이 생기는 것은 아닙니다. Promotion 기준은 Collector, 객체 크기와 실행 상황에 따라 달라질 수 있습니다.

## Young Generation과 Old Generation의 차이

Young Generation은 새 객체가 많이 생성되고 빠르게 사라진다는 가정을 활용합니다. 죽은 객체가 많으면 살아 있는 소수의 객체만 Survivor로 옮긴 뒤 나머지 공간을 빠르게 다시 사용할 수 있습니다.

Old Generation에는 여러 번 살아남은 객체가 모입니다. 살아 있는 객체의 비율이 높은 경우가 많아 무엇이 살아 있는지 확인하고 memory를 정리하는 비용이 Young Generation보다 커질 수 있습니다.

따라서 차이는 단순히 memory 크기나 객체의 종류가 아니라 `객체가 얼마나 오래 살아남았는지`와 `어떤 방식과 빈도로 수집하는지`에 있습니다.

---

# Garbage Collector의 역할

Garbage Collector는 단순히 사용하지 않는 객체를 삭제하는 것만이 아니라, 사용하는 Collector에 따라 살아 있는 객체를 다른 memory 영역으로 옮기고 빈 memory를 다시 사용할 수 있도록 정리합니다.

내부적으로는 살아 있는 객체의 내용을 새 위치에 복사하고 객체를 가리키던 참조를 새 위치로 갱신한 다음 기존 영역을 비웁니다. 같은 객체를 두 개 남겨 두는 것이 아니므로 이 Scene에서는 이해하기 쉽게 `생존 객체 이동`이라고 표현합니다.

Scene의 `Garbage Collector → Eden` 연결은 Young Generation 수집을 대표하고, `Garbage Collector → Old Objects` 연결은 Old Generation도 수집 대상이라는 것을 보여줍니다. 실제 GC는 Eden 하나나 특정 Old 객체 하나만 확인하는 것이 아니라 해당 수집 작업의 대상 영역과 객체 관계를 함께 처리합니다.

GC 대상 판단과 수집 중 일어나는 자세한 과정, Serial·Parallel·G1·ZGC의 차이는 `Garbage Collector` Topic 설명에서 다룹니다.

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

# Collector에 따라 실제 모습은 달라집니다

`Young Generation → Old Generation`은 세대별 Garbage Collection을 이해하기 위한 대표적인 구조입니다. JVM Specification이 Heap을 반드시 Eden, Survivor와 연속된 Old 공간으로 나누도록 정한 것은 아닙니다.

예를 들어 G1은 Heap을 여러 Region으로 나누고 각 Region에 Eden, Survivor 또는 Old 역할을 부여합니다. 따라서 이 Scene의 Area는 물리적으로 항상 붙어 있는 memory 주소를 그린 것이 아니라 객체의 세대와 이동을 설명하는 논리적 구조입니다.

`S0`와 `S1`이라는 두 고정 공간을 번갈아 사용하는 그림도 전통적인 세대별 Collector를 설명하기 위한 모델입니다. 모든 Collector가 이와 동일한 물리 구조를 사용하는 것은 아닙니다.

---

# 개발자가 개입하는 지점

개발자는 JVM option으로 초기 Heap 크기와 최대 Heap 크기를 설정하고 Heap 사용량, 객체 할당 속도, Promotion과 Garbage Collection 상태를 관찰할 수 있습니다.

Heap이 계속 증가한다면 크기만 늘리기보다 필요 없는 객체가 참조로 계속 유지되는지 확인해야 합니다. Heap dump와 profiler를 이용하면 어떤 객체가 memory를 차지하고 무엇이 그 객체를 참조하는지 분석할 수 있습니다.

Collector와 세대 크기를 세밀하게 조정할 수도 있지만, 먼저 실제 응답 시간, 처리량과 GC log를 측정한 뒤 병목과 관련된 설정만 변경해야 합니다.

---

# 참고 자료

- [Java Virtual Machine Specification — Heap](https://docs.oracle.com/javase/specs/jvms/se21/html/jvms-2.html#jvms-2.5.3)
- [Oracle Java — Garbage Collector Implementation](https://docs.oracle.com/en/java/javase/21/gctuning/garbage-collector-implementation.html)
- [Oracle Java — Garbage-First Garbage Collector](https://docs.oracle.com/en/java/javase/21/gctuning/garbage-first-garbage-collector.html)
