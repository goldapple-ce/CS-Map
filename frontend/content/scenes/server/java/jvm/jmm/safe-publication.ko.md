# 한눈에 보기

Safe Publication(안전한 공개)은 한 Thread에서 `생성하고 초기화한 객체`를 다른 Thread가 `올바르게 초기화된 상태로 관찰`할 수 있도록 공개하는 것입니다.
객체의 참조가 다른 Thread에 전달되더라도 내부 필드의 초기화 결과까지 보장되는 것은 아닙니다.
이는 객체의 필드 초기화와 참조 공개 사이의 메모리 연산 순서 및 가시성이 다른 Thread에 보장되지 않을 수 있기 때문입니다.
따라서 Safe Publication을 위해서는 Happens-Before 관계 등을 통해 객체의 초기화 결과가 다른 Thread에서도 올바르게 관찰되도록 해야 합니다.

---

# Safe Publication이란?

Safe Publication(안전한 공개)은 한 Thread에서 `생성하고 초기화한 객체`를 다른 Thread가 `올바르게 초기화된 상태로 관찰`할 수 있도록 공개하는 것입니다.
Java에서 객체 생성이 완료되었더라도 다른 Thread가 초기화된 필드 값을 반드시 관찰할 수 있는 것은 아닙니다.
다음 코드를 살펴봅시다.

```java
class Config {
    int port;

    Config() {
        port = 8080;
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
            }
        });

        writer.start();
        reader.start();

        writer.join();
        reader.join();
    }
}
```

개발자가 예상한 실행 흐름은 다음과 같습니다.

1. Writer Thread가 Config 객체를 생성합니다.
2. 생성자에서 port를 8080으로 초기화합니다.
3. 생성된 객체의 참조를 공유 변수 config에 저장합니다.
4. Reader Thread가 config를 읽고 port를 출력합니다.

그렇다면 Reader Thread가 config를 null이 아닌 값으로 읽었다면 반드시 `8080`이 출력될까요?
정답은 아닙니다. `0`이 출력되는 것도 JMM에서 허용됩니다.
그렇다면 객체 생성이 정상적으로 완료되었는데도 왜 이러한 결과가 발생할 수 있을까요?

---

# 왜 Safe Publication 문제가 발생할까?

## 객체의 생성과 초기화

먼저 Java에서 객체가 생성되는 과정을 살펴보겠습니다.

```java
Config instance = new Config();
config = instance;
```

객체 생성과 공개는 개념적으로 다음 과정을 거칩니다.

1. `메모리 할당`: Heap에 Config 객체를 위한 메모리를 확보합니다.
2. `기본값 초기화`: port를 기본값인 0으로 초기화합니다.
3. `생성자 실행`: port에 8080을 저장합니다.
4. `참조 공개`: 생성자가 정상적으로 완료된 후 config에 객체의 참조를 저장합니다.

여기서 주목할 점은 `port = 8080`과 `config = instance`가 `서로 다른 메모리 쓰기 동작`이라는 것입니다.
Writer Thread에서는 필드 초기화가 참조 공개보다 앞서지만, 다른 Thread에서도 그 순서와 결과를 동일하게 관찰한다는 보장은 없습니다.

## 메모리 연산의 재정렬

앞선 객체 생성 과정을 메모리 연산으로 표현하면 다음과 같습니다.

```java
// 개념적인 표현이며 실제 Java 코드가 아님
Config instance = allocate(); // 메모리 할당 및 기본값 초기화
instance.port = 8080;          // 필드 초기화
config = instance;             // 참조 공개
```

하지만 두 Thread 사이에 적절한 동기화가 없다면 Reader Thread에서는 다음과 같이 `참조 공개가 필드 초기화보다 먼저 이루어진 것처럼 관찰`할 수 있습니다.

```java
// 재정렬로 허용될 수 있는 관찰 결과를 설명하기 위한 표현
Config instance = allocate(); // 메모리 할당 및 기본값 초기화
config = instance;             // 참조 공개
instance.port = 8080;          // 필드 초기화
```

즉, Reader Thread가 객체의 참조를 관찰한 시점에 필드 초기화 결과는 아직 관찰하지 못할 수 있습니다.
다만 실제 JVM이 반드시 생성자 내부의 명령어를 위와 같이 재정렬한다는 의미는 아닙니다. 동기화되지 않은 두 메모리 쓰기의 결과가 다른 Thread에서 이러한 순서로 관찰될 수 있다는 뜻입니다.

## 메모리 가시성

재정렬이 발생하지 않더라도 초기화 결과의 가시성이 보장되지 않는다는 문제가 남아 있습니다.
Writer Thread가 port에 8080을 저장했더라도 Reader Thread에서는 다음과 같은 결과가 허용됩니다.

- `config != null`: 객체의 참조를 관찰합니다.
- `current.port == 0`: 생성자에서 기록한 8080은 관찰하지 못합니다.

이는 객체 생성이 실패했다는 의미가 아니라, `객체의 참조와 내부 필드의 초기화 결과`가 다른 Thread에 `함께 보장되지 않는다`는 의미입니다.
따라서 객체의 참조를 공유하는 것만으로는 올바르게 초기화된 상태까지 전달했다고 볼 수 없습니다.

## Happens-Before 관계의 부재

앞선 문제는 Writer Thread의 초기화 동작과 Reader Thread의 필드 읽기 사이에 Happens-Before 관계가 보장되지 않기 때문에 발생합니다.
Writer Thread에서는 다음과 같은 Program Order가 성립합니다.

```
port = 8080 → config = instance
```

Reader Thread에서도 다음과 같은 Program Order가 성립합니다.

```
config 읽기 → port 읽기
```

하지만 두 Thread의 동작을 연결하는 `Synchronizes-With 관계가 없으므로`, Writer Thread의 필드 초기화가 Reader Thread의 필드 읽기보다 `Happens-Before 관계에 놓이지 않습니다`.
Reader Thread가 config에서 객체 참조를 읽었다는 사실만으로 이러한 관계가 형성되는 것도 아닙니다.
따라서 객체의 참조를 관찰하더라도 초기화된 일반 필드의 값을 관찰한다는 보장은 없습니다.
이처럼 초기화 결과에 대한 보장 없이 객체의 참조를 공개하는 것을 `Unsafe Publication(안전하지 않은 공개)`이라고 합니다.
