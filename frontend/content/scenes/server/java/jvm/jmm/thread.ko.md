# Thread 연산이란?

Java에서는 volatile이나 synchronized를 사용하지 않더라도 `Thread의 시작, 종료, 인터럽트 감지`와 같은 특정 연산을 통해 Happens-Before 관계가 성립할 수 있습니다.
이러한 관계를 통해 일반 공유 변수에 대한 가시성과 메모리 연산 순서도 보장할 수 있습니다.

대표적으로 다음과 같은 규칙이 있습니다.

- `Thread.start()`: Thread를 시작하기 전의 동작은 새로 시작된 Thread의 동작보다 Happens-Before 관계에 있습니다.
- `Thread.join()`: Thread 내부의 모든 동작은 다른 Thread가 해당 Thread의 종료를 join()으로 확인한 이후의 동작보다 Happens-Before 관계에 있습니다.
- `Thread.interrupt()`: interrupt() 호출은 다른 Thread가 해당 인터럽트를 감지하는 동작보다 Happens-Before 관계에 있습니다.

---

# Thread.start()

Thread.start()는 새로운 Thread를 시작하는 메서드입니다.
JMM에서는 `start() 호출 이전의 동작과 새로 시작된 Thread의 동작 사이에 Happens-Before 관계`가 성립하도록 보장합니다.

다음 코드를 살펴봅시다.

```java
public class Main {
    static int data = 0;

    public static void main(String[] args) throws InterruptedException {
        data = 42;

        Thread worker = new Thread(() -> {
            System.out.println(data);
        });

        worker.start();
        worker.join();
    }
}
```

위 코드는 반드시 `42`를 출력합니다.
data는 volatile이 아닌 일반 변수이지만, Main Thread에서 data = 42를 수행한 뒤 worker.start()를 호출했기 때문입니다.

Happens-Before 관계는 다음과 같이 형성됩니다.

1. `Program Order`: Main Thread의 data = 42는 worker.start()보다 Happens-Before 관계에 있습니다.
2. `Synchronizes-With`: worker.start()는 Worker Thread의 첫 동작과 Synchronizes-With 관계를 형성합니다.
3. `Transitivity`: 두 관계가 연결되면서 data = 42는 Worker Thread의 data 읽기보다 Happens-Before 관계에 놓입니다.

따라서 Worker Thread는 Main Thread가 start() 이전에 기록한 값을 관찰할 수 있습니다.

여기서 중요한 점은 `start() 이후에 발생한 Main Thread의 변경까지 자동으로 보장하지는 않는다`는 것입니다.

---

# Thread.join()

Thread.join()은 대상 Thread가 종료될 때까지 호출한 Thread를 대기시키는 메서드입니다.
JMM에서는 `대상 Thread 내부의 모든 동작과 해당 Thread의 종료를 확인한 이후의 동작 사이에 Happens-Before 관계`를 보장합니다.

다음 코드를 살펴봅시다.

```java
public class Main {
    static int data = 0;

    public static void main(String[] args) throws InterruptedException {
        Thread worker = new Thread(() -> {
            data = 42;
        });

        worker.start();
        worker.join();

        System.out.println(data);
    }
}
```

위 코드도 반드시 `42`를 출력합니다.
Worker Thread에서 data를 변경한 뒤 Main Thread가 join()을 통해 Worker Thread의 종료를 확인하기 때문입니다.

Happens-Before 관계는 다음과 같이 형성됩니다.

1. `Program Order`: Worker Thread의 data = 42는 Thread의 종료보다 Happens-Before 관계에 있습니다.
2. `Synchronizes-With`: Worker Thread의 종료는 Main Thread가 join()을 통해 해당 종료를 확인하는 동작과 Synchronizes-With 관계를 형성합니다.
3. `Transitivity`: 두 관계가 연결되면서 Worker Thread의 data = 42는 Main Thread의 data 읽기보다 Happens-Before 관계에 놓입니다.

따라서 Main Thread는 Worker Thread가 기록한 42를 관찰합니다.

여기서 주의할 점은 `join()이 복합 연산의 원자성까지 보장하지는 않는다`는 것입니다.
여러 Thread가 동시에 count++를 실행했다면 Lost Update가 발생할 수 있으며, join()은 이미 발생한 Lost Update를 해결하지 못합니다.

또한 시간 제한이 있는 join()이 대상 Thread의 종료를 확인하지 못하고 반환하거나, 대기 중 InterruptedException이 발생한 경우에는 해당 종료에 따른 Happens-Before 관계를 보장받을 수 없습니다.

---

# Thread.interrupt()

Thread.interrupt()는 다른 Thread에 인터럽트를 요청하는 메서드입니다.
JMM에서는 `interrupt() 호출과 해당 인터럽트를 감지하는 동작 사이에 Happens-Before 관계`가 성립합니다.

인터럽트 감지는 InterruptedException 발생이나 isInterrupted(), Thread.interrupted() 등의 호출을 통해 이루어질 수 있습니다.

다음 코드를 살펴봅시다.

```java
public class Main {
    static int data = 0;

    public static void main(String[] args) throws InterruptedException {
        Thread worker = new Thread(() -> {
            while (!Thread.currentThread().isInterrupted()) {
                Thread.onSpinWait();
            }

            System.out.println(data);
        });

        worker.start();

        data = 42;
        worker.interrupt();

        worker.join();
    }
}
```

Main Thread는 data를 42로 변경한 뒤 Worker Thread에 인터럽트를 요청합니다.
Worker Thread는 인터럽트 상태를 확인하고 반복문을 종료한 뒤 data를 출력합니다.

Happens-Before 관계는 다음과 같이 형성됩니다.

1. `Program Order`: Main Thread의 data = 42는 worker.interrupt()보다 Happens-Before 관계에 있습니다.
2. `Synchronizes-With`: worker.interrupt()는 Worker Thread가 인터럽트를 감지하는 동작과 Synchronizes-With 관계를 형성합니다.
3. `Transitivity`: 두 관계가 연결되면서 data = 42는 Worker Thread의 data 읽기보다 Happens-Before 관계에 놓입니다.

따라서 Worker Thread가 해당 인터럽트를 감지하여 반복문을 종료하면 `42`를 출력합니다.

여기서 중요한 점은 `interrupt() 자체가 Thread를 강제로 종료시키지는 않는다`는 것입니다.
인터럽트는 종료를 요청하는 신호이며, 대상 Thread가 이를 감지하고 적절히 처리해야 합니다.

또한 인터럽트가 발생했다는 사실만으로 무조건 Happens-Before 관계가 완성되는 것은 아닙니다. 인터럽트 요청과 이를 감지하는 동작 사이에 관계가 성립한다는 점을 구분해야 합니다.
