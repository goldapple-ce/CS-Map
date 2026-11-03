# 한눈에 보기

AQS는 ReentrantLock과 Semaphore 등의 동기화 도구를 구현하기 위한 기반 클래스로, state와 head, tail을 통해 동기화 상태 및 대기 Queue를 관리합니다.
자원 획득에 실패한 스레드는 Node로 Queue에 등록되며, park를 통해 대기하고 자원 해제 후 다시 획득을 시도합니다.
Exclusive Mode와 Shared Mode를 지원하며, 실제 자원 획득 조건과 공정성 정책은 AQS를 사용하는 동기화 도구가 결정합니다.

---

# AQS란?

AQS는 AbstractQueuedSynchronizer의 약자로, Java에서 Lock과 Semaphore 같은 동기화 도구를 구현하기 위한 기반 클래스입니다.
AQS는 `동기화 상태를 나타내는 state`와 `대기 스레드를 관리하는 Queue`를 제공하며, 자원 획득에 실패한 스레드를 대기시키고 자원이 해제되면 다시 획득을 시도하도록 관리합니다.

---

# AQS의 핵심 구성 요소

AQS는 동기화 상태를 저장하는 state와 대기 스레드를 관리하는 head, tail 필드를 가지고 있습니다.
다음은 OpenJDK의 AQS에서 핵심 필드와 Node 구조만 발췌한 코드입니다. 그 외 메서드와 필드는 생략했습니다.

```java
public abstract class AbstractQueuedSynchronizer
        extends AbstractOwnableSynchronizer {

    abstract static class Node {
        volatile Node prev;
        volatile Node next;
        Thread waiter;
        volatile int status;
    }

    private transient volatile Node head;
    private transient volatile Node tail;
    private volatile int state;
}
```

각 필드의 역할은 다음과 같습니다.

- `state`: 동기화 자원의 현재 상태를 저장합니다.
- `head`: 대기 Queue의 시작을 가리킵니다.
- `tail`: 대기 Queue의 마지막 Node를 가리킵니다.
- `Node`: 자원 획득에 실패한 스레드와 대기 상태를 관리합니다.

AQS는 별도의 Queue 컬렉션을 사용하는 것이 아니라, head와 tail을 기준으로 Node들을 연결하여 Queue를 구성합니다.

## state

state는 동기화 자원의 현재 상태를 나타내는 `volatile` int 변수입니다.
AQS는 state를 저장하고 CAS로 변경하는 기능을 제공하지만, state의 의미는 이를 사용하는 동기화 도구에 따라 달라집니다.

- ReentrantLock: Lock의 점유 횟수를 나타냅니다. 0은 미점유, 1은 점유, 2 이상은 재진입 상태입니다.
- Semaphore: 현재 사용 가능한 Permit 수를 나타냅니다. Permit을 획득하면 감소하고 반환하면 증가합니다.

동기화 도구는 `compareAndSetState()`를 이용하여 state를 원자적으로 변경할 수 있습니다.
따라서 AQS는 동기화 상태를 관리하는 기반을 제공하지만, 실제 자원의 획득과 해제 조건은 이를 사용하는 클래스가 결정합니다.

## Queue와 Node

AQS는 자원 획득에 실패한 스레드를 관리하기 위해 FIFO 기반의 양방향 연결 Queue를 사용합니다.
각 Node는 다음 정보를 가지고 있습니다.

- `prev`: 이전 Node를 참조합니다.
- `next`: 다음 Node를 참조합니다.
- `waiter`: 대기 중인 스레드를 참조합니다.
- `status`: 대기, 취소 등 Node의 상태를 나타냅니다.

Queue는 다음과 같은 형태로 구성됩니다.

```text
head
 ↓
[Dummy] ↔ [Node B] ↔ [Node C] ↔ [Node D]
                                   ↑
                                  tail
```

head는 Queue 관리를 위한 Node를 가리키며, 실제 대기 스레드는 그다음 Node부터 위치합니다.

Queue는 최초 경쟁이 발생할 때 초기화되며, 모든 스레드가 처음부터 Queue에 등록되는 것은 아닙니다.
스레드는 먼저 자원 획득을 시도하고, 실패하면 Node를 생성하여 Queue에 등록됩니다.

이때 여러 스레드가 동시에 Queue에 진입할 수 있으므로 `casTail()`을 통해 tail을 원자적으로 변경합니다.
다만 FIFO Queue를 사용한다고 해서 반드시 FIFO 순서로 자원을 획득하는 것은 아닙니다. 실제 획득 순서는 동기화 도구의 공정성 정책에 따라 달라질 수 있습니다.

---

# acquire() 동작 원리

`acquire()`는 동기화 자원 획득을 시도하고, 실패한 스레드를 Queue에 등록하여 대기시키는 역할을 합니다.

