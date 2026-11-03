# 한눈에 보기

ReentrantLock은 AQS를 기반으로 상호 배제를 제공하는 Lock-Based 동기화 도구로, state를 통해 Lock의 점유와 재진입을 관리합니다.
Lock 획득에 실패하면 AQS의 대기 Queue를 활용하며, FairSync와 NonfairSync의 획득 조건에 따라 공정성이 달라집니다.
synchronized와 달리 Lock의 획득과 해제를 명시적으로 제어할 수 있으며, 타임아웃과 인터럽트 등의 추가 기능을 제공합니다.

---

# ReentrantLock이란?

ReentrantLock은 Java에서 제공하는 명시적인 `Lock-Based` 동기화 도구로, 여러 스레드가 공유 자원에 접근할 때 `상호 배제`를 보장합니다.
synchronized와 마찬가지로 한 번에 하나의 스레드만 Lock을 소유할 수 있지만, Lock 획득과 해제를 직접 제어할 수 있으며 공정성, 타임아웃, 인터럽트 등의 추가 기능을 제공합니다.
또한 동일한 스레드가 이미 획득한 Lock을 다시 획득할 수 있는 재진입을 지원합니다.

---

# ReentrantLock의 내부 구조

ReentrantLock은 내부적으로 `sync` 필드를 가지고 있으며, Lock 획득과 해제를 Sync에 위임합니다.
다음은 OpenJDK의 핵심 구현을 발췌한 코드입니다.

```java
public class ReentrantLock implements Lock {
    private final Sync sync;

    public void lock() {
        sync.lock();
    }

    public void unlock() {
        sync.release(1);
    }

    abstract static class Sync extends AbstractQueuedSynchronizer {
        abstract boolean initialTryLock();

        final void lock() {
            if (!initialTryLock())
                acquire(1);
        }
    }
}
```

Sync는 AQS를 상속하는 내부 클래스로, ReentrantLock의 획득과 해제 조건을 구현합니다.
`lock()`을 호출하면 다음 과정을 거칩니다.

1. `initialTryLock()`을 호출하여 Lock 획득을 시도합니다.
2. 획득에 성공하면 현재 스레드가 Lock을 소유하고 작업을 진행합니다.
3. 실패하면 AQS의 `acquire(1)`을 호출하여 다시 획득을 시도합니다.
4. 계속 획득하지 못하면 AQS의 대기 Queue에 등록되고, 필요한 경우 park를 통해 대기합니다.
5. Lock을 획득하면 대기를 마치고 작업을 진행합니다.

여기서 ReentrantLock은 획득 조건을 구현하고, AQS는 획득에 실패한 스레드의 대기와 재시도를 관리합니다.

---

# ReentrantLock의 state와 재진입

ReentrantLock은 AQS의 state를 `현재 스레드가 Lock을 획득한 횟수`로 사용합니다.

- `state = 0`: Lock을 점유한 스레드가 없는 상태
- `state = 1`: 특정 스레드가 Lock을 획득한 상태
- `state ≥ 2`: 동일한 스레드가 Lock에 재진입한 상태

Lock을 획득할 때는 state를 0에서 1로 변경하고, 현재 스레드를 Lock 소유자로 등록합니다.
반면 이미 Lock을 보유한 스레드가 다시 lock()을 호출하면 다른 스레드와 경쟁하지 않고 state를 증가시킵니다.
다음은 NonfairSync의 `initialTryLock()` 구현입니다.

```java
final boolean initialTryLock() {
    Thread current = Thread.currentThread();

    if (compareAndSetState(0, 1)) {
        setExclusiveOwnerThread(current);
        return true;
    } else if (getExclusiveOwnerThread() == current) {
        int c = getState() + 1;
        if (c < 0)
            throw new Error("Maximum lock count exceeded");
        setState(c);
        return true;
    } else {
        return false;
    }
}
```

동작은 다음과 같습니다.

1. `Lock 최초 획득`: state가 0이라면 `CAS`로 1로 변경하고 현재 스레드를 소유자로 등록합니다.
2. `재진입`: 현재 스레드가 이미 Lock의 소유자라면 state를 증가시킵니다.
3. `획득 실패`: 다른 스레드가 Lock을 점유하고 있다면 false를 반환합니다.

