# 한눈에 보기

Heap은 Java Application에서 생성되는 객체와 배열을 저장하는 공유 Memory 영역입니다.

Heap의 세부 구조는 Garbage Collector에 따라 다를 수 있습니다. 여기서는 세대형 GC를 이해하기 위한 대표적인 구조인 `Young Generation`, `Old Generation`, `Eden`, `Survivor`를 기준으로 설명합니다.

Heap을 이해하면 객체가 어디에 생성되고 어떻게 오래 살아남는지, Memory Leak이나 `OutOfMemoryError: Java heap space` 같은 문제가 왜 발생하는지 분석하는 데 도움이 됩니다.

---

# Heap이란

Heap은 JVM이 객체와 배열을 저장하기 위해 사용하는 Runtime Data Area입니다.

예를 들어 다음 코드가 있다고 가정합니다.

```java
User user = new User();
```

`new User()`로 생성된 실제 `User` 객체는 Heap에 생성됩니다.

반면 `user`라는 Local Reference Variable은 현재 Method의 Stack Frame에서 관리될 수 있습니다.

즉 객체 자체와 객체를 가리키는 Reference는 서로 다른 영역에 존재할 수 있습니다.

Heap은 특정 Thread만 사용하는 영역이 아니라 여러 Thread가 공유합니다. 따라서 여러 Thread가 같은 객체를 참조하면 Heap에 존재하는 동일한 객체를 함께 사용하게 됩니다.

---

# Heap의 구성

대표적인 세대형 Heap 구조는 다음과 같이 나눠 볼 수 있습니다.

- `Young Generation`: 새 객체와 생명주기가 짧은 객체를 주로 관리합니다.
  - `Eden`: 새 객체가 일반적으로 처음 생성되는 Young Generation 영역입니다.
  - `S0`, `S1`: Young GC에서 살아남은 객체를 보관하는 Survivor 공간입니다.
- `Old Generation`: 여러 번의 GC에서도 살아남은 객체를 주로 관리합니다.

`S0`, `S1`은 한쪽이 From, 다른 쪽이 To 역할을 맡고 GC가 끝날 때마다 역할을 교대할 수 있습니다.

다만 실제 Heap 구조는 Garbage Collector에 따라 다를 수 있습니다. 예를 들어 G1 GC는 Heap을 여러 Region으로 나누고 각 Region에 Eden, Survivor, Old 역할을 부여합니다.

---

# 객체는 어디에서 시작할까

새롭게 생성된 객체는 일반적으로 Young Generation의 Eden 영역에서 시작합니다.

```java
Order order = new Order();
User user = new User();
```

객체가 더 이상 필요하지 않으면 이후 GC 과정에서 Memory가 회수될 수 있습니다.

반대로 GC 이후에도 계속 살아 있는 객체는 Survivor 영역으로 이동할 수 있습니다.

여러 번의 GC에서도 계속 살아남은 객체는 일정 조건을 만족하면 Old Generation으로 이동할 수 있습니다.

이를 `Promotion`이라고 합니다.

개념적으로는 다음과 같이 볼 수 있습니다.

`Eden → Survivor → Old Generation`

모든 객체가 반드시 이 경로를 그대로 거치는 것은 아니며 객체 크기나 Survivor 공간, Garbage Collector 정책에 따라 달라질 수 있습니다.

---

# 왜 Young과 Old로 나눌까

많은 Java 객체는 생성된 뒤 짧은 시간 안에 더 이상 사용되지 않고, 한 번 오래 살아남은 객체는 이후에도 계속 살아남을 가능성이 높다는 경험적 특성이 있습니다. 이를 `Weak Generational Hypothesis`라고 합니다.

이 가설을 기반으로 많은 Garbage Collector는 Heap을 세대별로 나눠 관리합니다.

- 새롭게 생성된 객체는 `Young Generation`에서 관리
- Young GC에서도 계속 살아남은 객체는 `Old Generation`으로 Promotion
- 짧게 살아가는 객체가 많은 Young 영역은 비교적 자주 수집
- 오래 살아남은 객체가 많은 Old 영역은 별도로 관리

