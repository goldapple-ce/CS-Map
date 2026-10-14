# 한눈에 보기

Concurrent Marking은 Application Thread와 동시에 Object를 탐색하기 때문에 Reference가 변경되면 살아 있는 Object를 놓칠 수 있습니다.
CMS는 `Incremental Update`를 사용해 변경된 Reference를 다시 확인하며, 이 과정에서 Card Table과 Mod Union Table을 활용합니다.
G1은 `SATB(Snapshot At The Beginning)`를 사용해 Reference 변경 이전의 정보를 보존함으로써 Concurrent Marking의 정확성을 유지합니다.

---

# Concurrent Marking에서 발생하는 문제

STW 상태에서 수행하는 Marking은 Application Thread가 중단되어 있으므로 Object의 Reference가 변경되지 않습니다.
반면 Concurrent Marking은 Application Thread와 동시에 실행되므로 GC가 Object를 탐색하는 도중 Reference가 변경될 수 있습니다.
이 문제를 이해하려면 먼저 Tri-color Marking을 알아야 합니다.

## Tri-color Marking이란?

Tri-color Marking은 GC가 Object의 Reference를 탐색하는 과정을 세 가지 상태로 구분하는 모델입니다.

- White: 아직 발견되지 않은 Object
- Gray: 발견했지만 Reference 탐색이 끝나지 않은 Object
- Black: Reference 탐색까지 끝난 Object

GC는 GC Roots에서 도달 가능한 Object를 찾아 Gray로 표시하고, 해당 Object의 Reference를 탐색하면서 새로운 Object를 발견합니다. 탐색이 끝난 Object는 Black으로 변경됩니다.
이 과정을 반복하면 살아 있는 Object들을 찾을 수 있지만, Concurrent Marking에서는 Reference 변경 때문에 문제가 발생할 수 있습니다.

## Reference가 변경되면 어떤 문제가 발생할까?

다음과 같은 Object가 있다고 가정하겠습니다.

```java
class Node {
Node child;
}

Node a = new Node();
Node b = new Node();
Node c = new Node();

a.child = null;
b.child = c;
```

a와 b는 GC Roots에서 도달할 수 있으며, c는 b를 통해 도달할 수 있습니다.
Concurrent Marking 도중 다음과 같은 상태라고 가정하겠습니다.

- a: Black
- b: Gray
- c: White

이때 Application Thread가 다음 코드를 실행합니다.

```java
a.child = c;
b.child = null;
```

이제 c는 a를 통해 여전히 Reachable합니다. 하지만 GC는 이미 a의 Reference 탐색을 끝냈고, 아직 탐색하지 않은 b에서는 c로 향하는 Reference가 사라졌습니다.
따라서 아무런 조치 없이 Marking을 종료한다면 살아 있는 c가 White 상태로 남아 잘못 회수될 위험이 있습니다.
이 문제를 해결하기 위해 CMS에서는 Incremental Update를, G1에서는 SATB를 사용합니다.

---

# Incremental Update란?

Incremental Update는 Concurrent Marking 도중 Application Thread가 Reference를 변경하더라도, 살아 있는 Object를 놓치지 않도록 하는 알고리즘입니다.
CMS는 Reference가 변경된 메모리 영역을 기록하고, 해당 영역을 다시 탐색하는 방식으로 Incremental Update를 구현합니다.

## 어떻게 동작할까?

Concurrent Marking은 Application Thread와 동시에 Object를 탐색하므로, 이미 탐색한 Object의 Reference가 변경될 수 있습니다.
예를 들어 다음과 같은 Object가 있다고 가정하겠습니다.

```java
class Node {
    Node child;
}

Node a = new Node();
Node b = new Node();
Node c = new Node();

a.child = null;
b.child = c;
```

a와 b는 GC Roots에서 도달 가능한 Object입니다. Concurrent Marking 도중 다음과 같은 상태라고 가정하겠습니다.

