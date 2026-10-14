# 한눈에 보기

Remembered Set(RSet)은 GC가 Heap의 일부 영역을 회수할 때, 외부에서 들어오는 Reference를 찾기 위해 유지하는 정보 집합입니다.
CMS에서는 Card Table을 기반으로 Old → Young Reference를 추적하여 Young GC가 Old Generation 전체를 탐색하지 않도록 합니다.
G1에서는 Region 단위의 GC를 지원하기 위해 별도의 RSet을 관리하며, Card Table과 함께 활용해 Region 간 Reference를 추적합니다.

---

# Remembered Set(RSet)이란?

Remembered Set은 GC가 Heap의 일부 영역만 회수할 때, `외부에서 해당 영역으로 들어오는 Reference를 찾기 위해 유지하는 정보 집합`입니다.

## 왜 필요할까?

Young GC는 GC Roots에서 시작해 살아 있는 Young Object를 탐색합니다. 하지만 Young Object가 Old Gen의 Object로부터 참조되고 있을 수도 있습니다.
예를 들어 다음과 같은 Object가 있다고 가정하겠습니다.

```java
class Node {
    Node child;
}

Node a = new Node(); // Old Gen
Node b = new Node(); // Young Gen

a.child = b;
```

GC Roots가 a를 참조하고 있다면 b 역시 살아 있는 Object입니다. 하지만 Young GC가 Young Gen만 탐색한다면 Old Gen의 a가 참조하는 b를 발견하지 못할 수 있습니다.
가장 단순한 해결법은 Young GC가 발생할 때마다 Old Gen 전체를 탐색하는 것입니다. 하지만 매번 Old Gen 전체를 탐색한다면 GC 비용이 증가하며, Young Gen만 빠르게 회수하려는 세대별 GC의 장점이 줄어들게 됩니다.

## 어떻게 해결할까?

RSet은 이러한 문제를 해결하기 위해 `Old → Young Reference가 존재할 가능성이 있는 위치`를 관리합니다.
앞선 예시에서 RSet이 a의 Reference 위치를 알려준다면, Young GC는 Old Gen 전체를 탐색하지 않고도 해당 위치를 검사해 b를 발견할 수 있습니다.
이때 RSet이 반드 a → b라는 정확한 참조 관계를 저장할 필요는 없습니다. `Reference가 존재할 가능성이 있는 메모리 위치만 기억`하고, GC가 해당 위치를 검사하여 실제 Reference를 찾을 수 있습니다.
CMS와 함께 사용하는 Young GC에서는 이러한 RSet을 `Card Table`를 기반으로 구현합니다.

---

# Card Table 이란?

Card Table은 Heap을 일정한 크기(512Byte)의 메모리 영역인 Card로 나누고, 각 Card의 상태를 기록하는 자료구조입니다.
CMS와 함께 사용하는 Young GC에서는 Card Table을 기반으로 RSet을 구현합니다.

## Card Table은 무엇을 기록할까?

각 Card에 대응하는 상태값을 저장하며, 일반적으로 다음 두 상태를 가집니다.

- `Clean` : 해당 Card에 Reference 변경 정보가 없는 상태
- `Dirty` : 해당 Card에 Reference 변경이 발생해 검사가 필요한 상태

앞서 본 코드를 다시 가정해봅시다.

```java
class Node{
    Node child;
}

Node a = new Node();    // Old Gen(Card A)
Node b = new Node();    // Young Gen(Card B)

a.child = b;    // Card A : Dirty
```

a가 Card A에, b는 Card B에 존재합니다. a.child = b 가 실행되면 Barrier에 의해 Card A가 Dirty로 표시될 수 있습니다.

- Card A (Old): Dirty
- Card B(Young) : Clean

중요한 점은 참조받는 Object가 아니라 `Reference 필드가 위치한 Card를 표시한다`는 것입니다.
a가 b를 참조하므로 변경이 발생한 위치는 a.child 필드입니다. 따라서 Card A가 표시되며, b가 저장된 Card B를 표시할 필요는 없습니다.
또한 Dirty라는 정보만으로는 a가 b를 참조한다는 사실을 알 수 없습니다. Card Table은 Reference의 목적지를 직접 저장하지 않으며, GC가 Card A를 실제로 검사해야 어떤 Object를 참조하는지 알 수 있습니다.

## Young GC에서 어떻게 활용할까?

