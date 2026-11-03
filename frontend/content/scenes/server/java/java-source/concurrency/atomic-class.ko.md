# 한눈에 보기

Atomic Class는 CAS와 같은 원자적 연산을 활용하여 Lock 없이 공유 가변 상태를 안전하게 갱신하도록 제공하는 Java 클래스입니다.
AtomicInteger와 AtomicReference 등을 통해 기본 값이나 객체 참조의 원자적 변경을 보장할 수 있습니다.
다만 개별 연산의 원자성이 여러 연산으로 구성된 전체 작업의 안전성까지 보장하지는 않습니다.

---

# Atomic Class란?

Atomic Class는 여러 스레드가 공유하는 값을 `Lock 없이 원자적으로 읽거나 변경할 수 있도록 제공하는 Java 클래스`입니다.
`java.util.concurrent.atomic` 패키지에 포함되어 있으며, CAS와 같은 원자적 연산을 활용하여 공유 가변 상태를 안전하게 관리합니다.

일반적인 변수에 대한 복합 연산은 여러 스레드가 동시에 실행할 경우 Race Condition이 발생할 수 있지만, Atomic Class는 개별 연산의 원자성과 메모리 가시성을 보장합니다.

---

# Atomic Class가 필요한 이유

여러 스레드가 공유 변수에 대해 `count++`를 실행하면 Lost Update가 발생할 수 있습니다.
이는 count++가 값을 읽고, 증가시키고, 다시 저장하는 여러 단계로 이루어져 있기 때문입니다.

Atomic Class는 이러한 연산을 원자적으로 처리하여 여러 스레드가 동시에 값을 변경하더라도 갱신 결과가 유실되지 않도록 합니다.

Java에서 대표적으로 제공하는 Atomic Class는 다음과 같습니다.

- AtomicInteger: int 값에 대한 원자적 연산을 제공합니다.
- AtomicLong: long 값에 대한 원자적 연산을 제공합니다.
- AtomicBoolean: boolean 값에 대한 원자적 연산을 제공합니다.
- AtomicReference: 객체 참조에 대한 원자적 연산을 제공합니다.

---

# Atomic Class의 동작 원리

Atomic Class는 `CAS`와 같은 원자적 연산을 기반으로 공유 상태를 갱신합니다.

CAS는 현재 값이 기대한 값과 일치하는 경우에만 새로운 값으로 변경하는 연산입니다.
값의 비교와 변경을 하나의 원자적 연산으로 처리하므로, 다른 스레드가 중간에 개입하여 값을 변경하는 문제를 방지할 수 있습니다.

Atomic Class에서는 `compareAndSet()`을 통해 CAS 연산을 직접 사용할 수 있습니다.

```java
atomic.compareAndSet(expected, update);
```

현재 값이 expected와 일치하면 update로 변경하고 true를 반환합니다.
일치하지 않으면 값을 변경하지 않고 false를 반환합니다.

Atomic Class의 `incrementAndGet()`과 같은 메서드는 이러한 원자적 갱신 기능을 제공하므로, 직접 CAS 재시도 로직을 구현하지 않아도 됩니다.

---

# AtomicInteger와 AtomicReference

다음은 AtomicInteger로 공유 카운터를 증가시키고, AtomicReference로 객체 참조를 변경하는 예시입니다.

```java
public class Main {
    enum State { READY, RUNNING }

    public static void main(String[] args) throws InterruptedException {
        AtomicInteger count = new AtomicInteger(0);

        Runnable task = () -> {
            for (int i = 0; i < 1000; i++) {
                count.incrementAndGet();
            }
        };

        Thread t1 = new Thread(task);
        Thread t2 = new Thread(task);

        t1.start();
        t2.start();
        t1.join();
        t2.join();

        System.out.println(count.get()); // 2000

        AtomicReference<State> state =
                new AtomicReference<>(State.READY);

        boolean changed = state.compareAndSet(
                State.READY, State.RUNNING
        );

        System.out.println(changed);     // true
        System.out.println(state.get()); // RUNNING
    }
}
```

AtomicInteger의 `incrementAndGet()`은 증가 연산을 원자적으로 처리하므로 여러 스레드가 동시에 실행하더라도 Lost Update가 발생하지 않습니다.

AtomicReference는 객체 참조를 원자적으로 변경할 수 있도록 제공합니다.
위 예시에서는 현재 참조가 State.READY일 때만 State.RUNNING으로 변경하며, 조건이 일치하지 않으면 변경에 실패합니다.

다만 AtomicReference가 보장하는 것은 `참조 값의 원자적 변경`이지, 참조하는 객체의 내부 상태에 대한 스레드 안전성은 아닙니다.

---

# Atomic Class의 한계

Atomic Class를 사용한다고 해서 여러 연산으로 구성된 모든 작업이 원자적으로 처리되는 것은 아닙니다.

예를 들어 다음 코드를 보겠습니다.

```java
if (count.get() < 10) {
    count.incrementAndGet();
}
```

get()과 incrementAndGet()은 각각 원자적이지만, 두 연산 사이에 다른 스레드가 개입할 수 있습니다.
따라서 여러 스레드가 동시에 조건을 확인하면 count가 10을 초과할 수 있습니다.

이처럼 `개별 연산의 원자성이 전체 작업의 원자성을 보장하지는 않습니다.`
하나의 Atomic 변수에 대한 조건부 변경이라면 `updateAndGet()`이나 CAS 재시도 로직으로 전체 갱신을 원자적으로 구현할 수 있습니다.
반면 여러 공유 변수의 상태를 함께 변경하여 일관성을 유지해야 한다면 Lock-Based 동기화 등을 고려해야 합니다.
또한 CAS 기반 연산에서는 값이 변경되었다가 원래 값으로 돌아오는 `ABA 문제`가 발생할 수 있습니다. 이 문제는 AtomicReference처럼 참조 값의 변경을 추적하는 경우에도 고려해야 합니다.
