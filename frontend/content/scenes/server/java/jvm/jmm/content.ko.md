# 한눈에 보기

JMM(Java Memory Model)은 `여러 스레드가 공유 변수에 접근`할 때 어떤 값을 읽을 수 있고, 메모리 연산의 순서가 어떻게 보장되는지를 `정의한 규칙`입니다.  
멀티스레드 환경에서는 CPU 캐시와 컴파일러 최적화, 스레드 간 연산의 충돌로 인해 `가시성, 순서, 원자성` 문제가 발생할 수 있습니다.  
JMM은 `Happens-Before` 관계를 통해 가시성과 순서의 보장 조건을 정의하고, 변수의 읽기와 쓰기에 대한 원자성 규칙도 제공합니다.
Java에서는 volatile과 synchronized 등의 동기화 수단을 통해 필요한 보장을 확보할 수 있습니다.

---

# JMM이란?

JMM은 Java Memory Model의 약자로, 여러 스레드가 `공유 변수`에 접근할 때 어떤 값을 읽을 수 있고, 메모리 연산의 순서가 어떻게 보장되는지를 정의한 규칙입니다.  
멀티스레드 환경에서는 한 스레드의 변경 사항이 다른 스레드에 바로 보이지 않거나, 연산 순서가 다르게 관찰될 수 있습니다.  
JMM은 `Happens-Before` 관계를 통해 `가시성`과 `순서`를 보장하는 조건을 정의하고, 개별 변수의 읽기와 쓰기에 대한 `원자성` 규칙도 제공합니다.

---

# 멀티스레드 환경에서 무슨 문제가 발생할까?

다음 코드를 봅시다.

```java
class Counter {
    int count = 0;
}

public class Main {
    public static void main(String[] args) {
        Counter counter = new Counter();

        Thread threadA = new Thread(() -> {
            counter.count = 10;
        });

        Thread threadB = new Thread(() -> {
            System.out.println(counter.count);
        });

        threadA.start();
        threadB.start();
    }
}
```

Thread A와 Thread B는 main()의 지역 변수인 counter가 가리키는 동일한 Counter 객체를 참조합니다. 따라서 두 스레드 모두 해당 객체의 count 필드에 접근할 수 있습니다.  
이 코드에서는 두 스레드 사이에 count를 읽고 쓰는 순서를 보장하는 동기화가 없습니다. 따라서 Thread B는 `0 또는 10`을 출력할 수 있으며, 반드시 10이 출력된다고 보장할 수 없습니다.

---

# 멀티스레드 환경에서 왜 문제가 발생할까?

JVM에서는 각 스레드가 `독립적인 Stack 영역`을 사용하지만, `Heap 영역은 여러 스레드가 공유`합니다.  
따라서 여러 스레드가 동일한 객체에 접근할 수 있는데, 이 과정에서 CPU 캐시나 컴파일러 최적화 등으로 인해 가시성과 순서 문제가 발생할 수 있습니다.  
또한 여러 스레드가 공유 변수에 대해 읽기와 쓰기로 이루어진 복합 연산을 동시에 수행하면 원자성 문제도 발생할 수 있습니다.

---

# 공유 변수

공유 변수란 여러 스레드가 접근할 수 있는 변수를 의미합니다. JMM에서는 `인스턴스 필드, 정적 필드, 배열 요소`를 공유 가능한 변수로 정의합니다.

```java
public class Main {
    int count = 0;             // 인스턴스 필드
    static int total = 0;      // 정적 필드
    int[] numbers = {0, 0};    // 배열을 참조하는 인스턴스 필드

    public static void main(String[] args) {
        Main obj = new Main();

        obj.count++;           // 인스턴스 필드
        Main.total++;          // 정적 필드
        obj.numbers[0]++;      // 배열 요소
    }
}
```

다만 공유 변수라고 해서 반드시 동시성 문제가 발생하는 것은 아닙니다. 여러 스레드가 동일한 변수를 적절한 동기화 없이 읽고 쓰는 과정에서 가시성과 순서 문제가 발생할 수 있으며, 복합 연산이 겹치면 원자성 문제도 발생할 수 있습니다.

---

# Java에서 보장을 만드는 수단

Java는 다음과 같은 동작으로 스레드 사이에 필요한 Happens-Before 관계를 형성할 수 있습니다. 각 수단의 보장 범위는 다음과 같습니다.

- `volatile`: 공유 변수의 가시성과 순서를 보장하지만, 상호 배제는 제공하지 않습니다.
- `synchronized`: 동일한 Monitor Lock으로 보호된 임계 영역에 대해 상호 배제를 제공하며, Lock 해제와 이후 획득 사이에 Happens-Before 관계를 형성하여 가시성과 순서도 보장합니다.
- `Thread.start()`: start() 호출 이전의 동작과 새로 시작된 스레드의 동작 사이에 Happens-Before 관계를 형성하여 메모리 가시성과 순서를 보장합니다.
- `Thread.join()`: 대상 스레드의 종료를 기다리며, 해당 스레드의 동작과 join()이 정상적으로 반환된 이후의 동작 사이에 Happens-Before 관계를 형성하여 메모리 가시성과 순서를 보장합니다.

---

# 참고 자료

- [JLS 17.4 — Memory Model](https://docs.oracle.com/javase/specs/jls/se21/html/jls-17.html#jls-17.4)
- [JLS 17.4.5 — Happens-before Order](https://docs.oracle.com/javase/specs/jls/se21/html/jls-17.html#jls-17.4.5)
