# Mark란?

GC가 Memory를 회수하기 전에 살아 있는 Object를 식별하는 과정입니다.
GC Roots에서 시작해 Reference를 따라가며 Reachable한 Object를 찾고, 살아 있는 Object임을 표시합니다.

---

# Mark 중에 Reference가 바뀌면 어떻게 되나요?

Application Thread는 GC와 별개로 계속 실행되기 때문에 Mark 도중에도 Object의 Reference 관계가 변경될 수 있습니다.

예를 들어 처음에는 다음과 같은 Reference가 있다고 가정합니다.

```java
a.child = b;
```

GC가 Object Graph를 탐색하는 동안 Application Thread가 다음과 같이 Reference를 변경할 수 있습니다.

```java
a.child = c;
```

이 경우 GC가 탐색하고 있는 Object Graph와 실제 Object Graph가 달라질 수 있습니다. GC가 이러한 변경을 놓치면 살아 있는 Object를 제대로 Mark하지 못할 수 있습니다.  
가장 단순한 해결 방법은 GC가 Mark하는 동안 Application Thread를 멈춰 Object Graph가 변경되지 않도록 하는 것입니다.  
이처럼 GC 작업을 위해 Application Thread를 일시적으로 멈추는 것을 `Stop-The-World`라고 합니다.

---

# Mark가 끝날 때까지 계속 STW 상태여야 하나요?

Mark 전체를 Stop-The-World 상태에서 수행하면 Object Graph가 변경되지 않기 때문에 안정적으로 탐색할 수 있습니다.  
하지만 Heap이 크거나 살아 있는 Object가 많을수록 Mark 시간이 길어지고, 그만큼 Application의 Pause도 길어질 수 있습니다.  
이 Pause를 줄이기 위해 일부 Garbage Collector는 Mark 작업의 상당 부분을 Application Thread와 동시에 수행합니다. 이를 `Concurrent Marking`이라고 합니다.

## Concurrent Marking 중에 Reference가 바뀌어도 괜찮나요?

Concurrent Marking에서는 Application Thread가 계속 실행되기 때문에 Reference 변경 문제를 다시 고려해야 합니다.
Collector는 Reference 접근이나 변경 시 GC를 위한 추가 처리를 수행하는 `Barrier`를 이용해 필요한 정보를 기록합니다.
이 정보를 바탕으로 Mark 도중 발생한 Reference 변경을 반영하고 살아 있는 Object를 놓치지 않도록 합니다.
대표적인 방식으로 `SATB`와 `Incremental Update`가 있습니다.

## SATB란?

`SATB(Snapshot-At-The-Beginning)`는 Concurrent Marking이 시작된 시점의 Object Graph를 기준으로 살아 있는 Object를 놓치지 않도록 하는 방식입니다.
예를 들어 처음에 `A`가 `B`를 참조하고 있었다고 가정합니다.

```java
a.child = b;
```

Mark 도중 Application Thread가 다음과 같이 Reference를 변경할 수 있습니다.

```java
a.child = c;
```

이때 기존 Reference인 `B`를 따로 기록해두면, GC는 Mark 시작 시점에 살아 있던 `B`를 나중에 다시 확인할 수 있습니다.
즉 SATB는 기존 Reference가 사라지기 전에 그 정보를 보존해서 Mark 결과가 빠지는 것을 막는 방식입니다.

## Incremental Update란?

`Incremental Update`는 Concurrent Marking 도중 새롭게 만들어진 Reference 관계를 추적해서 Mark 결과에 반영하는 방식입니다.  
예를 들어 Mark 중에 어떤 Object가 이미 확인된 Object를 통해 새롭게 다른 Object를 참조하게 됐다면, 그 새로운 연결을 GC가 다시 확인할 수 있도록 기록합니다.  
SATB가 Mark 시작 시점의 Object Graph를 유지하려는 방식이라면, Incremental Update는 Mark 도중 새롭게 생긴 Object Graph의 변화를 반영하는 방식입니다.

### SATB와 Incremental Update는 뭐가 다른가요?

두 방식 모두 Concurrent Marking 중 Reference가 바뀌는 문제를 해결하기 위한 방식이지만 관점이 다릅니다.

- `SATB`: Mark 시작 시점에 존재하던 Reference를 놓치지 않도록 기존 Reference를 보존
- `Incremental Update`: Mark 도중 새롭게 만들어진 Reference를 추적해서 반영

## Barrier는 여기서 어떤 역할을 하나요?

Concurrent Marking에서는 Application Thread가 Reference를 변경하는 순간을 GC가 알아야 합니다.  
Barrier는 Reference를 읽거나 변경하는 시점에 GC를 위한 추가 처리를 수행하는 메커니즘입니다.  
Concurrent Marking에서는 주로 Reference 변경 시 동작하는 `Write Barrier`를 이용해 SATB나 Incremental Update에 필요한 정보를 기록합니다.  
Barrier 자체가 Mark를 수행하는 것은 아니고, Mark 중에 바뀐 Object Graph를 GC가 놓치지 않도록 필요한 정보를 남기는 역할을 합니다.

---

# 참고 자료

- [Java Virtual Machine Specification - Heap](https://docs.oracle.com/javase/specs/jvms/se21/html/jvms-2.html#jvms-2.5.3)
- [Java SE 21 WeakReference](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/ref/WeakReference.html)
