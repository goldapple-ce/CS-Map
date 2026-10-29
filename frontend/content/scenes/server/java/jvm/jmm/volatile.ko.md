# 한눈에 보기

`volatile`은 멀티스레드 환경에서 공유 변수의 `가시성`과 메모리 연산 `순서`를 보장하는 Java 키워드입니다.
volatile 변수에 대한 Write와 동기화 순서상 이후의 Read 사이에는 `Synchronizes-With` 관계가 성립하며, 이를 통해 `Happens-Before 관계가 형성`됩니다.
이 관계는 Program Order와 전이성(Transitivity)을 통해 일반 변수의 메모리 접근까지 연결되어 가시성과 순서를 보장할 수 있습니다.

---

# Volatile이란?

> 기존에는 Main Memory와 Working Memory를 중심으로 설명했지만, 현재는 Happens-Before 관계를 통해 메모리 동작의 보장을 정의합니다.

volatile은 공유 변수의 `가시성`과 메모리 연산 `순서`를 보장하는 Java 키워드입니다. 즉, 특정 메모리 동작 사이에 Happens-Before 관계를 형성하는 수단입니다.

---

# 가시성 보장

다음 코드를 봅시다. 가시성 Topic에서 살펴본 `running에 volatile을 선언`한 코드입니다.

```java
public class Main {
    static volatile boolean running = true; // volatile 선언

    public static void main(String[] args) throws InterruptedException {
        Thread worker = new Thread(() -> {
            while (running) {
                // 작업 수행
            }
            System.out.println("종료");
        });

        worker.start();

        Thread.sleep(1000);
        running = false;
    }
}
```

일반적인 공유 변수라면 main Thread가 running을 false로 변경하더라도 worker Thread가 변경된 값을 관찰한다는 보장이 없습니다.
하지만 running을 volatile로 선언하면 다음과 같은 메모리 동작 규칙이 적용됩니다.

1. worker Thread가 반복문에서 running의 값인 true를 반복해서 읽습니다.
   - running은 volatile 변수이므로 이 동작은 `volatile Read`에 해당합니다.
2. main Thread가 running의 값을 false로 변경합니다.
   - 이 동작은 `volatile Write`에 해당합니다.
3. 이후 worker Thread가 running을 다시 읽습니다.
   - main Thread의 volatile Write보다 동기화 순서상 나중에 발생한 volatile Read이므로 두 동작 사이에 `Synchronizes-With` 관계가 성립하고, 이에 따라 Happens-Before 관계도 성립합니다.
4. 따라서 worker Thread는 변경된 false 값을 읽고 반복문을 종료합니다.

즉, volatile은 공유 변수의 변경 사항을 다른 Thread가 관찰할 수 있도록 `가시성을 보장`합니다.
다만 worker Thread가 즉시 실행되거나 특정 시간 안에 종료되는 것까지 보장하지는 않습니다.

---

# 연산 순서 보장

다음 코드를 봅시다. 해당 코드는 순서 Topic에서 살펴본 `ready에 volatile`을 선언한 코드입니다.

```java
public class Main {
    static class Shared {
        int data = 0;
        volatile boolean ready = false;
    }

    public static void main(String[] args) {
        Shared shared = new Shared();

        Thread threadA = new Thread(() -> {
            shared.data = 42;
            shared.ready = true;
        });

        Thread threadB = new Thread(() -> {
            if (shared.ready) {
                System.out.println(shared.data);
            }
        });

        threadA.start();
        threadB.start();
    }
}
```

기존 코드에서는 threadB가 ready를 true로 읽더라도 data의 변경 사항까지 관찰한다는 보장이 없었습니다. 따라서 ready는 true지만 data는 0으로 읽을 수 있었습니다.
하지만 ready를 volatile로 선언하면 threadB가 ready를 true로 읽었을 때 data의 값이 `42`라는 것이 보장됩니다.
왜 이런 차이가 발생하는 걸까요?

이를 이해하기 위해 Happens-Before 관계를 살펴보겠습니다.

1. `Program Order`: threadA는 data에 42를 저장한 뒤 ready를 true로 변경합니다. 따라서 두 동작 사이에 Happens-Before 관계가 성립합니다.
2. `Synchronizes-With`: threadA가 ready를 true로 변경하는 동작은 volatile Write에 해당합니다. 이후 threadB가 ready를 읽는 동작은 volatile Read에 해당하며, 두 동작 사이에 Synchronizes-With 관계가 성립합니다.
3. `Program Order`: threadB는 ready를 읽은 다음 data를 읽습니다. 따라서 두 동작 사이에도 Happens-Before 관계가 성립합니다.
4. `Transitivity`: 앞선 관계들이 연결되면서 threadA의 data = 42와 threadB의 data 읽기 사이에도 Happens-Before 관계가 성립합니다.

따라서 threadB가 ready를 true로 확인했다면 data의 값으로 `42`를 읽는 것이 보장됩니다. 다만 ready를 false로 읽었다면 아무것도 출력하지 않을 수 있습니다.

여기서 중요한 점은 `data는 volatile로 선언하지 않았다는 것`입니다.
volatile은 해당 변수에 대한 읽기와 쓰기 사이에 Synchronizes-With 관계를 형성하며, Program Order와 전이성을 통해 일반 변수의 메모리 변경까지 가시성과 순서가 보장되도록 합니다.

즉, `volatile은 다른 Thread에서 필요한 메모리 연산의 순서가 보장되도록 하는 역할`도 수행합니다.
다만 실제 CPU가 모든 명령어를 코드에 작성된 순서 그대로 실행해야 한다는 의미는 아닙니다. JMM이 요구하는 순서와 가시성이 유지되는 범위에서는 최적화가 허용됩니다.

---

# 원자성은 보장할까?

volatile은 가시성과 순서를 보장하지만, `여러 동작으로 구성된 복합 연산의 원자성은 보장하지 않습니다.`

```java
class Counter {
    volatile int count = 0;

    void increment() {
        count++;
    }
}
```

count++는 값을 읽고, 증가시키고, 다시 저장하는 Read-Modify-Write 복합 연산입니다.
count가 volatile로 선언되어 있더라도 여러 Thread가 동시에 increment()를 호출하면 각 동작이 서로 뒤섞이면서 Lost Update(갱신 손실)가 발생할 수 있습니다.

결국 volatile은 공유 변수의 가시성과 순서 보장이 필요한 상황에서 사용할 수 있지만, `복합 연산의 원자성이나 상호 배제가 필요한 경우에는 volatile만으로 충분하지 않습니다.`

---

# 참고자료

- [JSR-133 FAQ](https://www.cs.umd.edu/%7Epugh/java/memoryModel/jsr-133-faq.html#volatile)
