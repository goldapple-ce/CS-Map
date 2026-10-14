# 한눈게 보기

Concurrent Mark는 Initial Mark에서 확보한 탐색 대상을 시작으로 Object Graph를 탐색하며 살아 있는 Object를 식별합니다.
Application Thread와 동시에 탐색하므로 Reference 변경은 Barrier로 추적하고, 남은 Mark 작업은 Remark에서 마무리합니다.
세대 및 영역 간 Reference는 Card Table과 RSet을 활용해 관리하며 불필요한 탐색을 줄입니다.

---

# Concurrent Mark란?

Initial Mark 이후 Application `Thread와 동시에 Object Graph를 탐색`하는 단계입니다. Reference를 따라 Reachable한 Object를 Mark하고, 이후 메모리 회수에 필요한 생존 정보를 수집합니다. 대부분의 탐색을 STW 없이 수행해 Application의 Pause를 줄이는 것이 목적입니다.

---

# Object Graph는 어떻게 탐색하나요?

GC는 Initial Mark에서 확보한 탐색 대상을 시작으로 Reference를 따라 연결된 Object를 탐색합니다. 예를 들어 다음과 같은 코드가 있다고 가정하겠습니다.

```java
class Node {
    Node child;
}

Node a = new Node();
Node b = new Node();
Node c = new Node();

a.child = b;
b.child = c;
```

GC Roots에서 A를 참조하고 있다면 GC는 `A → B → C` 순서로 Reference를 따라 탐색합니다. 이미 탐색한 Object는 다시 탐색하지 않으므로 순환 참조가 존재해도 무한히 반복되지 않습니다.

---

# Application Thread와 동시에 탐색해도 정확성을 보장할 수 있나요?

단순히 동시에 탐색하는 것만으로는 정확성을 보장할 수 없습니다. Application Thread가 실행되는 동안 Reference가 변경되면 GC가 살아 있는 Object를 놓칠 수 있기 때문입니다.
예를 들어 GC가 A의 탐색을 마친 이후 Reference 관계가 변경되면, 특정 조건에서 아직 탐색하지 않은 Object를 발견하지 못할 수 있습니다.
이를 방지하기 위해 GC는 `Barrier`를 사용합니다. Barrier는 Reference 변경 시 필요한 정보를 기록하거나 Mark 상태를 갱신해 `GC가 변경 사항을 추적하`도록 돕습니다. GC는 이러한 정보를 Concurrent Mark 중에도 처리하며, 다음 단계인 `Remark`에서 남은 Mark 작업을 마무리합니다.

---

# 다른 영역의 Reference는 어떻게 파악하나요?

Object Graph를 탐색할 때는 GC Roots에서 연결된 Object를 따라가면 됩니다. 하지만 Heap의 일부 영역만 회수할 때는 다른 영역에서 참조하고 있는 Object도 고려해야 합니다.
예를 들어 Old Generation의 Object가 Young Generation의 Object를 참조하고 있다고 가정하겠습니다. Young Generation 내부만 탐색한다면 외부에서 들어오는 Reference를 놓칠 수 있습니다. 그렇다고 Young GC마다 Old Generation 전체를 탐색하는 것은 비효율적입니다.
이를 해결하기 위해 `Card Table`과 `Remembered Set(RSet)` 같은 자료구조를 활용합니다.

- `Card Table`: Reference 변경이 발생한 메모리 영역을 기록합니다.
- `Remembered Set(RSet)`: 다른 영역에서 들어오는 Reference의 위치를 관리합니다.

CMS GC에서는 Concurrent Preclean 과정에서 Card Table을 활용하고, G1 GC에서는 Card Table과 RSet을 활용해 Region 간 Reference를 관리합니다. 이를 통해 불필요한 Heap 전체 탐색을 줄일 수 있습니다.
