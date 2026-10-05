# 한눈에 보기

Thread는 하나의 Process 안에서 Code를 실행하는 실행 단위입니다.

Java Application은 여러 Thread가 동시에 서로 다른 작업을 수행할 수 있으며, 각 Thread는 자신의 JVM Stack, PC Register 등을 가지고 Heap의 객체는 다른 Thread와 공유할 수 있습니다.

Thread를 이해하면 동시 실행 구조, Context Switching 비용, Thread가 종료되지 않아 Application이 내려가지 않는 문제, Thread 과다 생성으로 인한 Memory 문제 등을 분석하는 데 도움이 됩니다.

---

# Thread란

Thread는 Process 내부에서 Code를 실행하는 실행 흐름입니다.

하나의 Java Application 안에서도 여러 Thread가 서로 다른 Method를 동시에 실행할 수 있습니다.

예를 들어 Server Application에서는 여러 Request를 서로 다른 Thread가 처리할 수 있습니다.

```java
Thread threadA = new Thread(() -> processOrder());
Thread threadB = new Thread(() -> processPayment());

threadA.start();
threadB.start();
```

두 Thread는 각각 독립적인 실행 흐름을 가집니다.

---

# Thread마다 따로 가지는 것

각 Thread는 자신의 실행 상태를 관리하기 위한 Memory 영역을 가집니다.

대표적으로 다음과 같습니다.

- `JVM Stack`
- `PC Register`
- `Native Method Stack`

따라서 Thread A와 Thread B가 같은 Method를 실행하더라도 각각 별도의 Stack Frame과 Local Variable을 가질 수 있습니다.

반면 Heap과 Method Area 같은 영역은 Thread들이 공유합니다.

즉 다음처럼 이해할 수 있습니다.

- Method 호출 상태와 Local Variable → Thread별로 관리
- Heap 객체 → 여러 Thread가 공유 가능

이 때문에 Local Variable 자체는 보통 다른 Thread와 직접 공유되지 않지만, Local Variable이 가리키는 Heap 객체는 여러 Thread가 함께 사용할 수 있습니다.

---

# Thread 생성과 실행

Java에서는 `Thread`를 생성한 뒤 `start()`를 호출하면 새로운 Thread가 실행됩니다.

```java
Thread thread = new Thread(() -> {
    System.out.println("run");
});

thread.start();
```

`start()`를 호출하면 JVM과 OS가 새로운 실행 Thread를 준비하고 해당 Thread에서 `run()`을 실행합니다.

반면 다음과 같이 직접 `run()`을 호출하면 새로운 Thread가 생성되는 것이 아닙니다.

```java
thread.run();
```

이 경우 현재 Thread가 단순히 `run()` Method를 호출하는 것입니다.

즉:

- `start()` → 새로운 Thread에서 실행
- `run()` → 현재 Thread에서 일반 Method처럼 실행

---

# Thread의 상태

Java Thread는 실행 과정에서 여러 상태를 가질 수 있습니다.

대표적으로 다음과 같습니다.

- `NEW` : 아직 시작되지 않은 상태
- `RUNNABLE` : 실행 가능하거나 실제 실행 중인 상태
- `BLOCKED` : Monitor Lock을 얻기 위해 기다리는 상태
- `WAITING` : 다른 Thread의 작업 등을 제한 없이 기다리는 상태
- `TIMED_WAITING` : 일정 시간 동안 기다리는 상태
- `TERMINATED` : 실행이 끝난 상태

Java의 `RUNNABLE`은 실제 CPU에서 실행 중인 상태뿐 아니라 실행 가능한 상태까지 포함합니다.

따라서 Java Thread State와 OS Thread의 세부 실행 상태가 정확히 1:1로 대응한다고 보기는 어렵습니다.

---

# Context Switching

CPU Core보다 실행 가능한 Thread가 많으면 모든 Thread를 동시에 실행할 수는 없습니다.

OS Scheduler는 어떤 Thread를 CPU에서 실행할지 결정하고 실행 Thread를 교체할 수 있습니다.  
이를 `Context Switching`이라고 합니다.

Thread가 교체될 때는 현재 Thread의 실행 상태를 저장하고 다음 Thread의 상태를 복원해야 하므로 비용이 발생합니다.

따라서 Thread를 많이 만들면 무조건 처리량이 증가하는 것은 아닙니다.

Thread 수가 지나치게 많으면 다음과 같은 비용이 증가할 수 있습니다.

- Context Switching 증가
- Thread Stack Memory 증가
- Scheduling 비용 증가
- Lock 경쟁 증가

그래서 Server Application에서는 무제한으로 Thread를 생성하기보다 Thread Pool을 사용하는 경우가 많습니다.

---

# Thread Pool

Thread 생성과 제거에도 비용이 발생합니다.

Request마다 새로운 Thread를 만들고 버리는 대신 일정 수의 Thread를 미리 만들어 재사용할 수 있습니다.  
이를 `Thread Pool`이라고 합니다.

Java에서는 `ExecutorService` 등을 사용할 수 있습니다.

```java
ExecutorService executor = Executors.newFixedThreadPool(10);

executor.submit(() -> processOrder());
```

Thread Pool을 사용하면 Thread 생성 비용을 줄이고 동시에 실행되는 Thread 수를 제한할 수 있습니다.

다만 Pool 크기가 지나치게 작으면 작업이 Queue에서 오래 대기할 수 있고, 지나치게 크면 Context Switching과 Memory 사용량이 증가할 수 있습니다.

---

# Thread와 Memory

