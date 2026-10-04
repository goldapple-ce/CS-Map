# 한눈에 보기

PC Register는 각 Thread가 `현재 어디까지 실행했는지 기억하는 영역`입니다.

여러 Thread가 번갈아 실행되더라도 각 Thread가 자신이 멈춘 위치에서 다시 실행할 수 있도록 현재 실행 중인 JVM 명령의 위치를 저장합니다.

---

# PC Register란

Java 코드는 JVM에서 Bytecode 명령 단위로 실행됩니다.

예를 들어 다음 코드가 있다고 가정합니다.

```java
int a = 1;
int b = 2;
int c = a + b;
```

JVM에서는 이 코드가 여러 Bytecode 명령으로 나뉘어 실행됩니다.

```text
iconst_1    // 숫자 1을 Operand Stack에 올림
istore_1    // Operand Stack의 1을 Local Variable 1번 슬롯(a)에 저장

iconst_2    // 숫자 2를 Operand Stack에 올림
istore_2    // Operand Stack의 2를 Local Variable 2번 슬롯(b)에 저장

iload_1     // Local Variable 1번 슬롯의 값(a = 1)을 Operand Stack에 올림
iload_2     // Local Variable 2번 슬롯의 값(b = 2)을 Operand Stack에 올림

iadd        // Operand Stack의 1과 2를 꺼내 더한 뒤 3을 다시 올림
istore_3    // 3을 Local Variable 3번 슬롯(c)에 저장
```

Thread가 현재 `iadd`를 실행하고 있다면 PC Register는 `현재 이 명령을 실행 중이다`라는 위치 정보를 가지고 있습니다.

즉 PC Register는 변수나 객체를 저장하는 공간이 아니라 `현재 실행 위치를 기억하는 공간`입니다.

---

# 왜 Thread마다 하나씩 있을까

여러 Thread는 동시에 서로 다른 코드를 실행할 수 있습니다.

예를 들어 Thread A는 주문 처리 Method를 실행하고 있고, Thread B는 예약 조회 Method를 실행하고 있을 수 있습니다.

각 Thread가 현재 어디까지 실행했는지는 서로 다르기 때문에 실행 위치도 따로 관리해야 합니다.

그래서 PC Register는 Thread마다 하나씩 존재합니다.

---

# 왜 필요한가

CPU Core보다 실행할 Thread가 많으면 모든 Thread를 계속 동시에 실행할 수 없습니다.

OS Scheduler는 한 Thread를 실행하다가 다른 Thread로 바꿔가며 실행할 수 있습니다.

Thread A가 실행되다가 잠시 멈췄다가 다시 CPU를 받았을 때 처음부터 다시 실행하면 안 됩니다.

이전에 어디까지 실행했는지 알아야 그 다음 명령부터 이어서 실행할 수 있습니다.

PC Register는 이때 필요한 `현재 실행 위치`를 나타냅니다.

쉽게 비유하면 책갈피와 비슷합니다.

책을 읽다가 잠시 덮더라도 책갈피가 있으면 다음에 같은 위치에서 다시 읽을 수 있습니다.

PC Register도 Thread가 현재 Bytecode의 어느 위치를 실행하고 있는지 나타내는 역할을 합니다.

---

# JVM Stack과 차이

PC Register와 JVM Stack은 모두 Thread마다 존재하지만 역할은 다릅니다.

`JVM Stack`은 Method 실행에 필요한 Local Variable, Operand Stack, Method 호출 상태 등을 관리합니다.

반면 `PC Register`는 현재 어떤 JVM Bytecode 명령을 실행하고 있는지를 나타냅니다.

정리하면 다음과 같습니다.

- `JVM Stack` : Method를 실행하는 데 필요한 데이터와 호출 상태
- `PC Register` : 현재 실행하고 있는 Bytecode의 위치

---

# 참고 자료

- [Java Virtual Machine Specification — The pc Register](https://docs.oracle.com/javase/specs/jvms/se21/html/jvms-2.html#jvms-2.5.1)
