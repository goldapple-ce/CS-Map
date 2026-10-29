# 한눈에 보기

`Final Field Semantics`는 올바르게 생성된 객체의 final 필드에 대해 `초기화 결과의 가시성을 보장하는 JMM의 특별한 규칙`입니다.
일반적인 스레드 간 Happens-Before 관계가 없더라도 final 필드의 초기화된 값을 다른 Thread에서 올바르게 관찰할 수 있도록 보장합니다.
이러한 보장은 생성자가 종료될 때 발생하는 `Freeze Action`을 기반으로 하며, 객체가 생성되는 도중 외부로 노출되지 않아야 합니다.

---

# Final Field Semantics란?

Safe Publication에서는 객체의 참조를 다른 Thread에 전달하더라도 내부 필드의 초기화 결과까지 반드시 관찰할 수 있는 것은 아니라는 점을 살펴보았습니다.
그런데 JMM은 final 필드에 대해서는 일반적인 스레드 간 `Happens-Before 관계 없이도 초기화된 값을 관찰`할 수 있도록 특별한 규칙을 제공합니다.
이를 `Final Field Semantics`라고 합니다.

다음 코드를 살펴봅시다. Safe Publication Topic에서 사용했던 Config 객체에 final 필드를 선언한 코드입니다.

```java
class Config {
    final int port;
    int timeout;

    Config() {
        port = 8080;
        timeout = 30;
    }
}

public class Main {
    static Config config;

    public static void main(String[] args) throws InterruptedException {
        Thread writer = new Thread(() -> {
            config = new Config();
        });

        Thread reader = new Thread(() -> {
            Config current = config;

            if (current != null) {
                System.out.println(current.port);
                System.out.println(current.timeout);
            }
        });

        writer.start();
        reader.start();

        writer.join();
        reader.join();
    }
}
```

Writer Thread는 Config 객체를 생성하면서 port와 timeout을 초기화한 후 공유 변수 config에 객체의 참조를 저장합니다.
그렇다면 Reader Thread가 config를 null이 아닌 값으로 읽었을 때 어떤 결과가 출력될까요?

- `port`: final 필드이므로 `8080`으로 관찰됩니다.
- `timeout`: 일반 필드이므로 `30`이 보장되지 않으며 `0`으로 관찰될 수도 있습니다.

두 필드 모두 생성자에서 초기화되었지만, final 필드인 port에만 특별한 초기화 가시성 보장이 적용됩니다.
그렇다면 JMM은 어떻게 이러한 차이를 만들어 낼까요?

---

# Freeze Action

JMM에서는 final 필드의 초기화와 관련하여 `Freeze Action`이라는 특별한 동작을 정의합니다.
Freeze Action은 `final 필드를 초기화한 생성자가 종료되는 시점에 발생하는 동작`입니다.

앞선 코드에서는 다음과 같은 과정이 진행됩니다.

1. Writer Thread가 Config 객체를 생성합니다.
2. 생성자에서 final 필드 port를 8080으로 초기화합니다.
3. 생성자가 종료되면서 port에 대한 Freeze Action이 발생합니다.
4. Writer Thread가 객체의 참조를 공유 변수 config에 저장합니다.
5. Reader Thread가 해당 객체를 관찰하면 port의 초기화된 값인 8080을 읽습니다.

JMM은 Freeze Action과 final 필드를 읽는 동작에 특별한 메모리 규칙을 적용합니다.
따라서 생성자에서 설정한 final 필드의 값이 다른 Thread에서도 올바르게 관찰되도록 보장합니다.
여기서 중요한 점은 `Freeze Action이 일반적인 Synchronizes-With 관계를 형성하는 것은 아니라는 것`입니다.
Final Field Semantics는 일반적인 스레드 간 Happens-Before 관계와 구별되는 규칙으로 초기화 가시성을 제공합니다.
또한 이러한 보장은 final 필드에 대한 것이므로, 객체의 일반 필드까지 자동으로 보장하지는 않습니다.

---

# This Escape

Final Field Semantics의 초기화 가시성 보장을 받으려면 `생성자가 완료되기 전`에 객체의 `참조가 다른 Thread에 노출되지 않아야` 합니다.
다음 코드를 살펴봅시다.

```java
class Config {
    static Config shared;
    final int port;

    Config() {
        shared = this;
        port = 8080;
    }
}

public class Main {
    public static void main(String[] args) throws InterruptedException {
        Thread writer = new Thread(() -> {
            new Config();
        });

        Thread reader = new Thread(() -> {
            Config current;

            while ((current = Config.shared) == null) {
                Thread.onSpinWait();
            }

            System.out.println(current.port);
        });

        writer.start();
        reader.start();

        writer.join();
        reader.join();
    }
}
```

Writer Thread는 Config 객체를 생성하면서 `shared = this`를 실행해 생성 중인 객체의 참조를 공개합니다.
이후 생성자는 잠시 대기한 뒤 port를 8080으로 초기화합니다.
이 사이에 Reader Thread가 객체 참조를 획득하면 다음 상황이 발생할 수 있습니다.

1. Writer Thread가 `shared = this`를 실행합니다.
2. Reader Thread가 해당 객체의 참조를 획득합니다.
3. Reader Thread가 port를 읽어 기본값인 `0`을 관찰합니다.
4. Writer Thread가 `port = 8080`을 실행합니다.
5. 생성자가 종료되면서 Freeze Action이 발생합니다.

이처럼 `생성자가 완료되기 전에 this 참조가 외부로 노출되는 현상`을 This Escape라고 합니다.
Reader Thread가 Freeze Action이 발생하기 전에 final 필드를 읽을 수 있으므로 초기화된 값을 관찰한다는 보장이 없습니다.
따라서 Final Field Semantics의 초기화 가시성 보장을 활용하려면 생성 중인 객체의 참조를 다른 Thread에 노출하지 않아야 합니다.

---

# final 참조 필드의 보장 범위

Final Field Semantics는 기본형 final 필드뿐 아니라 참조형 final 필드에도 적용됩니다.
특히 final 참조를 통해 접근하는 객체나 배열의 초기화 상태에도 특별한 가시성 보장이 적용될 수 있습니다.

다음 코드를 살펴봅시다.

```java
class Config {
    final int[] ports;

    Config() {
        ports = new int[1];
        ports[0] = 8080;
    }
}

public class Main {
    static Config config;

    public static void main(String[] args) throws InterruptedException {
        Thread writer = new Thread(() -> {
            config = new Config();
        });

        Thread reader = new Thread(() -> {
            Config current = config;

            if (current != null) {
                System.out.println(current.ports[0]);
            }
        });

        writer.start();
        reader.start();

        writer.join();
        reader.join();
    }
}
```

여기서 ports는 final 필드이지만, 배열 요소인 ports[0]은 final이 아닙니다.
그럼에도 Config 객체가 올바르게 생성되었다면 Reader Thread가 config를 null이 아닌 값으로 읽었을 때 `8080`이 출력됩니다.

이는 Final Field Semantics가 `final 참조를 통해 접근하는 객체의 초기화 시점 상태`에도 특별한 가시성 보장을 제공하기 때문입니다.
다만 이 보장은 생성자 종료 시점까지의 초기화 상태에 관한 것입니다.
객체가 공개된 이후 다른 Thread에서 ports[0]을 변경한다면 해당 변경의 가시성과 원자성까지 보장되는 것은 아닙니다.
즉, Final Field Semantics는 final 필드와 그 참조를 통해 접근하는 초기화 상태를 보호하는 규칙이지, 객체 전체를 `불변으로 만들거나 Thread Safety를 보장하는 규칙은 아닙니다`.
