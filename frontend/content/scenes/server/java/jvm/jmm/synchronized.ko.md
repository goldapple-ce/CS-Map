# 한눈에 보기

`synchronized`는 여러 Thread가 공유 자원에 접근할 때 `상호 배제`를 통해 `원자성`을 확보하고, `가시성`과 메모리 연산 `순서`를 보장하는 Java 키워드입니다.
동일한 Monitor Lock을 획득한 Thread만 보호된 코드 영역에 진입할 수 있으며, Lock의 해제와 이후 획득 사이에는 Happens-Before 관계가 성립합니다.
따라서 synchronized는 volatile과 달리 `가시성, 순서, 원자성` 문제를 모두 제어할 수 있지만, 동일한 Lock을 기준으로 동기화해야 합니다.

---

# synchronized란?

synchronized는 `Monitor Lock`을 이용해 `임계 영역`에 대한 `상호 배제`를 제공하는 Java 키워드입니다.
이를 통해 여러 Thread가 공유 자원에 동시에 접근하면서 발생하는 `원자성` 문제를 방지하고, Happens-Before 관계를 통해 `가시성`과 메모리 연산 `순서`도 보장합니다.

---

# 임계 영역(Critical Section)

임계 영역은 여러 Thread가 동시에 실행하면 공유 자원의 일관성이 깨질 수 있어 `동시 접근을 제어해야 하는 코드 영역`입니다.

```java
class Counter {
    int count = 0;

    void increment() {
        count++;
    }
}
```

위 코드에서 여러 Thread가 동일한 Counter 객체의 increment()를 호출하면 count++의 Read-Modify-Write 연산이 서로 뒤섞이면서 Lost Update가 발생할 수 있습니다.
따라서 count++는 여러 Thread가 동시에 실행하지 못하도록 보호해야 하는 임계 영역입니다.

---

# 상호 배제(Mutual Exclusion)

상호 배제는 여러 Thread가 동일한 임계 영역에 `동시에 진입하지 못하도록 제한하는 성질`입니다.
한 Thread가 임계 영역을 실행하고 있다면 다른 Thread는 해당 영역에 진입하지 못하도록 하여 공유 자원의 일관성을 유지합니다.

synchronized는 이러한 상호 배제를 Monitor Lock을 통해 구현합니다.
다만 상호 배제는 원자성을 확보하는 방법 중 하나이며, CAS와 같은 원자적 연산을 이용하면 Lock 없이도 특정 연산의 원자성을 보장할 수 있습니다.

---

# Monitor Lock

Monitor Lock은 `객체와 연결된 Monitor`를 통해 Thread의 `동기화 영역 진입을 제어하는 잠금 장치`입니다.
Java의 모든 객체에는 Monitor가 연결되어 있으며, synchronized는 해당 객체의 Monitor Lock을 사용합니다.

Thread가 synchronized 영역에 진입하려면 해당 객체의 Monitor Lock을 획득해야 합니다. 이때 동일한 Lock은 한 번에 하나의 Thread만 소유할 수 있습니다.

Monitor Lock은 다음과 같이 동작합니다.

1. `Lock 획득(Acquire)`: Thread가 synchronized 영역에 진입하면서 Monitor Lock을 획득합니다.
2. `Lock 대기(Block)`: 다른 Thread가 동일한 Monitor Lock을 소유하고 있다면 Lock이 해제될 때까지 대기합니다.
3. `Lock 해제(Release)`: Thread가 synchronized 영역을 벗어나면 Monitor Lock을 해제합니다.

여기서 중요한 점은 `Monitor Lock은 객체를 기준으로 동작한다`는 것입니다.
따라서 서로 다른 객체의 Monitor Lock을 사용한다면 synchronized 영역도 동시에 실행할 수 있습니다.

또한 Monitor Lock은 `재진입(Reentrant)`을 지원합니다. 이미 Lock을 보유한 Thread는 동일한 Lock을 다시 획득할 수 있으므로 자기 자신이 보유한 Lock 때문에 대기하지 않습니다.

---

# synchronized 사용 방식

