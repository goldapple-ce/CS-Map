# 한눈에 보기

Atomic Class는 하나의 값에 대해 Read와 Write를 조합한 갱신을 원자적으로 수행할 수 있는 API입니다. 대표적인 AtomicInteger를 이용하면 여러 Thread가 공유하는 Counter를 안전하게 증가시킬 수 있습니다.

---

# volatile count++의 문제

volatile은 값의 가시성과 Memory 연산 순서를 보장하지만 여러 연산을 하나로 묶지는 않습니다. 따라서 volatile int count에 `count++`를 실행하면 다음 단계 사이에 다른 Thread가 끼어들 수 있습니다.

1. count의 현재 값을 읽습니다.
2. 읽은 값에 1을 더합니다.
3. 계산한 값을 count에 씁니다.

두 Thread가 같은 값을 읽고 각각 같은 증가 값을 쓰면 한쪽 갱신이 사라질 수 있습니다.

---

# AtomicInteger로 증가하기

```java
AtomicInteger count = new AtomicInteger(0);

int result = count.incrementAndGet();
```

`incrementAndGet()`은 증가와 증가 후 값 반환을 하나의 원자적 연산으로 제공합니다. 반면 `getAndIncrement()`는 증가 전 값을 반환하므로 두 Method의 반환 시점을 구분해야 합니다.

AtomicInteger에는 현재 값을 읽고 쓰는 `get()`과 `set()`, 예상한 값일 때만 교체하는 `compareAndSet()` 같은 연산도 있습니다.

---

# CAS와 재시도

CAS(Compare-And-Set)는 다음 비교와 교체를 하나의 원자적 연산으로 수행합니다.

1. 공유 값의 current를 확인합니다.
2. current와 호출자가 가진 expected를 비교합니다.
3. 같으면 update로 교체하고 성공을 반환합니다. 다르면 값을 바꾸지 않고 실패를 반환합니다.

실패는 다른 Thread가 먼저 값을 바꾸었다는 신호일 수 있습니다. 이때는 최신 값을 다시 읽고, 새 결과를 계산하고, CAS를 다시 시도합니다.

경쟁이 심하면 여러 Thread가 반복해서 실패해 재시도 비용이 커질 수 있습니다. `updateAndGet()` 등에 전달한 함수도 재시도 과정에서 여러 번 실행될 수 있으므로 외부 전송이나 다른 상태 변경 같은 Side Effect를 넣지 않는 편이 안전합니다.

AtomicInteger의 공개 계약은 각 API가 제공하는 원자성과 Memory 효과입니다. JVM이 CPU 명령, VarHandle이나 Intrinsic을 이용해 이를 구현하는 구체적인 방법은 JVM과 버전에 따라 달라질 수 있습니다.

---

# 보장 범위

AtomicInteger는 하나의 int 값에 대해 API가 제공하는 연산을 원자적으로 수행합니다. 여러 변수 사이의 불변 조건이나 긴 작업 전체를 하나의 임계 영역으로 보호해 주지는 않습니다.

여러 값과 여러 단계를 함께 보호해야 한다면 `synchronized`나 Lock을 검토해야 합니다. 객체 Reference 전체를 원자적으로 교체하는 AtomicReference처럼 대상 Type과 목적이 다른 Atomic Class도 있습니다.

---

# 참고 자료

- [Java 21 API — java.util.concurrent.atomic](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/atomic/package-summary.html)
- [Java 21 API — AtomicInteger](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/atomic/AtomicInteger.html)
