# 한눈에 보기

Deadlock은 여러 스레드가 서로 상대방이 점유한 자원의 해제를 기다리면서 작업을 진행하지 못하는 교착 상태입니다.
상호 배제, 점유 대기, 비선점, 순환 대기라는 네 가지 조건이 모두 성립해야 발생할 수 있습니다.
이를 예방하기 위해 Lock 획득 순서를 통일하거나 중첩 Lock을 최소화하고, Lock 획득 실패 시 기존 Lock을 해제하는 방법 등을 사용할 수 있습니다.

---

# Deadlock이란?

Deadlock은 여러 스레드가 서로 상대방이 점유한 자원의 해제를 기다리면서, `어느 스레드도 작업을 진행하지 못하는 상태`를 의미합니다.
주로 여러 Lock을 획득하는 과정에서 스레드들이 서로 필요한 Lock을 점유한 채 대기할 때 발생합니다.

---

# Deadlock의 발생 원리

Deadlock이 발생하려면 다음 네 가지 조건이 모두 성립해야 합니다.

- `상호 배제`: 하나의 자원을 한 번에 하나의 스레드만 사용할 수 있습니다.
- `점유 대기`: 스레드가 자원을 점유한 상태에서 다른 자원의 획득을 기다립니다.
- `비선점`: 다른 스레드가 점유한 자원을 강제로 빼앗을 수 없습니다.
- `순환 대기`: 스레드들이 서로 상대방이 점유한 자원을 기다리는 관계가 순환 구조를 이룹니다.

다음은 두 스레드가 서로 다른 순서로 Lock을 획득하는 예시입니다.

```java
public class Main {
    public static void main(String[] args) {
        Object lock1 = new Object();
        Object lock2 = new Object();

        new Thread(() -> {
            synchronized (lock1) {
                synchronized (lock2) {
                    System.out.println("Thread 1 완료");
                }
            }
        }).start();

        new Thread(() -> {
            synchronized (lock2) {
                synchronized (lock1) {
                    System.out.println("Thread 2 완료");
                }
            }
        }).start();
    }
}
```

두 스레드가 각각 첫 번째 Lock을 획득한 상태에서 두 번째 Lock 획득을 시도하면 네 가지 조건이 모두 성립합니다.

- `상호 배제`: synchronized에 의해 lock1과 lock2는 각각 한 번에 하나의 스레드만 획득할 수 있습니다.
- `점유 대기`: Thread 1은 lock1을 점유한 채 lock2를 기다리고, Thread 2는 lock2를 점유한 채 lock1을 기다립니다.
- `비선점`: 두 스레드 모두 상대방이 점유한 Lock을 강제로 해제할 수 없습니다.
- `순환 대기`: Thread 1 → lock2 → Thread 2 → lock1 → Thread 1로 이어지는 순환 대기 관계가 형성됩니다.

따라서 두 스레드가 서로 상대방의 Lock이 해제되기를 기다리면서 어느 쪽도 작업을 진행할 수 없는 Deadlock이 발생합니다.

---

# Deadlock을 해결하는 방법

Deadlock을 예방하려면 앞서 설명한 네 가지 필요 조건 중 적어도 하나가 성립하지 않도록 설계해야 합니다.
대표적인 방법은 다음과 같습니다.

1. `Lock 획득 순서 통일`: 모든 스레드가 동일한 순서로 Lock을 획득하여 `순환 대기를 방지`합니다.
2. `중첩 Lock 최소화`: 여러 Lock을 동시에 점유하지 않도록 하여 `점유 대기를 방지`합니다.
3. `Lock 획득 실패 시 해제`: 다른 Lock을 획득하지 못하면 기존 Lock을 해제하여 `무한 대기를 방지`합니다.

## Lock 획득 순서 통일

모든 스레드가 `동일한 순서로 Lock을 획득`하도록 하여 순환 대기를 방지합니다.

```java
public class Main {
    public static void main(String[] args) {
        Object lock1 = new Object();
        Object lock2 = new Object();

        Runnable task = () -> {
            synchronized (lock1) {
                synchronized (lock2) {
                    System.out.println("작업 완료");
                }
            }
        };

        new Thread(task).start();
        new Thread(task).start();
    }
}
```

두 스레드 모두 lock1 → lock2 순서로 Lock을 획득하므로, 서로 반대 방향으로 Lock을 기다리는 순환 대기가 발생하지 않습니다.

## 중첩 Lock 최소화

여러 Lock을 동시에 점유할 필요가 없다면 `각 Lock을 사용하는 작업을 분리`하여 점유 대기를 방지합니다.

```java
public class Main {
    public static void main(String[] args) {
        Object lock1 = new Object();
        Object lock2 = new Object();

        Runnable task = () -> {
            synchronized (lock1) {
                System.out.println("작업 A");
            }

            synchronized (lock2) {
                System.out.println("작업 B");
            }
        };

        new Thread(task).start();
        new Thread(task).start();
    }
}
```

첫 번째 Lock을 해제한 후 두 번째 Lock을 획득하므로, 하나의 Lock을 점유한 상태에서 다른 Lock을 기다리지 않습니다.
다만 두 작업이 하나의 원자적 작업으로 수행되어야 한다면 Lock을 분리할 수 없으므로 주의해야 합니다.

## Lock 획득 실패 시 해제

ReentrantLock의 `tryLock()`을 사용하면 다른 Lock을 획득하지 못했을 때, `기존에 획득한 Lock을 해제`하여 교착 상태를 방지할 수 있습니다.

```java

public class Main {
    public static void main(String[] args) {
        ReentrantLock lock1 = new ReentrantLock();
        ReentrantLock lock2 = new ReentrantLock();

        new Thread(() -> work(lock1, lock2)).start();
        new Thread(() -> work(lock2, lock1)).start();
    }

    static void work(ReentrantLock first, ReentrantLock second) {
        first.lock();
        try {
            if (!second.tryLock()) return;

            try {
                System.out.println("작업 완료");
            } finally {
                second.unlock();
            }
        } finally {
            first.unlock();
        }
    }
}
```

첫 번째 Lock을 획득했더라도 두 번째 Lock 획득에 실패하면 기다리지 않고 반환하며, `finally`에서 기존 Lock을 해제합니다.
따라서 두 스레드가 서로 상대방의 Lock을 무한정 기다리는 상황을 방지할 수 있습니다.
다만 이 예제는 Lock 획득에 실패하면 작업을 종료하므로, 반드시 완료해야 하는 작업이라면 재시도 처리가 필요합니다.