synchronized는 메서드 전체에 선언하거나 특정 코드 블록에 적용할 수 있습니다.

```java
class Counter {
    int count = 0;

    synchronized void increment() {
        count++;
    }

    void decrement() {
        synchronized (this) {
            count--;
        }
    }
}
```

위 코드에서 increment()는 synchronized 메서드이고, decrement()는 synchronized 블록을 사용합니다.
두 방식 모두 동일한 Counter 객체의 Monitor Lock을 사용하므로 두 Thread가 각각 increment()와 decrement()의 동기화 영역을 동시에 실행할 수 없습니다.

인스턴스 synchronized 메서드는 `this` 객체의 Monitor Lock을 사용하지만, static synchronized 메서드는 해당 클래스의 `Class 객체`에 연결된 Monitor Lock을 사용합니다.
또한 synchronized는 동일한 Monitor Lock을 사용하는 영역끼리만 상호 배제를 제공합니다. 따라서 synchronized가 적용되지 않은 일반 메서드까지 자동으로 실행이 제한되는 것은 아닙니다.

---

# 원자성 보장

synchronized는 상호 배제를 통해 복합 연산의 원자성을 확보할 수 있습니다.
다음 코드를 봅시다. 원자성 Topic에서 increment() 메서드에 synchronized 키워드를 선언한 코드입니다.

```java
class Counter {
    int count = 0;

    synchronized void increment() {
        count++;
    }
}

public class Main {
    public static void main(String[] args) throws InterruptedException {
        Counter counter = new Counter();

        Thread threadA = new Thread(() -> counter.increment());
        Thread threadB = new Thread(() -> counter.increment());

        threadA.start();
        threadB.start();

        threadA.join();
        threadB.join();

        System.out.println(counter.count);
    }
}
```

기존 코드에서는 두 Thread가 count++를 동시에 수행하면서 Lost Update가 발생할 수 있었습니다.
하지만 synchronized를 선언한 코드에서는 최종 결과가 반드시 2로 출력됩니다.

이는 두 Thread가 동일한 Counter 객체의 Monitor Lock을 사용하기 때문입니다.

1. Thread A가 increment()에 진입하면서 Monitor Lock을 획득합니다.
2. Thread B도 increment()를 호출하지만, 동일한 Monitor Lock을 획득할 수 없어 대기합니다.
3. Thread A가 count++를 완료하고 Monitor Lock을 해제합니다.
4. Thread B가 Monitor Lock을 획득한 후 count++를 수행합니다.

물론 Thread B가 먼저 Lock을 획득할 수도 있지만, 중요한 것은 두 Thread가 동일한 임계 영역을 동시에 실행할 수 없다는 것입니다.
따라서 count++의 Read-Modify-Write 과정이 다른 Thread의 연산과 뒤섞이지 않으므로 Lost Update가 발생하지 않습니다.

즉, synchronized는 Monitor Lock을 이용한 상호 배제로 복합 연산의 원자성을 보장합니다. 단, 동일한 공유 자원에 접근하는 다른 코드도 같은 Monitor Lock을 사용해야 이러한 보장이 유지됩니다.

---

# 순서 보장

synchronized는 상호 배제뿐 아니라 Happens-Before 관계를 통해 가시성과 메모리 연산 순서도 보장합니다.
다음 코드를 봅시다. 순서 Topic에서 살펴본 코드에 synchronized를 적용한 예제입니다. 동일한 Monitor Lock을 사용하도록 공유 변수를 Shared 객체로 묶었습니다.

```java
public class Main {
    static class Shared {
        private int data = 0;
        private boolean ready = false;

        synchronized void write() {
            data = 42;
            ready = true;
        }

        synchronized void read() {
            if (ready) {
                System.out.println(data);
            }
        }
    }

    public static void main(String[] args) throws InterruptedException {
        Shared shared = new Shared();

        Thread threadA = new Thread(shared::write);
        Thread threadB = new Thread(shared::read);

        threadA.start();
        threadB.start();

        threadA.join();
        threadB.join();
    }
}
```