Young GC는 GC Roots에서 시작해 살아 있는 Young Object를 탐색합니다. 하지만 Old Gen의 Object가 Young Object를 참조할 수 있으므로, 이러한 Reference도 탐색 지점에 포함해야 합니다.
앞선 예시를 기준으로 동작 과정은 다음과 같습니다.

1. `Card Table 확인` : Old Gen에 대응하는 Card Table에서 검사 대상(Dirty 상태)으로 표시된 Card A를 찾습니다.
2. `Reference 탐색` : Card A에 포함된 Object의 Reference 필드를 검사해 `a.child = b`를 발견합니다.
3. `Reachability 탐색` : b를 추가적인 탐색 출발점으로 삼아 도달 가능한 Young Object를 탐색합니다.

여기서 Young GC가 `Old Gen 전체를 스캔하는 것은 아닙니다`. Card Table의 상태 정보를 확인하고, 검사가 필요한 일부 Old Card의 Object만 탐색합니다.
또한 `a가 실제로 Reachable한지까지 판단하지는 않습니다`. a가 Garbage더라도 b를 참조하고 있다면 Young GC는 b를 보수적으로 살려둘 수 있습니다.

## 왜 Old → Young Reference만 설명할까?

지금까지 Old → Young Reference를 중심으로 설명한 이유는 CMS와 함께 사용하는 Young GC를 기준으로 했기 때문입니다.
Young GC는 Young Generation만 회수하므로 Old Generation에서 Young Generation으로 들어오는 Reference를 찾아야 합니다. 반면 Old Generation을 회수하는 CMS Major GC에서는 Young Generation을 직접 스캔하여 Young → Old Reference를 찾습니다.
따라서 CMS 환경에서는 Young GC의 세대 간 Reference 추적을 위해 Card Table 기반 Remembered Set을 활용합니다.

## Object가 여러 Card에 걸쳐 있다면?

Card는 Object의 크기와 관계없이 일정한 크기로 나눈 영역입니다. 따라서 하나의 Object가 여러 Card에 걸쳐 저장될 수도 있고, 하나의 Card에 여러 Object가 포함될 수도 있습니다.
예를 들어 크기가 800Byte인 object a가 두 Card에 걸쳐 있고, a.child 필드가 두 번째 Card에 있다고 가정하겠습니다.

```java
a.child = b;
```

이때 Reference 변경을 기록하는 대상은 a의 시작 주소가 위치한 Card가 아니라, `a.child 필드가 위치한 Card` 입니다.
또한 하나의 Card에 여러 Object가 존재한다면 실제 Reference가 변경된 Object뿐 아니라 같은 Card에 포함된 다른 Object의 Reference도 검사할 수 있습니다.
따라서 불필요한 Reference 검사가 일부 발생할 수 있지만, Reference마다 별도의 정보를 유지하는 비용은 줄일 수 있습니다.

---

# G1의 RSet

G1은 CMS와 달리 Heap을 여러 Region으로 나누어 관리합니다. Young Generation과 Old Generation 역시 각각 여러 Region으로 구성되며, G1은 Mixed GC에서 일부 Old Region만 선택해 회수할 수 있습니다.
이때 회수 대상 Region을 다른 Region의 Object가 참조하고 있을 수 있습니다. 이러한 Reference를 찾기 위해 매번 나머지 Heap 전체를 탐색한다면 Region 단위로 GC를 수행하는 이점이 줄어듭니다.
이를 해결하기 위해 G1은 `Region별 RSet`을 사용하여 특정 Region으로 들어오는 외부 Reference의 위치를 관리합니다.

## G1 RSet은 무엇을 기록할까?

G1의 RSet은 `특정 Region을 참조할 가능성이 있는 외부 Card의 위치`를 저장합니다.
여기서 중요한 점은 참조하는 Region이 아니라 `참조받는 Region을 기준으로 정보`를 관리한다는 것입니다.
예를 들어 다음과 같은 상황을 가정해봅시다.

```java
class Node {
    Node child;
}

Node a = new Node(); // Region A (Old), Card A
Node b = new Node(); // Region B (Old), Card B
Node c = new Node(); // Region C (Young)

a.child = b;
b.child = c;
```

a의 child 필드는 Card A, b의 child 필드는 Card B에 있다고 가정하겠습니다
Region별 RSet은 개념적으로 다음과 같은 정보를 가질 수 있습니다.

- Region B의 RSet: Region A의 Card A
- Region C의 RSet: Region B의 Card B

여기서 RSet이 저장하는 것은 a → b 또는 b → c라는 정확한 Reference 관계가 아닙니다. 실제 Reference가 저장되어 있을 가능성이 있는 Card의 위치입니다.