배타적 획득을 위한 AQS의 acquire()는 다음과 같이 시작합니다.

```java
public final void acquire(int arg) {
    if (!tryAcquire(arg))
        acquire(null, arg, false, false, false, 0L);
}
```

먼저 tryAcquire()로 자원 획득을 시도하고, 실패하면 내부 acquire()를 호출합니다.

내부 acquire()에서는 다음 과정을 반복합니다.

1. 자원 획득을 다시 시도합니다.
2. 획득에 실패하면 Node를 생성하고 Queue의 tail에 연결합니다.
3. 대기 상태를 설정한 후 `LockSupport.park()`를 통해 스레드를 대기시킬 수 있습니다.
4. 자원 해제로 대기 스레드가 깨어나면 다시 획득을 시도합니다.
5. 획득에 성공하면 해당 Node가 head가 되고, 대기 상태를 정리한 후 작업을 진행합니다.

여기서 중요한 점은 `Node가 생성되는 시점은 자원 획득에 실패한 이후`라는 것입니다.

또한 Queue에 등록되었다고 즉시 park()를 호출하는 것은 아닙니다.
AQS는 획득 가능 여부와 Node의 대기 상태를 확인한 후 필요한 경우 스레드를 대기시킵니다.

따라서 acquire()는 `획득 시도 → Node 생성 및 Queue 등록 → park 대기 → 획득 재시도` 과정을 관리합니다.

---

# release() 동작 원리

`release()`는 동기화 자원을 해제하고 대기 중인 스레드가 다시 자원 획득을 시도할 수 있도록 하는 역할을 합니다.

다음은 AQS의 배타적 release() 구현입니다.

```java
public final boolean release(int arg) {
    if (tryRelease(arg)) {
        signalNext(head);
        return true;
    }
    return false;
}
```

release()의 동작은 다음과 같습니다.

1. `tryRelease()`를 호출하여 동기화 상태를 변경합니다.
2. 자원이 해제되었다면 `signalNext()`를 호출합니다.
3. signalNext()는 대기 중인 다음 스레드에 신호를 전달하고, 필요한 경우 `LockSupport.unpark()`로 깨웁니다.
4. 깨어난 스레드는 다시 자원 획득을 시도합니다.

여기서 중요한 점은 `unpark()가 자원의 소유권을 직접 전달하는 것은 아니라는 것`입니다.
unpark()는 대기 중인 스레드가 실행을 재개할 수 있도록 할 뿐이며, 실제 자원 획득은 다시 tryAcquire() 등을 통해 결정됩니다.
따라서 스레드가 깨어나더라도 다른 스레드가 먼저 자원을 획득했다면 다시 대기할 수 있습니다.

---

# Exclusive Mode와 Shared Mode

AQS는 동기화 자원의 획득 방식을 Exclusive Mode와 Shared Mode로 구분합니다.

| 구분      | Exclusive Mode   | Shared Mode                  |
| --------- | ---------------- | ---------------------------- |
| 특징      | 배타적 자원 획득 | 여러 스레드의 동시 획득 가능 |
| 획득      | acquire()        | acquireShared()              |
| 해제      | release()        | releaseShared()              |
| 대표 사례 | ReentrantLock    | Semaphore                    |

Exclusive Mode는 다른 스레드가 동일한 자원을 동시에 획득하지 못하도록 하는 방식입니다.
ReentrantLock에서는 이미 다른 스레드가 Lock을 점유하고 있다면 새로운 스레드는 획득할 수 없습니다.

Shared Mode는 자원 상태가 허용하는 범위에서 여러 스레드가 동시에 획득할 수 있는 방식입니다.
Semaphore에서는 남아 있는 Permit이 충분하다면 여러 스레드가 각각 Permit을 획득하여 작업을 수행할 수 있습니다.

두 방식 모두 AQS의 Queue를 활용하지만, 획득 조건과 대기 스레드를 깨우는 방식에는 차이가 있습니다.
특히 Shared Mode에서는 하나의 스레드가 획득에 성공한 후에도 자원이 남아 있다면 다음 대기 스레드에게 획득 기회를 전달할 수 있습니다.

---

## AQS와 공정성

AQS는 FIFO 기반 Queue를 제공하지만, Queue 순서대로 자원을 획득하도록 강제하지는 않습니다.
예를 들어 ReentrantLock의 FairSync는 `hasQueuedPredecessors()`를 통해 자신보다 먼저 대기 중인 스레드가 있는지 확인한 후 획득을 시도합니다.
반면 NonFairSync는 선행 대기자 확인 없이 획득을 시도할 수 있으므로, 새로 진입한 스레드가 Queue에서 대기 중인 스레드보다 먼저 Lock을 획득할 수 있습니다.
따라서 공정성은 AQS의 Queue 자체가 아니라 `AQS를 사용하는 동기화 도구의 획득 조건`에 의해 결정됩니다.