두 Thread는 동일한 Shared 객체의 Monitor Lock을 사용합니다.
Thread A가 먼저 Lock을 획득하여 write()를 완료한 후 Thread B가 read()를 실행한다면 `42`가 출력됩니다.

이때 Happens-Before 관계는 다음과 같이 형성됩니다.

1. `Program Order`: Thread A의 data = 42와 ready = true는 Monitor Lock 해제보다 Happens-Before 관계에 있습니다.
2. `Synchronizes-With`: Thread A의 Monitor Lock 해제와 이후 Thread B의 동일한 Monitor Lock 획득 사이에 Synchronizes-With 관계가 성립합니다.
3. `Program Order`: Thread B의 Monitor Lock 획득은 ready와 data를 읽는 동작보다 Happens-Before 관계에 있습니다.
4. `Transitivity`: 앞선 관계가 연결되면서 Thread A의 변수 변경과 Thread B의 변수 읽기 사이에 Happens-Before 관계가 성립합니다.

따라서 Thread B가 ready를 true로 관찰했다면 data는 반드시 `42`로 관찰됩니다.
다만 Thread B가 먼저 Lock을 획득했다면 ready는 false이므로 아무것도 출력하지 않을 수 있습니다.

여기서 중요한 점은 `data와 ready가 모두 일반 변수라는 것`입니다.
synchronized는 동일한 Monitor Lock의 해제와 이후 획득 사이에 Happens-Before 관계를 형성하므로, volatile을 사용하지 않아도 일반 변수의 가시성과 순서를 보장할 수 있습니다.

---

# 가시성 보장

synchronized는 Happens-Before 관계를 통해 공유 변수의 가시성을 보장합니다.
다음 코드를 봅시다. 가시성 Topic에서 살펴본 코드에 synchronized를 적용한 예제입니다. 동일한 Monitor Lock을 사용하도록 running 변수와 접근 메서드를 Shared 객체로 묶었습니다.

```java
public class Main {
    static class Shared {
        private boolean running = true;

        synchronized boolean isRunning() {
            return running;
        }

        synchronized void stop() {
            running = false;
        }
    }

    public static void main(String[] args) throws InterruptedException {
        Shared shared = new Shared();

        Thread worker = new Thread(() -> {
            while (shared.isRunning()) {
                // 작업 수행
            }
            System.out.println("종료");
        });

        worker.start();

        Thread.sleep(1000);
        shared.stop();

        worker.join();
    }
}
```

기존 코드에서는 Worker Thread가 running의 변경을 관찰한다는 보장이 없었으므로 반복문이 종료되지 않을 수 있었습니다.
하지만 synchronized를 적용하면 Worker Thread는 running이 false로 변경된 값을 관찰할 수 있습니다.

이는 isRunning()과 stop()이 동일한 Shared 객체의 Monitor Lock을 사용하기 때문입니다.

1. `Program Order`: Main Thread에서 running = false는 stop()의 Monitor Lock 해제보다 Happens-Before 관계에 있습니다.
2. `Synchronizes-With`: Main Thread의 Monitor Lock 해제와 이후 Worker Thread의 동일한 Monitor Lock 획득 사이에 Synchronizes-With 관계가 성립합니다.
3. `Program Order`: Worker Thread의 Monitor Lock 획득은 running을 읽는 동작보다 Happens-Before 관계에 있습니다.
4. `Transitivity`: 앞선 관계들이 연결되면서 Main Thread의 running 변경은 Worker Thread의 이후 읽기 동작보다 Happens-Before 관계에 놓입니다.

따라서 Worker Thread가 stop()의 Lock 해제 이후 isRunning()에서 Lock을 획득하면 running을 false로 관찰하여 반복문을 종료합니다.

여기서 중요한 점은 `running이 volatile이 아닌 일반 변수라는 것`입니다.
synchronized는 동일한 Monitor Lock의 해제와 이후 획득 사이에 Happens-Before 관계를 형성하므로, 일반 변수의 변경도 다른 Thread에서 관찰할 수 있도록 보장합니다.

다만 synchronized가 Worker Thread의 즉각적인 실행이나 종료 시점까지 보장하는 것은 아닙니다.