## G1 GC에서는 어떻게 활용할까?

앞선 예시에서 Region C가 GC 대상으로 선택되었다고 가정하겠습니다.
G1은 Region C를 회수하기 위해 외부에서 Region C로 들어오는 Reference를 찾아야 합니다.
이때 Region C의 RSet을 확인하면 Region B의 Card B를 검사해야 한다는 사실을 알 수 있습니다.
GC는 Card B의 Reference 필드를 검사하면서 b.child = c를 발견합니다. 그리고 c가 살아 있는 Object라면 다른 Region으로 복사하고, b.child가 이동한 c를 참조하도록 갱신합니다.
여기서도 Region B 전체를 탐색할 필요는 없습니다. RSet이 알려준 Card B를 검사하면 되기 때문입니다.

---

# Dirty Card는 검사한 뒤 상태를 어떻게 유지하는가?

Young GC가 Dirty Card를 검사했다고 해서 무조건 Clean으로 변경할 수는 없습니다. Old → Young Reference가 계속 존재한다면 다음 Young GC에서도 해당 Reference를 발견할 수 있어야 하기 때문입니다.
CMS와 G1은 이 문제를 해결하는 방식이 다릅니다.

## CMS에서는 어떻게 관리할까?

CMS와 함께 사용하는 Young GC에서는 Card Table 자체가 Remembered Set의 역할을 수행합니다.
예를 들어 Old Gen의 a가 Young Gen의 b를 참조한다고 가정하겠습니다.

```java
a.child = b;
```

첫 번째 Young GC에서 a의 Card를 검사해 b를 발견했다고 해도, b가 Survivor에 남아 있다면 다음 Young GC에서도 해당 Reference를 추적해야 합니다.
그런데 Dirty Card를 검사한 뒤 무조건 Clean으로 변경한다면, `a.child`에 새로운 대입이 발생하지 않는 이상 해당 Reference를 놓칠 수 있습니다.
이를 해결하기 위해 HotSpot의 Card Table에는 Clean/Dirty 외에도 `youngergen_card` 계열의 상태가 존재합니다.

- `Clean`: 현재 검사 대상으로 표시되지 않은 Card
- `Dirty`: Reference 변경이 발생해 검사가 필요한 Card
- `youngergen_card`: Young Gen으로 향하는 Reference를 다음 GC에서도 추적하기 위해 사용하는 Card 상태

Young GC는 검사할 Card를 일단 Clean으로 초기화한 뒤 Reference를 탐색할 수 있습니다. 이 과정에서 Old → Young Reference가 여전히 존재한다면 `youngergen_card` 계열의 상태로 다시 표시합니다.
반대로 해당 Card에서 Young으로 향하는 Reference가 더 이상 발견되지 않는다면 Clean 상태로 남을 수 있습니다.
즉, 참조가 유지된다고 Dirty 상태를 계속 유지하는 것이 아니라, 다음 Young GC에서도 검사할 수 있도록 Card의 상태를 갱신하는 것입니다.

## G1에서는 어떻게 관리할까?

G1에서도 Reference가 계속 존재한다면 이후 GC에서 놓치지 않아야 한다는 원리는 같습니다. 하지만 CMS와 달리 Card Table과 Region별 RSet을 별도로 관리합니다.
G1에서는 Dirty Card를 검사하는 `Refinement` 과정을 통해 해당 Card가 참조하는 Region의 RSet을 갱신합니다.
예를 들어 Region A의 Card A에서 Region B의 Object를 참조한다면 다음과 같이 처리합니다.

1. `Barrier`: Reference 변경이 발생한 Card A를 Dirty로 표시합니다.
2. `Refinement`: Card A를 검사해 Region B로 향하는 Reference를 발견합니다.
3. `RSet 갱신`: Region B의 RSet에 Card A의 위치를 기록합니다.
4. `Card 상태 갱신`: Refinement가 처리한 Card A는 Clean으로 변경할 수 있습니다.
5. `GC`: 이후 Region B를 회수할 때 RSet을 통해 Card A를 다시 검사합니다.

여기서 중요한 점은 Card A가 Clean으로 변경되더라도 Region B의 RSet에는 Card A의 위치가 남아 있을 수 있다는 것입니다.

결국 두 방식 모두 기존 Reference를 놓치지 않는다는 목적은 같지만, `CMS는 Card Table의 추가 상태를, G1은 별도의 RSet 자료구조를 활용한다`는 차이가 있습니다.
