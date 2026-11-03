# 한눈에 보기

Lock-Based는 `Lock을 이용한 상호 배제`를 통해 `임계 영역`의 동시 실행을 제한하는 `동시성 제어 방식`입니다.
공유 자원에 대한 작업의 원자성과 메모리 가시성을 보장할 수 있으며, Java에서는 synchronized와 ReentrantLock 등이 대표적으로 사용됩니다.
다만 Lock 경쟁에 따른 성능 저하와 `Deadlock`, `Livelock`, `Starvation` 등의 문제가 발생할 수 있으므로 적절한 Lock 설계가 필요합니다.

---

# Lock-Based란?

Lock-Based는 여러 스레드가 공유 자원에 접근할 때, `Lock을 이용한 상호 배제`를 통해 동시성을 제어하는 방식입니다.
여러 스레드가 동일한 공유 자원에 접근하더라도 `Lock을 획득한 스레드만 임계 영역을 실행`할 수 있으며, 다른 스레드는 `Lock이 해제될 때까지 기다려`야 합니다.
이를 통해 공유 자원에 대한 작업이 서로 간섭하지 않도록 하여 데이터의 일관성을 유지합니다.

---

# Lock-Based의 동작 원리

Lock-Based는 임계 영역에 대한 접근을 제한하기 위해 Lock의 획득과 해제 과정을 사용합니다.

1. `Lock 획득`: 스레드가 임계 영역에 진입하기 전에 Lock 획득을 시도합니다.
2. `임계 영역 실행`: Lock을 획득한 스레드만 공유 자원에 접근하여 작업을 수행합니다.
3. `Lock 해제`: 작업이 끝나면 Lock을 해제하여 다른 스레드가 진입할 수 있도록 합니다.

다음 코드는 ReentrantLock을 기반으로 작성한 코드입니다.

```java
public class Main {
    static final ReentrantLock lock = new ReentrantLock();
    static int count = 0;

    static void increment() {
        lock.lock(); // Lock 획득
        try {
            count++; // 임계 영역 실행
        } finally {
            lock.unlock(); // Lock 해제
        }
    }

    public static void main(String[] args) throws InterruptedException {
        Thread t1 = new Thread(Main::increment);
        Thread t2 = new Thread(Main::increment);

        t1.start();
        t2.start();
        t1.join();
        t2.join();

        System.out.println(count); // 2
    }
}
```

여러 스레드가 동시에 increment()를 호출하더라도 Lock을 획득한 스레드만 count++를 실행할 수 있습니다.
다른 스레드는 Lock이 해제될 때까지 기다리므로 Lost Update가 발생하지 않습니다.
또한 finally에서 Lock을 해제하여 작업 중 예외가 발생하더라도 Lock이 유지되는 상황을 방지합니다.

---

# Lock-Based의 구현 방법

Java에서는 대표적으로 다음과 같은 동기화 수단을 제공합니다.

- `synchronized`: 객체의 모니터 Lock을 이용해 상호 배제를 보장합니다.
- `ReentrantLock`: 명시적인 Lock 획득과 해제를 지원하며, 공정성 설정, 타임아웃, 인터럽트 가능한 Lock 획득 등의 기능을 제공합니다.
- `Semaphore`: 허가 수를 통해 공유 자원에 동시에 접근할 수 있는 스레드 수를 제한합니다.

Semaphore는 엄밀히 말하면 Lock 자체는 아니지만, 허가 수를 1로 설정하면 상호 배제와 유사한 접근 제어를 구현할 수 있습니다.

---

# Lock-Based의 장단점

Lock-Based는 상호 배제를 통해 임계 영역의 동시 실행을 제한하므로 공유 자원에 대한 작업의 `원자성과 데이터 일관성을 보장하기 쉽다`는 장점이 있습니다.
또한 여러 연산으로 구성된 복잡한 작업도 하나의 임계 영역으로 묶어 보호할 수 있습니다.

하지만 Lock을 사용하기 때문에 다음과 같은 문제가 발생할 수 있습니다.

- `Lock Contention`: 여러 스레드가 동일한 Lock을 획득하려고 경쟁하면서 대기 시간이 증가할 수 있습니다.
- `Deadlock`: 여러 스레드가 서로 상대방의 Lock 해제를 기다리면서 작업을 진행하지 못할 수 있습니다.
- `Livelock`: 스레드들이 충돌을 피하려고 계속 상태를 변경하지만 실제 작업은 진행되지 않을 수 있습니다.
- `Starvation`: 특정 스레드가 지속적으로 Lock을 획득하지 못해 작업을 완료하지 못할 수 있습니다.

따라서 Lock-Based는 공유 자원에 대한 동시 접근을 안전하게 제어할 수 있지만, Lock의 범위와 획득 순서, 경쟁 정도를 고려하여 설계해야 합니다.

---

# Lock-Based와 Lock-Free의 차이

두 방식의 가장 큰 차이는 `작업의 진행을 Lock 획득에 의존하는지 여부`입니다.

- `Lock-Based`: `상호 배제`를 통해 임계 영역에 대한 동시 접근을 제한합니다.
- `Lock-Free`: Lock 없이 `원자적 연산`을 활용하여 동시 접근을 허용하면서도 공유 상태를 안전하게 갱신합니다.

단, Lock-Based 역시 내부 구현에 CAS와 같은 원자적 연산을 사용할 수 있습니다. 따라서 `CAS의 사용 여부가 아니라` 알고리즘이 Lock에 의존하는지에 따라 구분해야 합니다.
