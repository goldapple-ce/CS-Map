# 한눈에 보기

ThreadLocal은 각 스레드가 독립적인 값을 저장하고 사용할 수 있도록 제공하는 Java 클래스입니다.
각 Thread의 ThreadLocalMap에 ThreadLocal 인스턴스를 Key로 사용하여 값을 관리하며, 이를 통해 불필요한 공유 가변 상태를 격리할 수 있습니다.
다만 Thread Pool에서는 스레드가 재사용되므로 작업 종료 후 remove()로 값을 정리해야 하며, 반드시 공유해야 하는 데이터에는 적합하지 않습니다.

---

# ThreadLocal이란?

ThreadLocal은 `각 스레드가 독립적인 값을 저장하고 사용할 수 있도록 제공하는 Java 클래스`입니다.
일반적인 객체의 필드는 여러 스레드가 동일한 객체를 참조하면 값이 공유될 수 있지만, ThreadLocal은 동일한 인스턴스를 사용하더라도 스레드마다 서로 다른 값을 관리합니다.

이를 통해 공유할 필요가 없는 가변 상태를 스레드별로 격리하여, 별도의 동기화 없이 데이터를 독립적으로 관리할 수 있습니다.

---

# ThreadLocal이 필요한 이유

여러 스레드가 공유 자원에 접근할 때 Race Condition이 발생할 수 있으며, 이를 해결하기 위해 Lock-based나 Lock-Free 방식으로 동시 접근을 제어할 수 있습니다.
하지만 `모든 가변 상태가 반드시 스레드 간에 공유되어야 하는 것은 아닙니다.`
예를 들어 여러 스레드가 동일한 Service 객체를 사용하더라도, 각 스레드가 처리하는 요청의 사용자 정보나 추적 ID는 서로 공유할 필요가 없습니다.
오히려 이러한 데이터를 공유 필드로 관리하면 다른 스레드의 작업에 의해 값이 변경될 수 있습니다.

ThreadLocal은 이처럼 `공유할 필요가 없는 상태를 각 스레드에 격리`하여 불필요한 동시성 문제를 방지합니다.
반면 재고 수량이나 공유 카운터처럼 여러 스레드가 동일한 값을 기준으로 작업해야 하는 경우에는 ThreadLocal이 적절하지 않습니다.
각 스레드가 독립적인 값을 가지면 공유 데이터의 일관성을 유지할 수 없기 때문입니다.
따라서 ThreadLocal은 공유 자원을 안전하게 변경하는 기술이 아니라, 공유할 필요가 없는 상태를 분리하는 기술입니다.

---

# ThreadLocal의 동작 원리

ThreadLocal은 스레드마다 독립적인 값을 관리하기 위해 `ThreadLocalMap`을 사용합니다.
다음은 OpenJDK의 Thread와 ThreadLocal에서 관련 구현을 발췌한 코드입니다.

```java
public class Thread implements Runnable {
    private ThreadLocal.ThreadLocalMap threadLocals;
}

public class ThreadLocal<T> {
    private void set(Thread t, T value) {
        ThreadLocalMap map = getMap(t);

        if (map != null)
            map.set(this, value);
        else
            createMap(t, value);
    }

    ThreadLocalMap getMap(Thread t) {
        return t.threadLocals;
    }
}
```

ThreadLocalMap은 JVM 전체에서 하나만 존재하는 것이 아니라, `각 Thread 객체가 개별적으로 관리`합니다.
또한 ThreadLocalMap은 처음부터 생성되는 것이 아니라, 스레드에서 ThreadLocal 값을 저장해야 할 때 생성됩니다.

ThreadLocal에 값을 저장하는 과정은 다음과 같습니다.

1. 현재 스레드 확인: `Thread.currentThread()`를 통해 현재 실행 중인 스레드를 확인합니다.
2. ThreadLocalMap 조회: `getMap()`으로 현재 스레드의 ThreadLocalMap을 가져옵니다.
3. 값 저장: `map.set(this, value)`를 통해 ThreadLocal 인스턴스 자신을 Key로 사용하여 값을 저장합니다.

