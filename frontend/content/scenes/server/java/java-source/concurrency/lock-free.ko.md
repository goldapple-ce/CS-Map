# 한눈에 보기

Lock-Free는 Lock을 사용하지 않고 원자적 연산을 통해 공유 자원의 일관성을 유지하는 비차단 동시성 알고리즘입니다.
주로 CAS를 활용하며, 경쟁이 발생하더라도 시스템 전체의 작업 진행을 보장합니다.
다만 CAS 재시도로 인한 성능 저하와 Starvation이 발생할 수 있으며, ABA 문제나 Check-Then-Act와 같은 동시성 문제에도 주의해야 합니다.

---

# Lock-Free란?

Lock-Free는 여러 스레드가 공유 자원에 접근할 때 Lock을 사용하지 않고도 안전하게 작업을 수행하도록 설계된 `비차단 동시성 알고리즘`입니다.
Lock-based 방식이 상호 배제를 통해 공유 자원에 대한 접근을 제어한다면, Lock-Free는 여러 스레드의 `동시 접근을 허용`하면서 `원자적 연산을 통해 데이터의 일관성을 유지`합니다.
또한 스레드 간 경쟁이 발생하더라도 시스템 전체에서는 적어도 하나의 스레드가 작업을 완료할 수 있도록 보장합니다. 다만 개별 스레드의 작업 완료까지 보장하는 것은 아닙니다.

---

# Lock-Free의 동작 원리

Lock-Free 알고리즘은 일반적으로 `CAS(Compare-And-Swap)`와 같은 원자적 연산을 활용하여 구현합니다. CAS는 공유 변수의 현재 값이 예상한 값과 일치하는 경우에만 새로운 값으로 변경하는 연산입니다.

1. Read: 공유 변수의 현재 값을 읽습니다.
2. Compare: 현재 값이 예상한 값과 일치하는지 비교합니다.
3. Swap: 값이 일치하면 새로운 값으로 변경하고, 일치하지 않으면 실패합니다.

CAS의 비교와 변경은 하나의 원자적 연산으로 수행되므로, 여러 스레드가 동시에 접근하더라도 비교와 변경 사이에 다른 스레드가 끼어들 수 없습니다.
다음은 CAS를 이용해 공유 변수의 값을 증가시키는 예시입니다.

```java
public class Main {
    public static void main(String[] args) {
        AtomicInteger count = new AtomicInteger(0);

        int current;
        do {
            current = count.get();
        } while (!count.compareAndSet(current, current + 1));

        System.out.println(count.get()); // 1
    }
}
```

여러 스레드가 동일한 값을 읽더라도 CAS에 성공한 스레드만 값을 변경할 수 있습니다. CAS에 실패한 스레드는 변경된 값을 다시 읽고 연산을 재시도합니다.
이처럼 Lock을 획득하기 위해 대기하는 대신 원자적 연산을 반복하여 공유 상태를 안전하게 변경합니다.

---

# Lock-Free의 장단점

Lock-Free는 Lock을 사용하지 않기 때문에 `Lock 획득과 해제에 따른 비용`을 줄일 수 있으며, 다른 스레드가 Lock을 해제할 때까지 대기하지 않아도 된다는 장점이 있습니다.

하지만 여러 스레드가 동일한 데이터에 접근하면 `CAS 실패와 재시도가 반복`되면서 오히려 성능이 저하될 수 있습니다.
또한 특정 스레드가 반복적으로 CAS에 실패하면 작업을 완료하지 못하는 `Starvation`이 발생할 수 있습니다.
이외에도 Lock-Free 알고리즘을 구현할 때는 `ABA 문제`와 `Check-Then-Act`상황에서 발생하는 Race Condition에 주의해야 합니다.
따라서 Lock-Free가 항상 Lock-based보다 빠른 것은 아니며, 공유 자원에 대한 경쟁 정도와 작업의 특성을 고려하여 선택해야 합니다.