- `a`: Black. Reference 탐색이 끝난 Object
- `b`: Gray. 발견했지만 Reference 탐색이 끝나지 않은 Object
- `c`: White. 아직 발견되지 않은 Object

이때 Application Thread가 다음 코드를 실행합니다.

```java
a.child = c;
b.child = null;
```

c는 a를 통해 여전히 Reachable하지만, GC는 이미 a의 탐색을 끝냈습니다. 또한 b에서 c로 향하는 Reference도 사라졌으므로, GC가 c를 발견하지 못할 수 있습니다.
Incremental Update는 이러한 문제를 해결하기 위해 `Reference 변경이 발생한 Object를 다시 탐색`하도록 합니다.
CMS에서는 Barrier가 Reference 변경을 감지하고, 해당 Card를 Card Table에 Dirty로 표시합니다. 이후 CMS는 변경 정보를 Mod Union Table에 반영하고, 해당 영역을 다시 탐색합니다.

## Mod Union Table이란?

Mod Union Table은 CMS가 Concurrent Marking 중 다시 검사해야 할 메모리 영역을 기록하기 위해 사용하는 자료구조입니다.
구체적으로는 Heap을 Card 단위로 나누어 관리하는 `Bitmap`이며, Card 하나에 1Bit가 대응합니다.

- `0`: 현재 Mod Union Table에 재검사 대상으로 기록되지 않은 Card
- `1`: CMS가 다시 검사해야 할 대상으로 기록된 Card

예를 들어 앞선 코드에서 a가 Old Generation의 Card A에 존재한다고 가정하겠습니다.

```java
a.child = c;
```

CMS가 Card A의 변경 정보를 Mod Union Table에 반영하면 다음과 같은 상태가 됩니다.

- Card A에 대응하는 Bit: 1

여기서 1은 a가 c를 참조한다는 의미가 아닙니다. 단지 `Card A에 다시 검사해야 할 Reference가 존재할 수 있다`는 의미입니다.
CMS는 이 정보를 확인해 Card A에 포함된 Object의 Reference를 다시 탐색합니다. 그리고 새로운 Reference를 발견하면 해당 Object를 Marking 대상에 포함합니다.
실제 HotSpot에서는 `CMSBitMap`이라는 자료구조를 사용하며, Mod Union Table의 각 Bit가 Card 하나에 대응하도록 구현되어 있습니다.

### Card Table과 무엇이 다를까?

CMS에서는 Card Table과 Mod Union Table을 모두 사용합니다. 두 자료구조는 동일한 Heap의 Card를 관리하지만, 목적과 저장 방식이 다릅니다.

- `Card Table`: Card마다 1Byte의 상태값(Clean, Dirty 등)을 저장하며, Young GC의 세대 간 Reference 추적과 Reference 변경 기록에 사용합니다.
- `Mod Union Table`: Card마다 1Bit(0, 1)를 저장하며, CMS의 Concurrent Marking에서 다시 검사해야 할 영역을 관리합니다.

그렇다면 비슷한 자료구조를 왜 두 개나 사용하는 걸까요?
CMS의 Concurrent Marking 도중에도 Young GC가 발생할 수 있기 때문입니다. Young GC가 Card Table의 Dirty 정보를 처리하더라도, CMS가 해당 Reference 변경을 확인한 것은 아닙니다.
예를 들어 CMS의 Concurrent Marking 도중 다음 코드가 실행되었다고 가정하겠습니다.

```java
// a, c 모두 Old Generation
a.child = c;
```

이때 a의 Reference 필드가 위치한 Card A가 Dirty로 표시됩니다. 하지만 CMS가 해당 변경을 처리하기 전에 Young GC가 발생한다면 어떻게 될까요?

1. `Reference 변경`: Card Table의 Card A가 Dirty로 표시됩니다. Mod Union Table은 아직 0입니다.
2. `Young GC 발생`: Young GC가 Card Table을 검사하면서 Card A의 변경 정보를 Mod Union Table에 보존합니다.
3. `Card 상태 갱신`: Card A에 Old → Young Reference가 없다면 Card Table은 Clean으로 변경될 수 있지만, Mod Union Table은 1을 유지합니다.
4. `CMS 재탐색`: CMS는 Mod Union Table에 기록된 Card A를 다시 검사하여 변경된 Reference를 Marking에 반영합니다.