재진입 과정에서 CAS가 필요하지 않은 이유는 이미 Lock을 소유한 스레드만 자신의 점유 횟수를 변경할 수 있기 때문입니다.
따라서 ReentrantLock은 동일한 스레드의 재진입을 허용하면서 다른 스레드에 대해서는 상호 배제를 유지합니다.

---

# FairSync와 NonfairSync

ReentrantLock은 Lock 획득 순서에 따라 FairSync와 NonfairSync를 제공합니다.

```java
ReentrantLock unfair = new ReentrantLock();
ReentrantLock fair = new ReentrantLock(true);
```

- `NonfairSync`: 기본 설정으로, 먼저 대기한 스레드가 있더라도 다른 스레드가 Lock을 먼저 획득할 수 있습니다.
- `FairSync`: 일반적으로 먼저 대기한 스레드에게 Lock 획득 기회를 우선적으로 제공합니다.

두 방식 모두 AQS의 Queue를 사용하지만, `Queue에서 대기 중인 스레드를 우선해야 하는지`에 대한 획득 조건이 다릅니다.

## Lock 최초 획득

NonfairSync는 Lock이 비어 있다면 대기 Queue의 상태를 확인하지 않고 CAS를 통해 획득을 시도합니다.
반면 FairSync는 먼저 대기 중인 스레드가 없는지 확인한 후 획득을 시도합니다.
다음은 두 구현에서 재진입 처리 부분을 제외한 최초 획득 조건입니다.

```java
// NonfairSync.initialTryLock()
if (compareAndSetState(0, 1)) {
    setExclusiveOwnerThread(current);
    return true;
}

// FairSync.initialTryLock()
if (c == 0) {
    if (!hasQueuedThreads() && compareAndSetState(0, 1)) {
        setExclusiveOwnerThread(current);
        return true;
    }
}
```

NonfairSync는 state가 0이면 CAS를 통해 즉시 획득을 시도할 수 있습니다.
반면 FairSync는 `hasQueuedThreads()`를 통해 기존 대기자가 있는지 확인하므로, 먼저 기다리는 스레드가 있다면 새로운 스레드의 획득을 제한합니다.

## AQS에서의 Lock 재획득

최초 획득에 실패하면 두 방식 모두 AQS의 acquire()를 통해 Lock 획득을 다시 시도합니다.
이때 호출되는 `tryAcquire()`도 공정성 정책에 따라 다르게 구현됩니다.

```java
// NonfairSync
protected final boolean tryAcquire(int acquires) {
    if (getState() == 0 && compareAndSetState(0, acquires)) {
        setExclusiveOwnerThread(Thread.currentThread());
        return true;
    }
    return false;
}

// FairSync
protected final boolean tryAcquire(int acquires) {
    if (getState() == 0
            && !hasQueuedPredecessors()
            && compareAndSetState(0, acquires)) {
        setExclusiveOwnerThread(Thread.currentThread());
        return true;
    }
    return false;
}
```

여기서 핵심적인 차이는 `hasQueuedPredecessors()`입니다.
FairSync는 자신보다 먼저 대기 중인 스레드가 있다면 Lock 획득을 포기하지만, NonfairSync는 이러한 확인 없이 CAS로 획득을 시도합니다.
예를 들어 Thread A가 Lock을 해제하고 대기 중이던 Thread B가 깨어났다고 가정하겠습니다.
이때 새롭게 진입한 Thread C가 B보다 먼저 CAS에 성공한다면, NonfairSync에서는 C가 Lock을 먼저 획득할 수 있습니다.
이는 AQS가 대기 스레드를 깨우더라도 Lock의 소유권을 직접 전달하지 않으며, 깨어난 스레드가 다시 획득을 시도하기 때문입니다.
따라서 NonfairSync는 처리량 측면에서 유리할 수 있지만 Starvation이 발생할 가능성이 있습니다.
반면 FairSync는 대기 순서를 우선하여 Starvation을 방지하는 데 도움을 주지만, 처리량이 감소할 수 있습니다.
다만 공정 Lock도 운영체제의 스레드 스케줄링까지 공정하게 만들지는 않습니다. 또한 인자 없는 `tryLock()`은 공정성 설정과 관계없이 사용 가능한 Lock을 즉시 획득할 수 있습니다.