즉, ThreadLocalMap이 실제 값을 저장하고, `ThreadLocal은 Key 역할과 값에 접근하기 위한 API를 제공`합니다.
동일한 ThreadLocal을 사용하더라도 각 스레드는 자신의 ThreadLocalMap에서 값을 조회하기 때문에 서로 다른 값을 가질 수 있습니다.

---

# ThreadLocal의 사용 예시

다음은 각 스레드가 독립적인 요청 ID를 저장하고 사용하는 예시입니다.

```java
public class Main {
    static ThreadLocal<String> requestId = new ThreadLocal<>();

    static void process(String id) {
        try {
            requestId.set(id);
            log();
        } finally {
            requestId.remove();
        }
    }

    static void log() {
        System.out.println(requestId.get());
    }

    public static void main(String[] args) {
        new Thread(() -> process("A")).start();
        new Thread(() -> process("B")).start();
    }
}
```

각 스레드는 동일한 requestId 인스턴스를 사용하지만, ThreadLocalMap이 분리되어 있어 서로 다른 값을 조회합니다.

```text
A
B
```

출력 순서는 달라질 수 있습니다.

이처럼 ThreadLocal을 사용하면 스레드 내 여러 메서드에서 동일한 데이터를 참조할 수 있습니다.
다만 단일 메서드 내에서만 사용하는 값이라면 ThreadLocal보다 지역 변수를 사용하거나 메서드 인자로 전달하는 것이 더 적절합니다.

ThreadLocal은 여러 메서드에 걸쳐 스레드별 상태를 유지해야 할 때 유용합니다.

---

# ThreadLocal 사용 시 주의사항

## Thread Pool과 데이터 재사용

ThreadLocal의 값은 작업 단위가 아니라 `스레드 단위로 유지`됩니다.
따라서 Thread Pool처럼 동일한 스레드를 여러 작업에서 재사용하는 환경에서는 이전 작업의 데이터가 다음 작업에 남아 있을 수 있습니다.

다음은 하나의 Worker Thread를 재사용하는 예시입니다.

```java
public class Main {
    static ThreadLocal<String> local = new ThreadLocal<>();

    public static void main(String[] args) throws Exception {
        ExecutorService pool = Executors.newSingleThreadExecutor();

        try {
            pool.submit(() -> local.set("작업 A")).get();
            pool.submit(() -> System.out.println(local.get())).get();
        } finally {
            pool.shutdown();
        }
    }
}
```

출력 결과는 다음과 같습니다.

```text
작업 A
```

두 번째 작업에서는 값을 저장하지 않았지만, 첫 번째 작업에서 저장한 값을 읽게 됩니다.
이는 Thread Pool이 동일한 Worker Thread를 재사용하고, `작업이 종료되어도 해당 스레드의 ThreadLocalMap은 유지`되기 때문입니다.
따라서 작업이 종료되면 `remove()`를 호출하여 이전 작업의 데이터를 정리해야 합니다.
일반적으로 finally 블록에서 remove()를 호출하여 예외가 발생하더라도 값을 제거하도록 구성합니다.

값을 제거하지 않으면 다음 작업에 잘못된 데이터가 전달될 수 있으며, 장시간 유지되는 스레드에서는 불필요한 객체가 메모리에 남는 문제도 발생할 수 있습니다.

## 공유 객체의 스레드 안전성

ThreadLocal은 스레드마다 값을 독립적으로 저장하지만, `저장된 객체 자체의 스레드 안전성까지 보장하지는 않습니다.`
예를 들어 여러 스레드가 동일한 가변 객체를 각각의 ThreadLocal에 저장했다면, 서로 다른 ThreadLocalMap에 저장되어 있더라도 실제로 참조하는 객체는 동일합니다.
따라서 ThreadLocal을 이용해 공유 가변 상태를 격리하려면 각 스레드가 독립적인 객체를 사용하도록 해야 합니다.
또한 ThreadLocal의 값은 다른 스레드로 자동 전달되지 않으므로, 비동기 작업처럼 실행 스레드가 변경되는 환경에서는 주의가 필요합니다.