즉, Young GC가 Card Table을 Clean으로 변경하더라도 CMS는 Mod Union Table에 남아 있는 정보를 이용해 변경된 Reference를 확인할 수 있습니다.
반대로 Card Table이 Dirty이지만 Mod Union Table은 0인 상태도 가능합니다. Reference 변경이 발생했지만 아직 Mod Union Table에 반영되지 않은 경우입니다.
결국 `Card Table과 Mod Union Table은 같은 Card를 관리하지만, Young GC와 Concurrent Marking이 서로 독립적으로 변경 정보를 처리할 수 있도록 분리한 자료구조`입니다.

---

# SATB(Snapshot At The Beginning)란?

SATB는 G1 GC에서 Concurrent Marking의 정확성을 유지하기 위해 사용하는 알고리즘입니다.
CMS의 Incremental Update가 Reference 변경 이후의 참조 관계를 추적한다면, SATB는 `Marking 시작 시점의 참조 관계를 보존`하는 방식입니다.
여기서 Snapshot은 실제 Heap을 복사한다는 의미가 아닙니다. Marking 시작 시점에 Reachable했던 Object를 이번 Marking에서도 살아 있는 것으로 취급한다는 의미입니다.

## 어떻게 동작할까?

앞서 Incremental Update에서 사용한 Tri-color Marking 예시를 다시 살펴보겠습니다.
Concurrent Marking 도중 다음과 같은 상태라고 가정하겠습니다.

- `a`: Black. Reference 탐색이 끝난 Object
- `b`: Gray. 발견했지만 Reference 탐색이 끝나지 않은 Object
- `c`: White. 아직 발견되지 않은 Object

```java
// a와 b는 GC Roots에서 도달 가능
// b를 통해 c에 도달할 수 있는 상태

a.child = null;
b.child = c;
```

이때 Application Thread가 다음과 같이 Reference를 변경합니다.

```java
a.child = c;
b.child = null;
```

c는 여전히 a를 통해 Reachable하지만, GC는 이미 a의 탐색을 끝냈습니다. 또한 b에서 c로 향하는 Reference도 사라졌으므로 c를 놓칠 수 있습니다.
SATB는 이 문제를 해결하기 위해 `Reference가 변경되기 전의 값`을 기록합니다.
앞선 예시에서는 `b.child = null`이 실행되기 전에 기존 Reference인 c를 기록합니다. 따라서 b에서 c로 향하는 Reference가 사라지더라도 GC는 기록된 c를 통해 Marking을 이어갈 수 있습니다.
이러한 동작은 `Pre-write Barrier`를 통해 이루어집니다. Pre-write Barrier는 Reference 필드에 새로운 값을 저장하기 전에 기존 값을 확인하고, 필요한 경우 해당 Reference를 기록합니다.
즉, SATB는 Reference 변경 이후의 Object를 다시 탐색하기보다 `기존 Reference를 보존하여 Marking 시작 시점에 살아 있던 Object를 놓치지 않는 방식`입니다.

## SATB Queue란?

SATB Queue는 Pre-write Barrier가 수집한 기존 Reference를 GC가 처리할 수 있도록 보관하는 자료구조입니다.
G1에서는 Application Thread별 SATB Buffer를 사용하며, 기록된 Reference를 GC Thread가 처리할 수 있도록 관리합니다.
예를 들어 다음 코드가 실행된다고 가정하겠습니다.

```java
// 기존 Reference
b.child = c;

// Concurrent Marking 도중 변경
b.child = null;
```

처리 과정은 다음과 같습니다.

1. `Pre-write Barrier`: b.child에 저장된 기존 Reference인 c를 확인합니다.
2. `SATB Buffer`: c를 기록합니다.
3. `Reference 변경`: b.child를 null로 변경합니다.
4. `Marking`: GC가 기록된 c를 확인하고, 아직 Mark되지 않았다면 탐색 대상으로 처리합니다.

