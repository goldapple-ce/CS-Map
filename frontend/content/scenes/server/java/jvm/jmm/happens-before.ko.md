# 한눈에 보기

Happens-Before는 JMM에서 두 동작 사이의 메모리 `가시성과 순서를 보장하는 논리적인 관계`입니다.
멀티스레드 환경에서는 한 Thread가 먼저 값을 변경했다고 해서 다른 Thread가 그 변경을 관찰한다는 보장이 없으므로, `Happens-Before를 통해 보장 여부를 판단`합니다.
이 관계는 `Program Order`와 `Synchronizes-With`를 기반으로 하며, `전이성(Transitivity)`을 통해 확장됩니다.

---

# Happens-Before란?

Java는 어떤 조건에서 메모리 변경의 가시성과 순서가 보장된다고 판단할 수 있을까요? 이를 판단하기 위해 알아야 하는 개념이 `Happens-Before`입니다.
Happens-Before는 `두 동작 사이의 메모리 가시성과 순서를 보장하는 논리적인 관계`입니다.
한 동작 A가 다른 동작 B보다 Happens-Before 관계에 있다면, A에서 발생한 메모리 변경은 B에 대해 가시성이 보장됩니다. 단, 중간에 다른 쓰기가 존재한다면 B가 반드시 A에서 기록한 값 자체를 읽는다는 의미는 아닙니다.

---

# 어떤 조건에서 Happens-Before 관계가 성립할까?

JMM에서는 Program Order와 Synchronizes-With 관계를 전이적으로 연결한 것으로 Happens-Before를 정의합니다.

여기서 등장하는 개념은 다음과 같습니다.

- `Program Order`: 동일한 Thread에서 동작들이 어떤 순서로 정의되는지를 나타내는 관계입니다.
- `Synchronizes-With`: 특정 동기화 동작들 사이에 성립하는 관계입니다.
- `Transitivity(전이성)`: 앞서 형성된 관계들을 연결하여 Happens-Before 관계를 확장하는 성질입니다.

즉, Program Order와 Synchronizes-With는 Happens-Before를 구성하는 기본 관계이며, Transitivity는 이 관계들을 연결하는 성질입니다.
이제 각 개념이 구체적으로 어떤 의미인지 살펴보겠습니다.

## Program Order

Program Order는 `동일한 Thread에서 프로그램에 정의된 동작들의 순서`를 의미합니다.
JMM에서는 같은 Thread에서 앞선 동작이 이후의 동작보다 Happens-Before 관계에 있다고 정의합니다.

```java
int data = 42;
boolean ready = true;
```

위 코드에서 data에 42를 저장하는 동작은 ready를 true로 변경하는 동작보다 Happens-Before 관계에 있습니다.
따라서 `data = 42 → ready = true`라는 관계가 성립합니다.
다만 동일한 Thread에서 성립한 관계가 다른 Thread의 동작까지 자동으로 연결되는 것은 아닙니다.

## Synchronizes-With

Synchronizes-With는 `특정 동기화 동작들 사이에 성립하는 관계`입니다.
Program Order가 동일한 Thread 안에서 동작들의 순서를 정의한다면, Synchronizes-With는 서로 다른 Thread의 동작 사이에도 Happens-Before 관계를 형성할 수 있게 합니다.

대표적으로 다음과 같은 경우에 성립합니다.

- volatile 변수에 대한 Write와 동기화 순서상 이후의 동일 변수 Read
- 동일한 Monitor Lock의 해제와 동기화 순서상 이후의 획득
- Thread.start() 호출과 새로 시작된 Thread의 첫 동작
- Thread의 종료와 다른 Thread가 해당 종료를 확인하는 동작

즉, `Synchronizes-With는 스레드 간 Happens-Before 관계가 성립하는 직접적인 근거`입니다.
각 동기화 수단의 구체적인 동작 방식은 다음 동기화 규칙에서 설명하겠습니다.

---

# Transitivity (전이성)

지금까지 Program Order와 Synchronizes-With를 통해 Happens-Before 관계가 형성되는 조건을 살펴보았습니다.
그런데 실제 프로그램에서는 여러 동작이 연속적으로 실행되므로 이러한 관계들을 서로 연결할 필요가 있습니다.
이때 적용되는 성질이 Transitivity(전이성)입니다.

전이성이란 `A가 B보다 Happens-Before이고, B가 C보다 Happens-Before라면 A 역시 C보다 Happens-Before가 되는 성질`입니다.

이러한 전이성을 통해 동일한 Thread 내부에서 형성된 Program Order와 서로 다른 Thread 사이의 Synchronizes-With 관계를 연결할 수 있습니다.
따라서 직접적인 동기화 동작이 아닌 일반적인 공유 변수의 읽기와 쓰기 사이에도 Happens-Before 관계가 성립할 수 있습니다.