---

# Lock 해제

ReentrantLock은 `unlock()`을 호출하면 AQS의 `release(1)`을 통해 Lock을 해제합니다.
다음은 Sync의 `tryRelease()` 구현입니다.

```java
protected final boolean tryRelease(int releases) {
    int c = getState() - releases;

    if (getExclusiveOwnerThread() != Thread.currentThread())
        throw new IllegalMonitorStateException();

    boolean free = (c == 0);

    if (free)
        setExclusiveOwnerThread(null);

    setState(c);
    return free;
}
```

Lock 해제는 다음 과정으로 이루어집니다.

1. `소유자 확인`: 현재 스레드가 Lock의 소유자인지 확인합니다.
2. `state 감소`: 획득 횟수만큼 증가한 state를 감소시킵니다.
3. `완전 해제`: state가 0이면 Lock 소유자를 해제하고 true를 반환합니다.
4. `대기 스레드 재개`: AQS는 완전 해제 시 대기 중인 다음 스레드를 깨워 획득을 다시 시도하도록 합니다.

재진입으로 state가 2 이상인 경우 unlock()을 한 번 호출하더라도 Lock은 완전히 해제되지 않습니다.
따라서 Lock을 획득한 횟수만큼 unlock()을 호출해야 하며, state가 0이 되어야 다른 스레드가 Lock을 획득할 수 있습니다.

---

# ReentrantLock의 주요 특징

## 공정성

ReentrantLock은 생성 시 공정성 정책을 선택할 수 있습니다.
공정 Lock은 먼저 대기한 스레드의 획득을 우선하여 Starvation을 방지하는 데 도움을 주지만, 대기 순서 관리와 스레드 전환으로 인해 처리량이 감소할 수 있습니다.
반면 기본 설정인 비공정 Lock은 새로 진입한 스레드도 즉시 획득을 시도할 수 있으므로, 처리량에 유리할 수 있지만 특정 스레드의 대기 시간이 길어질 수 있습니다.

## 타임아웃

ReentrantLock은 `tryLock()`을 통해 Lock 획득을 시도하고 실패 여부를 확인할 수 있습니다.

- `tryLock()`: 즉시 획득을 시도하고 성공 여부를 반환합니다.
- `tryLock(timeout, unit)`: 지정한 시간 동안 획득을 기다린 후 성공 여부를 반환합니다.

이를 이용하면 Lock을 무한정 기다리지 않고 다른 작업을 수행하거나, 이미 획득한 Lock을 해제하는 방식으로 Deadlock을 예방할 수 있습니다.
다만 여러 스레드가 동일하게 Lock 획득을 포기하고 반복적으로 재시도한다면 Livelock이 발생할 수 있으므로 재시도 간격이나 횟수를 적절히 제어해야 합니다.

## 인터럽트

ReentrantLock은 `lockInterruptibly()`를 통해 Lock 획득을 기다리는 스레드가 인터럽트에 반응하도록 할 수 있습니다.
일반적인 lock()은 대기 중 인터럽트가 발생하더라도 Lock 획득을 계속 시도하지만, lockInterruptibly()는 인터럽트가 발생하면 InterruptedException을 던지고 대기를 중단합니다.
따라서 Lock을 기다리는 작업을 취소할 수 있으며, 기존에 획득한 자원을 적절히 정리하도록 설계하면 Deadlock에 대응하는 데 활용할 수 있습니다.

## Lock 범위 제어

synchronized는 메서드나 블록의 시작과 종료에 따라 Lock을 자동으로 획득하고 해제합니다.
반면 ReentrantLock은 `lock()`과 `unlock()`을 명시적으로 호출하므로 획득과 해제 시점을 직접 제어할 수 있습니다.
따라서 서로 다른 메서드에 걸쳐 Lock을 유지하는 등 유연한 제어가 가능하지만, Lock을 해제하지 않으면 다른 스레드가 계속 대기할 수 있습니다.
일반적으로 예외가 발생하더라도 Lock이 해제되도록 finally를 사용해야 합니다.

```java
lock.lock();
try {
    // 공유 자원 접근
} finally {
    lock.unlock();
}
```