여기서 SATB Queue가 저장하는 것은 Card의 상태나 위치가 아니라 `기존 Object를 가리키는 Reference 값`입니다.
또한 모든 Reference 변경이 반드시 Queue에 기록되는 것은 아닙니다. SATB 기록은 Concurrent Marking이 활성화된 동안 필요하며, 기존 Reference가 null인 경우 등에는 기록을 생략할 수 있습니다.
Application Thread가 실행되는 동안 GC는 SATB Queue의 기록을 처리할 수 있습니다. 아직 처리되지 않은 기록이 남아 있다면 이후 Remark에서 마무리합니다.

## Incremental Update와 무엇이 다를까?

두 알고리즘 모두 Concurrent Marking 중 Reference 변경으로 살아 있는 Object를 놓치는 문제를 해결하지만, 기록하는 정보가 다릅니다.
다음과 같은 Reference 변경이 발생했다고 가정하겠습니다.

```java
// 기존 Reference
a.child = b;

// Concurrent Marking 도중 변경
a.child = c;
```

CMS의 Incremental Update는 `a.child가 변경되었다는 사실`을 기록합니다. 이후 변경된 Card를 다시 검사하여 새로운 Reference인 c를 발견할 수 있도록 합니다.
반면 G1의 SATB는 `a.child에 저장되어 있던 기존 Reference인 b`를 기록합니다. 이를 통해 Marking 시작 시점에 살아 있던 b가 이후 Reachable하지 않게 되더라도 이번 Marking에서 누락되지 않도록 합니다.
따라서 두 방식의 차이는 다음과 같습니다.

- `Incremental Update(CMS)`: 변경된 Reference를 다시 확인하는 방식. Card Table과 Mod Union Table 활용
- `SATB(G1)`: 변경 이전 Reference를 보존하는 방식. Pre-write Barrier와 SATB Queue 활용

이러한 차이 때문에 SATB에서는 이미 Garbage가 된 Object를 이번 Marking에서 살아 있는 것으로 판단할 수 있습니다.
예를 들어 Marking 시작 시점에 a가 b를 참조했지만, 이후 `a.child = null`이 실행되어 b가 더 이상 Reachable하지 않더라도 SATB는 기존 Reference인 b를 보존합니다.
이처럼 현재는 Garbage이지만 이번 GC에서 회수되지 않는 Object를 `Floating Garbage`라고 합니다. 다만 Floating Garbage는 SATB에만 존재하는 현상은 아니며 CMS에서도 발생할 수 있습니다.
결국 `Incremental Update는 변경 이후의 참조 관계를 확인하고, SATB는 변경 이전의 참조 관계를 보존한다`는 것이 가장 중요한 차이입니다.

---

# 변경된 Reference는 언제 처리할까?

CMS는 Incremental Update를 통해 기록한 변경 정보를 Concurrent Preclean과 Remark에서 처리합니다. 반면 G1은 SATB Queue에 기록된 Reference를 Concurrent Marking 도중에도 처리하며, 남은 작업은 Remark에서 마무리합니다.

## CMS: Concurrent Preclean

Application Thread와 동시에 실행하면서 Card Table과 Mod Union Table에 기록된 변경 영역을 다시 탐색합니다. 이 과정에서도 Reference가 계속 변경될 수 있으므로 모든 작업을 완료할 수는 없습니다.

## G1: Concurrent Marking

Application Thread와 동시에 SATB Queue에 기록된 기존 Reference를 처리합니다. 아직 Mark되지 않은 Object를 발견하면 탐색을 이어가며, 처리되지 않은 기록은 Remark에서 마무리합니다.
두 방식 모두 Concurrent 단계에서 변경 정보를 처리하지만, Application Thread가 계속 실행되므로 남은 작업을 최종적으로 처리하는 Remark 단계가 필요합니다.
