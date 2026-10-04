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

# Memory Leak

Java에는 Garbage Collector가 있지만 Memory Leak이 발생할 수 있습니다.

Memory Leak은 더 이상 필요하지 않은 객체를 Application이 계속 참조하고 있어서 Memory가 회수되지 않는 상태라고 볼 수 있습니다.

예를 들어 다음 Cache가 있다고 가정합니다.

```java
private static final Map<Long, User> cache = new HashMap<>();

public void add(User user) {
    cache.put(user.getId(), user);
}
```

객체를 계속 추가하면서 제거하지 않으면 `cache`가 `User` 객체들을 계속 참조합니다.

이 객체들은 GC에서 계속 살아남을 수 있고, 오래 유지되면 Old Generation까지 이동하면서 Heap 사용량을 계속 차지할 수 있습니다.

---

# OutOfMemoryError

GC를 수행해도 새로운 객체를 생성할 충분한 Heap 공간을 확보하지 못하면 다음 오류가 발생할 수 있습니다.

```text
java.lang.OutOfMemoryError: Java heap space
```

대표적인 원인은 다음과 같습니다.

- Application에 비해 Heap 크기가 너무 작음
- 객체가 예상보다 많이 생성됨
- Memory Leak으로 객체가 계속 살아 있음
- 한 번에 매우 큰 객체나 배열을 생성함

따라서 `Java heap space`가 발생했다고 단순히 Heap 크기만 늘리는 것이 항상 해결책은 아닙니다.

어떤 객체가 Heap을 차지하고 있고 왜 계속 살아 있는지 확인해야 합니다.

---

# Heap Dump

Heap 문제를 분석할 때 대표적으로 `Heap Dump`를 사용합니다.

Heap Dump를 통해 특정 시점에 Heap에 존재하는 객체와 객체 사이의 Reference 관계를 확인할 수 있습니다.

대표적으로 다음을 확인할 수 있습니다.

- 어떤 Class의 객체가 많이 존재하는지
- 어떤 객체가 Memory를 많이 차지하는지
- 어떤 객체가 예상보다 오래 살아 있는지
- 어떤 Reference가 해당 객체를 계속 참조하고 있는지

Memory Leak을 분석할 때는 단순히 객체가 많다는 사실보다 `왜 해당 객체가 계속 살아 있는지`를 확인하는 것이 중요합니다.

---

# Heap 크기

JVM에서는 Heap 크기를 Option으로 설정할 수 있습니다.

```text
-Xms512m
-Xmx2g
```

`-Xms`는 초기 Heap 크기이고 `-Xmx`는 최대 Heap 크기입니다.

Heap이 너무 작으면 GC가 자주 발생하거나 Memory 부족 문제가 더 쉽게 발생할 수 있습니다.

반대로 Heap을 크게 설정한다고 항상 문제가 해결되는 것은 아닙니다.

Memory Leak이 있다면 Heap을 늘려도 결국 다시 Memory가 가득 찰 수 있습니다.

---

# 참고 자료

- [Oracle Java — Garbage Collector Implementation](https://docs.oracle.com/en/java/javase/21/gctuning/garbage-collector-implementation.html)
- [Oracle Java — Garbage-First Garbage Collector](https://docs.oracle.com/en/java/javase/21/gctuning/garbage-first-garbage-collector.html)
