# 한눈에 보기

Data Race는 여러 스레드가 동일한 변수에 접근할 때, 충돌하는 접근 사이에 Happens-Before 관계가 없어 발생하는 동시성 문제입니다.
메모리 가시성과 실행 순서에 관한 보장이 부족해 예상하지 못한 동작이 발생할 수 있으며, Race Condition과 달리 메모리 접근의 동기화 여부에 초점을 둡니다.
이를 방지하기 위해 synchronized, volatile, Atomic 등의 동기화 수단을 사용하며, 이러한 보장은 JMM을 통해 정의됩니다.

---

# Data Race란?

Data Race는 `여러 스레드`가 동일한 `공유 변수에 접근`할 때, 적절한 동기화 없이 읽기와 쓰기 또는 쓰기와 쓰기가 발생하는 상황을 의미합니다.
이러한 접근 사이에 Happens-Before 관계가 없다면, 한 스레드가 변경한 값을 다른 스레드가 언제 관찰할 수 있는지 보장되지 않습니다.

---

# Data Race의 발생 조건

Java에서는 다음 세 가지 조건이 모두 충족될 때 Data Race가 발생합니다.

1. 서로 다른 스레드가 동일한 변수에 접근합니다.
2. 적어도 하나의 스레드가 해당 변수를 변경합니다.
3. 두 접근 사이에 Happens-Before 관계가 존재하지 않습니다.

여기서 Happens-Before는 스레드 간 연산의 순서와 메모리 가시성을 보장하기 위해 JMM에서 정의하는 관계입니다.
즉, Data Race는 단순히 여러 스레드가 동일한 변수에 접근한다는 이유만으로 발생하지 않으며, `충돌하는 메모리 접근 사이에 적절한 동기화가 없을 때` 발생합니다.

---

# Data Race의 발생 예시

다음은 한 스레드가 공유 변수의 값을 변경하고, 다른 스레드가 변경된 값을 기다리는 예시입니다.

```java
public class Main {
    static boolean ready = false;

    public static void main(String[] args) {
        new Thread(() -> ready = true).start();

        while (!ready) {
            // 변경 대기
        }

        System.out.println("작업 시작");
    }
}
```

위 코드에서 새로운 스레드는 `ready`를 true로 변경하고, 메인 스레드는 해당 값이 true가 될 때까지 반복해서 읽습니다.
하지만 두 스레드의 공유 변수 접근 사이에는 Happens-Before 관계가 존재하지 않습니다. 따라서 새로운 스레드가 `ready`를 true로 변경하더라도 `메인 스레드가 변경된 값을 관찰한다는 보장이 없습니다.`

이로 인해 메인 스레드는 계속 false를 읽으면서 반복문을 빠져나오지 못할 수도 있습니다.
이처럼 Data Race가 발생하면 메모리 가시성 문제로 인해 예상하지 못한 동작이 발생할 수 있습니다.

---

# Data Race를 해결하는 방법

Data Race를 방지하려면 공유 변수에 대한 충돌하는 접근 사이에 적절한 `Happens-Before 관계를 형성`해야 합니다.
Java에서는 synchronized, volatile, Atomic 클래스 등의 동기화 수단을 사용할 수 있습니다.
앞서 살펴본 예시는 volatile을 사용하여 해결할 수 있습니다.

```
static volatile boolean ready = false;
```

volatile은 변수에 대한 쓰기와 이후 읽기 사이에 Happens-Before 관계를 형성할 수 있도록 하여, 스레드 간 메모리 가시성을 보장합니다.
다만 volatile은 count++와 같은 복합 연산의 원자성을 보장하지 않습니다. 따라서 Data Race를 방지하는 것과 전체 작업의 논리적 정확성을 보장하는 것은 구분해야 합니다.
이러한 메모리 접근과 동기화의 보장 원리는 `JMM`에서 정의합니다.

---

# Race Condition과 Data Race의 차이

Race Condition과 Data Race는 모두 여러 스레드의 공유 자원 접근과 관련이 있지만, 서로 다른 관점의 문제입니다.

- Race Condition: 스레드의 실행 순서에 따라 프로그램의 논리적 결과가 달라지는 문제입니다.
- Data Race: 서로 다른 스레드가 동일한 변수에 접근하고, 적어도 하나가 쓰기 연산이며, 두 접근 사이에 Happens-Before 관계가 없는 상황입니다.

앞서 살펴본 count++ 예시는 Race Condition과 Data Race가 함께 발생할 수 있는 사례입니다.
하지만 Data Race가 발생하지 않더라도 Race Condition은 발생할 수 있습니다.
다음은 AtomicInteger를 활용한 예시입니다.

```
AtomicInteger count = new AtomicInteger(9);

void increment() {
    if (count.get() < 10) {
        count.incrementAndGet();
    }
}
```

AtomicInteger의 개별 연산은 원자성과 필요한 메모리 동기화를 보장하므로 Data Race는 발생하지 않습니다.
하지만 두 스레드가 모두 count가 9인 것을 확인하고 값을 증가시키면 최종 값이 11이 될 수 있습니다.
이는 개별 연산이 원자적으로 수행되더라도 `조건 확인과 값 변경으로 구성된 전체 작업의 원자성`까지 보장되는 것은 아니기 때문입니다.
즉, Race Condition은 작업의 실행 순서와 논리적 정확성에 초점을 두며, Data Race는 공유 메모리 접근의 동기화 여부에 초점을 둡니다.
