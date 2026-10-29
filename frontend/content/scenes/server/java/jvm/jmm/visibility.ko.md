# 한눈에 보기

가시성(Visibility)이란 멀티스레드 환경에서 한 Thread가 공유 변수에 쓴 값을 다른 Thread가 관찰할 수 있는가를 의미합니다.
CPU 캐시나 JIT 컴파일러 최적화 등으로 인해 한 Thread가 공유 변수를 변경하더라도 다른 Thread가 변경된 값을 관찰한다는 보장이 없을 수 있습니다.

---

# 가시성(Visibility)이란?

가시성은 한 Thread가 `공유 변수`에 쓴 값을 `다른 Thread가 관찰`할 수 있는가를 나타냅니다.
다음 코드를 봅시다.

```java
public class Main {
    static boolean running = true;

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

개발자가 기대하는 흐름은 단순합니다.

1. worker Thread가 running을 반복해서 읽습니다.
2. main Thread가 1초 뒤 running에 false를 씁니다.
3. worker Thread가 false를 읽고 반복문을 종료합니다.

하지만 실제로는 `worker Thread가 반드시 종료된다고 보장할 수 없습니다.`
main Thread가 running을 false로 변경했음에도 worker Thread가 여전히 true를 읽고 있을 수 있기 때문입니다.
그렇다면 같은 공유 변수에 접근하는데도 왜 이런 문제가 발생하는 걸까요?

---

# 왜 가시성 문제가 발생할까?

이를 이해하기 위해 CPU 캐시를 살펴보겠습니다.
CPU는 메모리에 접근하는 비용을 줄이기 위해 자주 사용하는 데이터를 캐시에 저장합니다. 여러 CPU 코어에서 Thread가 실행된다면 각 코어는 자신의 캐시를 통해 데이터에 접근할 수 있습니다.
이러한 구조에서는 한 Thread가 공유 변수의 값을 변경했더라도 다른 Thread가 그 변경을 언제 관찰할 수 있는지가 중요해집니다.

앞선 코드에서 worker Thread가 running의 값을 true로 읽은 상태라고 가정해 보겠습니다.
이후 main Thread가 running을 false로 변경하더라도, worker Thread가 이전에 읽은 true 값을 계속 사용한다면 반복문을 종료하지 못할 수 있습니다.
이는 CPU의 메모리 시스템뿐 아니라 JIT 컴파일러가 이전에 읽은 값을 재사용하도록 최적화하는 등의 이유로 발생할 수 있습니다.

결국 가시성 문제의 핵심은 `Thread 사이에 적절한 동기화가 없다면 공유 변수의 변경 사항을 다른 Thread가 관찰한다는 보장이 없다`는 것입니다.
