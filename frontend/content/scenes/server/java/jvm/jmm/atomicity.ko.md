# 한눈에 보기

원자성(Atomicity)이란 멀티스레드 환경에서 하나의 작업이 `다른 Thread의 작업과 중간 단계에서 뒤섞이지 않고 수행되는 성질`을 의미합니다.
Java에서는 int와 같은 일반적인 변수의 개별 Read와 Write는 원자성이 보장되지만, count++와 같은 Read-Modify-Write `복합 연산은 원자성이 보장되지 않습니다.`

---

# 원자성(Atomicity)이란?

원자성(Atomicity)은 `하나의 작업이 다른 Thread의 작업과 중간 단계에서 뒤섞이지 않고 수행되는 성질`입니다.
다음 코드를 봅시다.

```java
class Counter {
    int count = 0;

    void increment() {
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

개발자가 기대하는 흐름은 단순합니다.

1. threadA가 count를 1 증가시킵니다.
2. threadB가 count를 1 증가시킵니다.
3. 두 Thread가 종료된 후 count의 값인 2를 출력합니다.

하지만 실제로는 `count가 반드시 2가 된다고 보장할 수 없습니다.`
두 Thread가 count를 증가시키는 과정에서 한쪽의 증가가 반영되지 않아 1이 출력될 수도 있기 때문입니다.
그렇다면 두 Thread가 각각 1씩 증가시켰는데도 왜 이러한 문제가 발생하는 걸까요?

---

# 왜 원자성 문제가 발생할까?

## Read-Modify-Write (복합 연산)

Read-Modify-Write는 `변수의 값을 읽고(Read), 수정한 뒤(Modify), 다시 저장하는(Write) 연산`을 의미합니다.
대표적으로 증가 연산자인 count++가 있습니다.

```java
count++;
```

count++는 하나의 코드로 작성되어 있지만, 개념적으로 다음과 같은 동작으로 이루어집니다.

1. Read: count에 저장된 값을 읽습니다.
2. Modify: 읽은 값에 1을 더합니다.
3. Write: 계산된 값을 count에 저장합니다.

여기서 중요한 점은 `각각의 Read와 Write가 원자적이더라도, Read-Modify-Write 전체가 원자적으로 실행되는 것은 아니라는 것`입니다.
따라서 두 Thread가 동시에 count++를 수행하면 중간 단계가 서로 뒤섞일 수 있습니다.

## Lost Update (갱신 손실)

앞선 코드에서 두 Thread가 동시에 count++를 수행한다고 가정해 보겠습니다.

```text
초기 count = 0

Thread A            Thread B

Read → 0
                    Read → 0
Modify → 1
                    Modify → 1
Write → 1
                    Write → 1

최종 count = 1
```

threadA와 threadB가 모두 count의 값을 0으로 읽은 후 각각 1을 더했습니다.
이후 두 Thread가 계산된 값인 1을 저장하면서 최종 결과가 1이 됩니다.
이처럼 여러 Thread가 동일한 값을 읽고 수정하는 과정에서 한쪽의 변경 사항이 덮어써지는 현상을 `Lost Update(갱신 손실)`라고 합니다.

결국 원자성 문제의 핵심은 `개별 메모리 접근이 원자적이더라도 여러 동작으로 이루어진 복합 연산 전체의 원자성이 보장되지는 않는다`는 것입니다.
참고로 Thread.join()은 각 Thread의 종료를 기다리고 메모리 가시성을 보장하지만, count++ 연산 자체의 원자성을 보장하지는 않습니다.
