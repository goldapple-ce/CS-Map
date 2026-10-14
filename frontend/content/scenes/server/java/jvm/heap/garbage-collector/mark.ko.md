# 한눈에 보기

Mark는 GC Roots에서 Reference를 따라 탐색하며 Reachable Object를 식별하는 과정입니다.
Stop-The-World(STW)는 Reference 변경을 막아 안전하게 Mark하지만, 긴 Pause가 발생할 수 있습니다.
Concurrent Marking은 Application과 동시에 Mark를 수행하고, Barrier로 Reference 변경을 추적해 Pause를 줄입니다.

---

# Mark란?

GC가 Memory를 회수하기 전에 살아 있는 Object를 식별하는 과정입니다.
`GC Roots에서 시작해 Reference를 따라가며 Object를 탐색`하고, 도달할 수 있는 Object를 살아 있다고 표시합니다.
`Mark가 끝난 뒤에도 표시되지 않은 Object는 Garbage`로 판단할 수 있습니다.

---

# Mark 중에 Reference가 변경되면?

Mark는 Object의 Reference를 따라가며 탐색합니다. 그런데 Application Thread가 실행 중이라면 Reference가 변경될 수 있습니다.

예를 들어 처음에는 A가 B를 참조하고 있습니다.

```java
a.child = b;
```

그런데 GC가 탐색하는 도중 Reference가 변경됩니다.

```java
a.child = c;
```

이렇게 되면 GC가 탐색한 Reference와 실제 Reference가 달라질 수 있습니다.
최악의 경우 `살아 있는 Object를` GC가 발견하지 못하고 `Garbage로 판단`할 수도 있습니다.

## 어떻게 해결하나요?

가장 단순한 해결 방법은 Mark가 끝날 때까지 Application Thread를 멈추는 것입니다. 이를 `Stop-The-World(STW)`라고 합니다.
하지만 Heap이 크거나 살아 있는 Object가 많으면 `Mark 시간이 길어지고`, 그만큼 Application도 오래 멈추게 됩니다.
이 작업을 Application Thread와 동시에 수행한다면 STW 시간을 줄일 수 있지 않을까요? 이러한 접근 방식이 `Concurrent Marking`입니다.

---

# Concurrent Marking이란?

`Application Thread를 계속 실행`하면서 GC가 동시에 Mark를 수행하는 방식입니다.
Mark 전체를 STW로 수행하는 대신 대부분의 탐색을 Application과 동시에 진행해 Pause를 줄입니다. 대표적으로 다음 세 단계로 진행됩니다.

- `Initial Mark`: STW 상태에서 탐색의 출발점을 확인합니다.
- `Concurrent Mark`: Application Thread와 동시에 Object Graph를 탐색합니다.
- `Remark`: STW 상태에서 변경 사항을 반영하고 Mark를 마무리합니다.

다만 Concurrent Mark 중에는 Application Thread가 Reference를 변경할 수 있어, 살아 있는 Object를 놓칠 위험이 있습니다.
이를 방지하기 위해 GC는 Write Barrier를 활용해 Reference 변경 정보를 추적하고, Remark 과정에서 처리합니다.

## 모든 GC에서 Concurrent Marking을 사용할까요?

`Young Generation`은 대부분의 Object가 빠르게 Garbage가 되므로 비교적 짧은 `STW`로 메모리를 회수할 수 있습니다.
반면 `Old Generation`은 살아 있는 Object가 많아 Mark에 오랜 시간이 걸릴 수 있으므로, 긴 STW를 줄이기 위해 `Concurrent Marking을 사용`합니다.