예를 들어 Request를 처리하면서 생성되는 DTO나 임시 Collection은 짧게 살아가는 경우가 많지만, Cache나 Application 전체에서 사용하는 객체는 오래 살아남을 수 있습니다.

따라서 모든 객체를 매번 동일한 방식으로 검사하기보다 객체의 생존 특성에 따라 세대를 나눠 관리하는 것이 효율적일 수 있습니다.

---

# 객체의 생명주기

객체가 더 이상 필요하지 않다고 해서 즉시 Heap에서 제거되는 것은 아닙니다.

```java
User user = new User();

user = null;
```

`user = null`이 되더라도 객체를 가리키는 다른 Reference가 존재할 수 있습니다.

Garbage Collector가 해당 객체에 더 이상 도달할 수 없다고 판단하고 Memory를 회수해야 실제로 Heap 공간을 다시 사용할 수 있습니다.

객체의 생존 여부를 판단하는 `GC Roots`, Reachability 같은 내용은 Garbage Collector에서 따로 다룹니다.

---

# 객체는 항상 Heap에 생성될까

Java에서 객체는 논리적으로 Heap에 생성되는 것으로 이해할 수 있습니다.

하지만 실제 실행에서는 JIT Compiler의 최적화 때문에 `new`로 생성한 모든 객체가 반드시 실제 Heap에 Allocation되는 것은 아닙니다.

예를 들어 다음 코드가 있다고 가정합니다.

```java
public int calculate() {
    Point point = new Point(10, 20);
    return point.x + point.y;
}
```

`point`는 `calculate()` Method 내부에서만 사용되고 외부로 전달되지 않습니다.

JIT Compiler는 이런 객체가 현재 Method나 Thread 밖으로 빠져나가는지를 분석할 수 있습니다.  
이를 `Escape Analysis`라고 합니다.

## Escape Analysis

Escape Analysis는 객체가 생성된 범위를 벗어나 다른 곳에서 사용될 가능성이 있는지를 분석하는 JIT 최적화 기법입니다.

예를 들어 객체가 Method의 Return 값으로 반환되거나 다른 객체의 Field에 저장된다면 Method 밖에서도 사용될 수 있습니다.

```java
public Point create() {
    Point point = new Point(10, 20);
    return point;
}
```

이 경우 `point`는 Method 밖으로 Escape합니다.

반대로 다음처럼 Method 내부에서만 사용된다면 Escape하지 않는다고 판단할 수 있습니다.

```java
public int calculate() {
    Point point = new Point(10, 20);
    return point.x + point.y;
}
```

객체가 Escape하지 않는다고 판단되면 JIT Compiler는 해당 객체에 대해 추가적인 최적화를 수행할 수 있습니다.

## Scalar Replacement

대표적인 최적화가 `Scalar Replacement`입니다.

객체 전체를 실제로 생성하지 않고 객체의 Field를 각각 독립적인 값처럼 처리하는 방식입니다.

예를 들어 다음 객체가 있다고 가정합니다.

```java
Point point = new Point(10, 20);
return point.x + point.y;
```

JIT Compiler가 `point` 객체 자체가 필요하지 않다고 판단하면 개념적으로 다음처럼 처리할 수 있습니다.

```java
int x = 10;
int y = 20;

return x + y;
```

이렇게 되면 `Point` 객체 자체의 Allocation이 제거될 수 있습니다.

이를 `Allocation Elimination`이라고도 볼 수 있습니다.

따라서 `new` Keyword를 사용했다고 해서 반드시 실제 Heap에 객체가 생성된다고 단정할 수는 없습니다.

## Stack Allocation과의 차이

Escape Analysis를 설명할 때 `Escape하지 않는 객체는 Stack에 생성된다`고 표현하기도 합니다.

하지만 HotSpot JVM에서는 이를 단순히 `Heap 대신 Stack에 객체를 저장한다`고 이해하는 것은 정확하지 않습니다.

실제로는 Escape Analysis 결과를 기반으로 `Scalar Replacement` 등을 수행하여 객체 Allocation 자체를 제거하는 최적화가 중요합니다.

따라서 다음처럼 이해하는 것이 좋습니다.

