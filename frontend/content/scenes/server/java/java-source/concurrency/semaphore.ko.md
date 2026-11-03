# 한눈에 보기

Semaphore는 Permit의 개수를 통해 공유 자원에 대한 동시 접근을 제한하는 동기화 도구입니다.
AQS의 Shared 방식을 활용하며, state와 CAS를 통해 Permit의 획득과 반환을 관리합니다.
Permit이 1개라면 상호 배제를 구현할 수 있고, 여러 개라면 동시 접근 수를 제한할 수 있으며, 공정성 설정으로 Starvation을 완화할 수 있습니다.

---

# Semaphore란?

Semaphore는 여러 스레드가 공유 자원에 접근할 때, `Permit(허가)의 개수를 이용해 동시 접근을 제한하는 동기화 도구`입니다.
ReentrantLock이 한 번에 하나의 스레드만 Lock을 획득하도록 제한한다면, Semaphore는 Permit의 개수만큼 여러 스레드의 동시 접근을 허용할 수 있습니다.

예를 들어 Permit이 3개라면 최대 3개의 스레드가 동시에 접근할 수 있으며, 나머지 스레드는 Permit이 반환될 때까지 기다려야 합니다.

---

# Semaphore의 동작 원리

Semaphore는 Permit을 획득하고 반환하는 방식으로 동작합니다.

1. Permit 획득: `acquire()`를 호출하여 사용 가능한 Permit을 1개 감소시킵니다.
2. 스레드 대기: Permit이 0이면 다른 스레드가 반환할 때까지 대기합니다.
3. Permit 반환: `release()`를 호출하여 Permit을 1개 증가시키고 대기 중인 스레드가 획득할 수 있도록 합니다.

다음은 Permit을 2개로 설정한 예시입니다.

```java
public class Main {
    static Semaphore semaphore = new Semaphore(2);

    public static void main(String[] args) {
        for (int i = 1; i <= 3; i++) {
            int id = i;

            new Thread(() -> {
                try {
                    semaphore.acquire();
                    try {
                        System.out.println("Thread " + id + " 작업 시작");
                        Thread.sleep(1000);
                    } finally {
                        semaphore.release();
                    }
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            }).start();
        }
    }
}
```

세 개의 스레드가 동시에 Permit 획득을 시도하지만, Permit이 2개이므로 최대 두 스레드만 작업을 수행할 수 있습니다.
나머지 스레드는 Permit이 반환될 때까지 대기하며, 반환된 Permit을 획득하면 작업을 시작합니다.

---

# Semaphore의 내부 구조

Semaphore 역시 ReentrantLock과 마찬가지로 AQS를 기반으로 구현되며, 내부적으로 `sync` 필드를 사용합니다.
차이점은 `AQS의 state를 Lock 획득 횟수가 아닌 사용 가능한 Permit의 개수로 관리`한다는 것입니다.
다음은 Semaphore의 핵심 구현을 발췌한 코드입니다.

```java
abstract static class Sync extends AbstractQueuedSynchronizer {
    Sync(int permits) {
        setState(permits);
    }

    final int nonfairTryAcquireShared(int acquires) {
        for (;;) {
            int available = getState();
            int remaining = available - acquires;

            if (remaining < 0 ||
                compareAndSetState(available, remaining))
                return remaining;
        }
    }

    protected final boolean tryReleaseShared(int releases) {
        for (;;) {
            int current = getState();
            int next = current + releases;

            if (next < current)
                throw new Error("Maximum permit count exceeded");

            if (compareAndSetState(current, next))
                return true;
        }
    }
}
```

Semaphore에서는 다음과 같이 state를 관리합니다.

- Permit 획득: `compareAndSetState()`를 통해 state를 원자적으로 감소시킵니다.
- Permit 부족: 사용 가능한 Permit이 부족하면 AQS의 대기 큐를 통해 스레드를 대기시킵니다.
- Permit 반환: CAS로 state를 증가시키고 대기 중인 스레드가 Permit을 획득할 수 있도록 합니다.

ReentrantLock은 AQS의 배타적 획득 방식을 사용하는 반면, Semaphore는 `Shared 방식`을 사용하여 여러 스레드가 동시에 Permit을 획득할 수 있도록 합니다.

---

# Semaphore의 주요 특징

## Permit 개수를 통한 접근 제어

Semaphore는 Permit의 개수에 따라 접근 제어 방식을 달리할 수 있습니다.

- `Binary Semaphore`: Permit을 1개로 설정하여 한 번에 하나의 스레드만 접근하도록 제한합니다.
- `Counting Semaphore`: Permit을 여러 개로 설정하여 동시 접근 가능한 스레드 수를 제한합니다.

```java
Semaphore binary = new Semaphore(1);
Semaphore counting = new Semaphore(3);
```

Binary Semaphore는 상호 배제를 구현할 수 있지만, Semaphore 자체는 Lock 소유자를 관리하지 않습니다.
따라서 Permit을 획득한 스레드가 아니더라도 `release()`를 호출할 수 있다는 점에서 ReentrantLock과 차이가 있습니다.

또한 Permit을 여러 개 허용한다고 해서 공유 데이터에 대한 모든 작업의 원자성이 보장되는 것은 아닙니다.

## 공정성

Semaphore는 ReentrantLock과 마찬가지로 공정성 설정을 지원합니다.

- 비공정 Semaphore: 대기 중인 스레드가 있어도 다른 스레드가 Permit을 먼저 획득할 수 있습니다.
- 공정 Semaphore: 일반적으로 먼저 대기한 스레드에 Permit 획득 기회를 우선적으로 제공합니다.

```java
Semaphore unfair = new Semaphore(3);
Semaphore fair = new Semaphore(3, true);
```

공정성 설정은 특정 스레드가 지속적으로 Permit을 획득하지 못하는 `Starvation을 완화`하는 데 도움이 됩니다.
다만 공정성을 보장하는 과정에서 처리량이 감소할 수 있으며, 인자 없는 `tryAcquire()`는 공정성 설정을 따르지 않습니다.

## Permit 획득 제어

Semaphore도 Permit을 기다리는 시간을 제한하거나 대기 중인 작업을 취소할 수 있습니다.

- `acquire()`: Permit을 획득할 때까지 대기하며, 인터럽트에 반응합니다.
- `tryAcquire()`: Permit 획득에 실패하면 즉시 false를 반환합니다.
- `tryAcquire(timeout, unit)`: 지정한 시간 동안 Permit 획득을 기다립니다.

Permit을 획득한 뒤 반환하지 않으면 다른 스레드가 계속 대기할 수 있으므로, 일반적으로 `finally`에서 release()를 호출하여 반환해야 합니다.

---

# Semaphore와 ReentrantLock의 차이

| 구분             | ReentrantLock         | Semaphore             |
| ---------------- | --------------------- | --------------------- |
| 접근 제어        | 한 번에 하나의 스레드 | Permit 개수만큼       |
| AQS 방식         | Exclusive             | Shared                |
| state 의미       | Lock 획득 횟수        | 사용 가능한 Permit 수 |
| 소유 스레드 관리 | 지원                  | 미지원                |
| 재진입           | 지원                  | 별도 재진입 개념 없음 |
| 공정성 설정      | 지원                  | 지원                  |

ReentrantLock은 임계 영역에 대한 상호 배제를 보장하는 데 적합하며, Semaphore는 데이터베이스 연결 풀이나 외부 API 요청처럼 `동시에 사용할 수 있는 자원의 수를 제한`하는 데 적합합니다.
