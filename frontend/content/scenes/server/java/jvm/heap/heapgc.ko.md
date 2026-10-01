# 한눈에 보기

Garbage Collector는 Heap에서 더 이상 도달할 수 없는 객체의 memory를 회수하고, 살아 있는 객체를 필요에 따라 Survivor나 Old Generation으로 이동시킵니다.

이 Scene에서는 Garbage Collector를 Eden, S0, S1과 Old Objects에 모두 연결해 Heap의 각 세대에 관여한다는 관계를 보여줍니다.

---

# GC 대상 기준

Garbage Collector는 단순히 `변수에 null을 넣은 객체`나 `오래된 객체`를 수집하지 않습니다. 기준은 현재 실행에 필요한 시작점인 `GC Roots`에서 참조를 따라가 객체에 도달할 수 있는지입니다.

대표적인 GC Roots에는 다음과 같은 참조가 포함됩니다.

- 실행 중인 Thread의 JVM Stack frame에 있는 local variable과 parameter
- Class의 static field에서 가리키는 객체
- JVM 내부에서 유지하는 참조와 JNI 같은 native code의 참조

GC Roots에서 참조를 따라 도달할 수 있는 객체와 그 객체가 가리키는 객체는 살아 있습니다. 반대로 객체끼리 서로 순환 참조하더라도 그 묶음 전체가 GC Roots에서 도달할 수 없다면 수집 대상이 될 수 있습니다.

도달할 수 없다고 판단된 객체가 그 순간 하나씩 삭제되는 것은 아닙니다. 해당 Garbage Collection이 그 객체가 차지한 memory를 다시 사용할 수 있도록 회수합니다.

---

# GC 중에 일어나는 일

Collector마다 세부 알고리즘은 다르지만 크게 다음 작업이 일어납니다.

1. `수집 범위 결정`: Young Generation, 일부 Region 또는 더 넓은 Heap 중 이번에 확인할 범위를 정합니다.
2. `GC Roots 확인`: Roots에서 참조를 따라가 도달 가능한 객체를 찾습니다.
3. `생존 객체 처리`: Collector에 따라 객체를 그대로 두고 표시하거나, Survivor·Old 또는 다른 Region으로 옮깁니다.
4. `참조 갱신`: 객체가 이동했다면 그 객체를 가리키는 참조가 새 위치를 가리키도록 바꿉니다.
5. `memory 회수`: 도달할 수 없는 객체가 사용하던 공간과 이동 후 비워진 공간을 다시 할당할 수 있게 만듭니다.

일부 단계에서는 Application Thread를 모두 멈추는 `Stop-The-World`가 발생합니다. G1이나 ZGC처럼 Application과 동시에 수행하는 작업이 많은 Collector도 모든 단계를 완전히 정지 없이 처리하는 것은 아닙니다. Collector 선택에서는 총 처리량뿐 아니라 정지 시간도 중요합니다.

`삭제`는 객체의 destructor를 하나씩 호출한다는 뜻이 아닙니다. GC는 더 이상 도달할 수 없는 객체가 차지한 memory를 재사용할 수 있게 만드는 작업입니다.

---

# Young Generation 수집

Young Generation을 수집할 때 Garbage Collector는 Eden과 현재 From Survivor의 객체를 확인합니다.

- 도달할 수 없는 객체가 차지한 memory는 회수합니다.
- 살아 있는 객체는 To Survivor로 이동할 수 있습니다.
- 충분히 오래 살아남았거나 Survivor에 두기 어려운 객체는 Old Generation으로 Promotion될 수 있습니다.
- 수집이 끝나면 S0와 S1의 From·To 역할이 교대됩니다.

Scene에서 S0와 S1이 모두 Garbage Collector에 연결되어 있지만, 한 번의 수집에서 두 공간을 똑같이 사용하는 것은 아닙니다. 그 시점에 한쪽은 기존 생존 객체를 읽는 From Survivor이고 다른 쪽은 살아남은 객체를 받는 To Survivor입니다.

이동은 내부적으로 객체 내용을 To Survivor의 새 위치에 복사하고 참조를 갱신한 뒤 From Survivor를 비우는 방식으로 이뤄질 수 있습니다. 객체가 두 개로 늘어나는 것은 아닙니다.