- Java의 논리적인 Memory Model에서는 객체를 Heap 객체로 이해
- 실제 실행에서는 JIT의 Escape Analysis로 객체 Allocation이 제거될 수 있음
- 반드시 `Heap 객체가 Stack으로 이동한다`고 볼 수는 없음

즉 `모든 객체는 반드시 물리적으로 Heap에 생성된다`고 단정하는 것은 정확하지 않습니다.

---

# TLAB(Thread-Local Allocation Buffer)

Heap은 여러 Thread가 공유하는 Memory 영역입니다. 따라서 여러 Thread가 동시에 객체를 생성하면 같은 Heap 공간에 객체를 할당하기 위해 경쟁이 발생할 수 있습니다.

이러한 Allocation 경쟁을 줄이기 위해 JVM은 각 Thread에게 Heap의 일부를 미리 할당해 둘 수 있습니다.  
이 공간을 `TLAB(Thread-Local Allocation Buffer)`이라고 합니다.

각 Thread는 대부분의 작은 객체를 자신의 TLAB 안에서 생성할 수 있기 때문에 다른 Thread와 Allocation 위치를 조정할 필요가 줄어듭니다.  
TLAB 내부에서는 현재 Allocation 위치를 가리키는 Pointer를 이동시키는 방식으로 빠르게 공간을 확보할 수 있습니다.

즉 TLAB을 사용하는 이유는 `여러 Thread가 공유 Heap에 객체를 생성할 때 발생하는 경쟁과 동기화 비용을 줄여 객체 Allocation을 빠르게 하기 위해서`입니다.

다만 TLAB은 Thread 전용처럼 사용되지만 별도의 Memory 영역은 아니며 `Heap의 일부`입니다.  
또한 TLAB에서 생성된 객체도 Reference가 다른 Thread에 전달되면 다른 Thread가 사용할 수 있습니다.

즉 TLAB은 객체의 사용 범위를 제한하는 기능이 아니라 `객체를 빠르게 생성하기 위한 Allocation 공간`입니다.

---

# Memory Leak

Java에 Garbage Collector가 있어도 더 이상 필요하지 않은 객체를 Application이 계속 참조하면 Memory Leak이 발생할 수 있습니다.

```java
private static final Map<Long, User> cache = new HashMap<>();

public void add(User user) {
    cache.put(user.getId(), user);
}
```

객체를 계속 추가하고 제거하지 않으면 Cache가 User 객체를 계속 참조합니다. 이 객체들은 GC에서 살아남아 Heap을 계속 차지하고 Old Generation으로 Promotion될 수 있습니다.

---

# OutOfMemoryError

GC를 수행해도 새 객체에 필요한 Heap 공간을 확보하지 못하면 `OutOfMemoryError: Java heap space`가 발생할 수 있습니다.

대표적인 원인은 다음과 같습니다.

- Application에 비해 Heap이 너무 작음
- 객체가 예상보다 많이 생성됨
- Memory Leak으로 불필요한 객체가 계속 살아 있음
- 한 번에 매우 큰 객체나 배열을 생성함

Heap 크기만 늘리면 오류가 늦게 발생할 뿐 근본 원인이 남을 수도 있습니다. 어떤 객체가 공간을 차지하고 왜 계속 Reachable한지 확인해야 합니다. 이 분석 과정은 Heap Dump Topic에서 다룹니다.

---

# Heap 크기

`-Xms`는 초기 Heap 크기이고 `-Xmx`는 최대 Heap 크기입니다.

```text
-Xms512m
-Xmx2g
```

Heap이 너무 작으면 GC가 자주 발생하거나 Memory 부족이 쉽게 나타날 수 있습니다. 반대로 Memory Leak이 있다면 Heap을 늘려도 결국 다시 가득 찰 수 있으므로 사용량과 GC 결과를 먼저 확인해야 합니다.

---

# 참고 자료

- [Oracle Java — Garbage Collector Implementation](https://docs.oracle.com/en/java/javase/21/gctuning/garbage-collector-implementation.html)
- [Oracle Java — Garbage-First Garbage Collector](https://docs.oracle.com/en/java/javase/21/gctuning/garbage-first-garbage-collector.html)
- [Oracle Java — java Command Options](https://docs.oracle.com/en/java/javase/21/docs/specs/man/java.html)
