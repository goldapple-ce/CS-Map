# 한눈에 보기

GC는 Heap의 Object 중 더 이상 사용할 수 없는 객체를 찾아 Memory를 회수하는 JVM 기능입니다.  
객체의 생존 여부는 `GC Roots`, `Reachability`, `Mark`를 통해 판단하고, 수집 범위에 따라 `Minor GC`, `Major GC`, `Full GC`로 나눌 수 있습니다.  
부분 GC에서는 세대 간 Reference를 놓치지 않기 위해 `세대 참조 가설`, `Card Table / Remembered Set`, `Write Barrier` 같은 개념이 사용됩니다.

---

# Garbage Collector란?

Garbage Collector는 Heap에서 더 이상 사용할 수 없는 객체를 찾아 Memory를 회수하는 JVM 기능입니다.
GC는 크게 살아 있는 객체를 찾는 과정과, 그 결과를 바탕으로 Memory를 회수하는 과정으로 볼 수 있습니다.
`Mark`는 살아 있는 객체를 찾는 단계이고, `Sweep / Compact / Copy`는 Collector에 따라 Memory를 회수하거나 재배치하는 방식입니다.
Collector마다 구체적인 동작 방식은 다를 수 있지만, 객체의 생존 여부를 판단한 뒤 사용하지 않는 공간을 회수한다는 흐름은 공통적입니다.

---

# Garbage를 어떻게 찾나요?

Garbage Collector는 현재 실행 중인 프로그램에서 계속 사용될 가능성이 있는 특정 Reference를 시작점으로 객체를 탐색합니다.
이 시작점을 `GC Roots`라고 합니다.
GC Roots에서 Reference를 따라 도달할 수 있는 객체는 `Reachable`, 도달할 수 없는 객체는 `Unreachable`하다고 판단합니다.
이처럼 GC Roots에서 시작해 Reference를 따라 객체 Graph를 탐색하고 살아 있는 객체를 표시하는 과정을 `Mark`라고 합니다.

## 왜 GC Roots에서 시작하나요?

객체를 몇 개의 Reference가 가리키고 있는지만으로는 객체의 생존 여부를 정확하게 판단하기 어렵기 때문입니다.

```java
class Node {
    Node next;
}

Node a = new Node();
Node b = new Node();

a.next = b;
b.next = a;

a = null;
b = null;
```

`a`와 `b`를 통해 두 객체에 접근할 수 없게 되었지만 `두 객체는 여전히 서로를 참조`하고 있습니다.
만약 객체를 가리키는 Reference의 개수를 세는 Reference Counting 방식으로 판단한다면 두 객체의 Count는 0이 되지 않습니다.
하지만 실제로는 어떤 GC Root에서도 두 객체에 도달할 수 없습니다.
Java GC는 이런 문제 때문에 Reference 개수가 아니라 `Reachability`를 기준으로 객체의 생존 여부를 판단합니다.

---

# Garbage를 어디서 찾나요?

GC가 항상 Heap 전체를 한 번에 수집하는 것은 아닙니다.
수집하는 영역에 따라 일반적으로 `Minor GC`, `Major GC`, `Full GC` 같은 용어를 사용합니다.

- `Minor GC`: 일반적으로 Young Generation을 대상으로 수행하는 GC
- `Major GC`: 일반적으로 Old Generation을 대상으로 수행하는 GC
- `Full GC`: 일반적으로 Heap 전체를 대상으로 수행하는 GC

## 왜 Minor GC와 Major GC처럼 영역을 나눠서 수집하나요?

Generational GC는 객체의 생존 패턴과 세대 간 Reference 특성을 이용합니다.

- `Weak Generational Hypothesis`: 대부분의 객체는 생성된 뒤 얼마 지나지 않아 죽습니다.
- `Strong Generational Hypothesis`: 상대적으로 오래 살아남은 객체일수록 앞으로도 더 오래 살아남는 경향이 있습니다.
- `Intergenerational Reference Hypothesis`: 서로 다른 세대 사이의 Reference는 같은 세대 내부의 Reference보다 상대적으로 적습니다.

앞의 두 가설을 바탕으로 새로 생성된 객체는 `Young Generation`에서 자주 수집하고, 오래 살아남은 객체는 `Old Generation`으로 이동시켜 상대적으로 덜 자주 수집합니다.  
또한 세대 간 Reference가 상대적으로 적기 때문에 다른 세대 전체를 매번 탐색하지 않고, 필요한 Reference만 별도로 관리할 수 있습니다.  
이 덕분에 Heap 전체를 매번 수집하지 않고도 효율적으로 GC를 수행할 수 있습니다.

## 각 GC는 자기 영역만 보면 되나요?

GC의 수집 대상이 특정 Generation이라고 해서 Reference까지 해당 Generation 내부에만 존재하는 것은 아닙니다.  
예를 들어 Old Object가 Young Object를 참조할 수 있습니다.

```
oldObject.child = youngObject;
```

이 경우 Young Object는 Old Object를 통해 여전히 Reachable합니다. 따라서 Young GC가 Young Generation 내부의 Reference만 확인한다면 살아 있는 Young Object를 놓칠 수 있습니다.  
그렇다고 Young GC가 발생할 때마다 Old Generation 전체를 탐색하면 부분 GC의 장점이 줄어듭니다.  
그래서 Old → Young Reference가 존재하는 위치를 별도로 관리하고, Young GC에서는 해당 위치만 추가로 확인합니다.  
이때 사용하는 것이 `Card Table / Remembered Set`입니다.

### 그 Reference 정보는 누가 기록하나요?

Card Table이나 Remembered Set을 사용하려면 Old Object의 Reference가 Young Object를 가리키도록 변경됐다는 사실을 알아야 합니다.

```
oldObject.child = youngObject;
```

이런 Reference 변경이 발생할 때 GC를 위한 추가 처리를 수행하는 것이 `Barrier`입니다.
Barrier는 Reference 정보를 직접 저장하는 자료구조가 아니라 Reference가 변경되는 시점에 GC가 필요한 처리를 수행하도록 하는 메커니즘입니다.
이를 통해 Card Table을 갱신하거나 Remembered Set을 관리하는 데 필요한 정보를 남길 수 있습니다.

---

# 참고 자료

- [Oracle Java 21 Garbage Collection Tuning Guide](https://docs.oracle.com/en/java/javase/21/gctuning/)
- [Java Virtual Machine Specification - Heap](https://docs.oracle.com/javase/specs/jvms/se21/html/jvms-2.html#jvms-2.5.3)
