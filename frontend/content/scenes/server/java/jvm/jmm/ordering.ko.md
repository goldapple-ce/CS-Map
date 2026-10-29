# 한눈에 보기

순서(Ordering)란 멀티스레드 환경에서 `한 Thread의 메모리 연산이 다른 Thread에 어떤 순서로 관찰되는가`를 의미합니다.
CPU나 컴파일러는 `Reordering(재정렬)`을 수행할 수 있으며, 이로 인해 다른 Thread에서 메모리 변경이 코드에 작성된 순서와 다르게 관찰될 수 있습니다.

---

# 순서(Ordering)란?

순서는 `한 Thread의 메모리 동작이 다른 Thread에 어떤 순서로 관찰될 수 있는가`를 나타냅니다.
다음 코드를 봅시다.

```java
public class Main {
    static class Shared {
        int data = 0;
        boolean ready = false;
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

개발자가 기대하는 흐름은 단순합니다.

1. threadA가 data에 42를 저장합니다.
2. threadA가 ready를 true로 변경합니다.
3. threadB가 ready를 true로 읽었다면 data에 저장된 42를 출력합니다.

하지만 실제로는 threadB가 ready를 true로 읽었더라도 data의 값으로 반드시 `42를 읽는다고 보장할 수 없습니다.`
두 Thread 사이에 메모리 연산의 관찰 순서를 보장하는 동기화가 없기 때문에 ready는 true로 관찰하면서 data는 이전 값인 0으로 관찰할 수도 있습니다.
그렇다면 코드에 작성된 순서와 다른 순서로 메모리 변경이 관찰되는 이유는 무엇일까요?

---

# 왜 순서 문제가 발생할까?

이를 이해하기 위해 `Reordering(재정렬)`이라는 개념을 살펴보겠습니다.
Reordering은 컴파일러나 CPU가 성능 최적화를 위해 메모리 연산의 순서를 변경하는 것을 의미합니다.

앞선 코드에서 threadA는 다음 순서로 값을 변경합니다.

```java
shared.data = 42;     // 1
shared.ready = true;  // 2
```

코드에서는 data를 먼저 변경한 후 ready를 변경하도록 작성되어 있습니다.
하지만 두 Thread 사이에 적절한 동기화가 없다면 다른 Thread에서도 반드시 동일한 순서로 변경 사항이 관찰되는 것은 아닙니다.

예를 들어 threadB가 ready의 변경을 먼저 관찰하고, data의 변경은 아직 관찰하지 못하는 상황이 발생할 수 있습니다.
그 결과 ready는 true이지만 data는 0으로 읽는 것이 가능합니다.

다만 이러한 결과가 반드시 실제 명령어의 실행 순서가 뒤바뀌었다는 의미는 아닙니다. CPU의 메모리 시스템이나 컴파일러 최적화에 의해 다른 Thread에서 연산 순서가 바뀐 것처럼 관찰될 수도 있습니다.
또한 `Reordering 자체가 잘못된 동작은 아닙니다.` 컴파일러와 CPU는 JMM이 허용하는 범위 안에서 실행을 최적화할 수 있습니다.

결국 순서 문제의 핵심은 `Thread 사이에 적절한 동기화가 없다면 메모리 연산이 작성된 순서대로 다른 Thread에 관찰된다는 보장이 없다`는 것입니다.