이 과정을 흔히 `Minor GC`라고 설명하지만, 정확한 event 이름과 대상 범위는 Garbage Collector와 GC log의 표기에 따라 확인해야 합니다.

---

# Old Generation 수집

Old Generation의 객체도 더 이상 도달할 수 없다면 회수 대상이 됩니다. 일반적으로 Young Generation보다 살아 있는 객체가 많고 수집 범위가 커질 수 있어 더 많은 비용이 들 수 있습니다.

`Major GC`, `Old GC`, `Full GC`는 모든 Garbage Collector에서 완전히 같은 의미로 사용되는 용어가 아닙니다. 특히 `Full GC`는 보통 Heap 전체에 가까운 넓은 범위를 다루는 작업을 가리키므로 단순히 Old Generation만 정리하는 작업과 같다고 보면 안 됩니다.

---

# Garbage Collector 종류

아래는 HotSpot JVM에서 대표적으로 접하는 Collector입니다. 하나가 모든 상황에서 가장 좋은 것은 아니며 Heap 크기, CPU, 처리량과 허용 가능한 정지 시간에 따라 선택이 달라집니다.

## Serial GC

하나의 GC Thread가 수집 작업을 수행합니다. 구조가 단순하고 GC Thread 사이의 조정 비용이 적어 작은 Heap이나 제한된 실행 환경에 적합할 수 있습니다. GC 중에는 Application이 멈추므로 큰 Heap이나 짧은 응답 시간이 중요한 Server에는 불리할 수 있습니다.

대표 option은 `-XX:+UseSerialGC`입니다.

## Parallel GC

여러 GC Thread가 수집 작업을 병렬로 수행합니다. Application을 멈춘 동안 여러 CPU를 사용해 GC 작업을 빨리 끝내고 전체 처리량을 높이는 데 초점을 둡니다. 짧고 예측 가능한 정지 시간보다 처리량이 중요한 작업에 어울릴 수 있습니다.

대표 option은 `-XX:+UseParallelGC`입니다.

## G1 GC

Heap을 동일한 크기의 여러 Region으로 나누고 각 Region에 Eden, Survivor와 Old 역할을 부여합니다. Young 영역과 일부 Old Region을 선택해 점진적으로 회수하며 목표 정지 시간을 맞추는 것과 처리량 사이의 균형을 추구합니다. Server급 환경의 HotSpot JVM에서 일반적으로 기본 Collector로 선택됩니다.

대표 option은 `-XX:+UseG1GC`입니다.

## ZGC

Application과 동시에 수행하는 작업을 크게 늘려 매우 짧은 정지 시간을 목표로 하는 Collector입니다. 큰 Heap과 낮은 latency가 중요한 Application에 적합할 수 있지만, 동시 작업을 위한 CPU와 memory 비용이 추가될 수 있습니다.

대표 option은 `-XX:+UseZGC`입니다.

사용하는 Java version에 따라 세대별 ZGC의 기본 여부와 option이 달라질 수 있으므로 배포 JDK의 문서를 확인해야 합니다.

Collector는 이름만 보고 고르지 않습니다. 특별한 latency 요구사항이 없다면 JVM 기본값에서 시작하고, 실제 GC log와 응답 시간·처리량을 측정한 뒤 변경하는 편이 안전합니다.

---

# 개발자가 개입하는 지점

개발자는 Garbage Collector 종류와 Heap 크기를 설정하고 GC log를 통해 수집 대상, 정지 시간, 회수량과 Promotion 양을 확인할 수 있습니다.

GC가 자주 실행된다는 사실만으로 문제가 있다고 판단하지 않습니다. Young GC가 짧게 자주 실행되는 상황과 Old 영역이 계속 증가하며 긴 정지가 발생하는 상황은 원인과 대응이 다를 수 있습니다.

---

# 참고 자료

- [Oracle Java — Garbage Collector Implementation](https://docs.oracle.com/en/java/javase/21/gctuning/garbage-collector-implementation.html)
- [Oracle Java — Available Collectors](https://docs.oracle.com/en/java/javase/21/gctuning/available-collectors.html)
- [Oracle Java — Garbage-First Garbage Collector](https://docs.oracle.com/en/java/javase/21/gctuning/garbage-first-g1-garbage-collector1.html)
- [Oracle Java — Garbage Collection Tuning Guide](https://docs.oracle.com/en/java/javase/21/gctuning/)