---

# ABA 문제

ABA 문제란 CAS를 사용하는 과정에서 공유 변수의 값이 A에서 B로 변경되었다가 다시 A로 돌아오면서, `중간에 발생한 변경을 감지하지 못하는 문제`입니다.
다음은 ABA 문제가 발생하는 예시입니다.

```java
public class Main {
    public static void main(String[] args) {
        AtomicInteger count = new AtomicInteger(9);

        boolean condition1 = count.get() < 10; // Thread 1
        boolean condition2 = count.get() < 10; // Thread 2

        if (condition1) count.incrementAndGet();
        if (condition2) count.incrementAndGet();

        System.out.println(count.get()); // 11
    }
}
```

1. Thread 1이 공유 변수의 값 A를 읽습니다.
2. Thread 2가 값을 A → B → A 순서로 변경합니다.
3. Thread 1은 공유 변수의 값이 여전히 A라고 판단하여 CAS에 성공합니다.

CAS는 현재 값과 예상 값의 일치 여부만 비교하기 때문에 값이 다시 A로 돌아오면 중간에 변경이 없었던 것처럼 연산에 성공할 수 있습니다.
이때 CAS의 원자성 자체가 깨지는 것은 아니지만, `중간 변경 여부가 중요한 알고리즘에서는 논리적 오류`가 발생할 수 있습니다.

이를 해결하기 위해 `AtomicStampedReference`를 사용할 수 있습니다. AtomicStampedReference는 참조 값과 버전 번호를 함께 비교하고 갱신하므로, 값이 다시 A로 돌아오더라도 버전 번호의 변경을 통해 중간에 값이 변경되었다는 사실을 감지할 수 있습니다.

---

# Check-Then-Act 문제

CAS는 공유 변수의 값을 비교하고 변경하는 과정을 원자적으로 수행하지만, `여러 연산을 조합한 전체 작업의 원자성까지 보장하지는 않습니다.`
다음은 AtomicInteger를 사용하더라도 Race Condition이 발생하는 예시입니다.

```java
public class Main {
    public static void main(String[] args) {
        AtomicInteger count = new AtomicInteger(9);

        boolean t1 = count.get() < 10;
        boolean t2 = count.get() < 10;

        if (t1) count.incrementAndGet();
        if (t2) count.incrementAndGet();

        System.out.println(count.get()); // 11
    }
}
```

위 코드는 count가 10보다 작을 때만 값을 증가시키도록 작성되었습니다.
하지만 조건을 확인하는 과정과 값을 증가시키는 과정이 별도의 연산이기 때문에 문제가 발생할 수 있습니다.

1. count가 9인 상태에서 Thread 1이 조건을 확인합니다.
2. Thread 2도 count가 9인 상태에서 조건을 확인합니다.
3. Thread 1이 값을 10으로 증가시킵니다.
4. Thread 2도 값을 11로 증가시킵니다.

`incrementAndGet()` 자체는 원자적으로 수행되지만, 조건 확인과 값 변경 사이에 다른 스레드가 개입할 수 있습니다.
따라서 AtomicInteger를 사용하더라도 전체 작업의 원자성이 보장되지 않아 의도한 조건을 위반할 수 있습니다.
이를 해결하려면 조건 확인과 값 변경을 하나의 CAS 연산을 중심으로 구성해야 합니다.

```java
public class Main {
    public static void main(String[] args) {
        AtomicInteger count = new AtomicInteger(9);

        for (int i = 0; i < 2; i++) {
            while (true) {
                int current = count.get();

                if (current >= 10) break;
                if (count.compareAndSet(current, current + 1)) break;
            }
        }

        System.out.println(count.get()); // 10
    }
}
```

CAS에 실패하면 변경된 값을 다시 읽고 조건을 재확인하므로, 여러 스레드가 동시에 실행되더라도 count가 10을 초과하지 않도록 보장할 수 있습니다.