Java Thread 하나를 생성하면 Heap에 `Thread` 객체만 생성되는 것이 아닙니다.

실제 실행을 위해 OS 수준의 Native Thread가 생성되고, 각 Thread는 자신의 Stack과 Thread 실행에 필요한 Native Resource를 사용합니다.

따라서 Thread 수가 증가하면 Heap과 별개로 Process가 사용하는 Memory도 함께 증가할 수 있습니다.

특히 Thread마다 사용하는 Stack 크기는 `-Xss` Option으로 설정할 수 있습니다.

```text
-Xss1m
```

예를 들어 Thread 하나당 Stack 크기가 크다면 Thread를 수천 개 생성했을 때 Stack에 필요한 Memory도 크게 증가할 수 있습니다.

이 때문에 Heap에 여유 공간이 충분히 남아 있더라도 Thread를 지나치게 많이 생성하면 새로운 Native Thread를 만들기 위한 Memory나 OS Resource가 부족해질 수 있습니다.

이때 다음과 같은 오류가 발생할 수 있습니다.

```text
java.lang.OutOfMemoryError: unable to create native thread
```

이 오류는 일반적인 `Java heap space`와 원인이 다릅니다.

- `Java heap space` : Heap에서 객체를 위한 공간을 확보하지 못함
- `unable to create native thread` : 새로운 Thread를 만들기 위한 Native Memory 또는 OS Resource를 확보하지 못함

따라서 이 오류가 발생하면 Heap 크기만 확인하기보다 다음을 함께 확인해야 합니다.

- 생성된 Thread 수
- Thread Pool 크기
- Thread가 정상적으로 종료되고 있는지
- `-Xss` 설정
- Process가 사용할 수 있는 Native Memory
- OS의 Thread / Process Resource 제한

즉 `Thread도 Memory를 사용하기 때문에 Thread 수 자체가 JVM Memory 문제의 원인이 될 수 있습니다.`

---

# User Thread와 Daemon Thread

Java Thread는 JVM 종료 여부에 따라 일반적인 `User Thread`와 `Daemon Thread`로 구분할 수 있습니다.

일반 Thread는 Application의 주요 작업을 수행하는 Thread입니다.  
하나라도 살아 있는 User Thread가 있다면 JVM은 일반적으로 종료되지 않습니다.

반면 Daemon Thread는 다른 Thread를 보조하는 Background 작업에 사용할 수 있습니다.

```java
Thread thread = new Thread(() -> {
    while (true) {
        // background work
    }
});

thread.setDaemon(true);
thread.start();
```

Daemon Thread가 계속 실행 중이더라도 살아 있는 User Thread가 모두 종료되면 JVM은 종료될 수 있습니다.

즉 JVM 종료를 이해할 때 핵심은 다음과 같습니다.

> 살아 있는 non-daemon Thread가 더 이상 존재하지 않으면 JVM은 종료될 수 있습니다.

Daemon Thread는 JVM 종료 시 작업 완료가 보장되지 않습니다.

따라서 반드시 끝나야 하는 저장 작업, Transaction 처리, 중요한 Cleanup 등을 Daemon Thread에만 의존하는 것은 주의해야 합니다.

---

# Interrupt

실행 중인 Thread에게 작업 중단을 요청할 때 `interrupt()`를 사용할 수 있습니다.

```java
thread.interrupt();
```

다만 `interrupt()`는 Thread를 강제로 즉시 종료시키는 기능이 아닙니다.

Thread에 `interrupt 상태`를 설정하거나, `sleep()`, `wait()`, `join()` 같은 일부 Blocking 상태에서는 `InterruptedException`을 발생시켜 중단 요청을 전달합니다.

따라서 Thread가 정상적으로 종료되려면 실행 중인 Code가 Interrupt를 확인하고 적절하게 종료하는 구조가 필요합니다.

```java
while (!Thread.currentThread().isInterrupted()) {
    // 작업 수행
}
```

즉 Interrupt는 `강제 종료`보다는 `협력적인 중단 요청`에 가깝습니다.

---

# Thread와 동시성 문제

여러 Thread가 같은 Heap 객체를 동시에 수정하면 Race Condition이 발생할 수 있습니다.

```java
count++;
```

겉으로는 한 줄이지만 실제로는 값을 읽고, 증가시키고, 다시 저장하는 여러 단계로 처리될 수 있습니다.

여러 Thread가 이 작업을 동시에 수행하면 일부 증가 결과가 사라질 수 있습니다.

이런 문제를 해결하기 위해 `synchronized`, Lock, Atomic Class 등을 사용할 수 있습니다.

Thread 간의 Visibility, Ordering, Happens-Before 같은 Memory 규칙은 JMM에서 별도로 다룰 수 있습니다.

---

# Thread 문제는 어떻게 나타날까

Thread 관련 문제는 다음과 같은 형태로 나타날 수 있습니다.

- Thread가 너무 많아 CPU 사용량 증가
- Context Switching 증가로 Throughput 감소
- Lock 경쟁으로 Thread가 `BLOCKED` 상태에 오래 머묾
- Deadlock 발생
- Thread가 종료되지 않아 Application이 내려가지 않음
- Thread Pool 고갈로 Request 대기 증가
- Thread 수 증가로 Native Memory와 OS Resource 부족

이런 문제를 분석할 때 대표적으로 `Thread Dump`를 사용할 수 있습니다.

Thread Dump에서는 각 Thread의 상태와 현재 실행 중인 Stack Trace를 확인할 수 있습니다.
