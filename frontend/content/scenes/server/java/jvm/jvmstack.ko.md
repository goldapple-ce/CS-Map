# 한눈에 보기

JVM Stack은 각 Thread가 Java Method를 실행할 때 `필요한 정보를 관리하는 Thread 전용 Memory 영역`입니다.

Method가 호출될 때마다 `Stack Frame`이 생성되고, Method 실행이 끝나면 해당 Frame이 제거됩니다.

이를 이해하면 Method 호출 구조, Local Variable의 저장 위치, `StackOverflowError`가 발생하는 이유를 분석할 수 있습니다.

---

# JVM Stack이란

JVM Stack은 `Java Method 실행에 필요한 정보를 Stack Frame 단위로 관리하는 영역`입니다.

각 Thread마다 하나의 JVM Stack이 존재합니다.

Thread가 Method를 호출하면 새로운 Stack Frame이 JVM Stack에 추가되고, Method 실행이 끝나면 해당 Stack Frame이 제거됩니다.

예를 들어 다음과 같은 Method 호출이 있다고 가정합니다.

```java
public void a() {
    b();
}

public void b() {
    c();
}

public void c() {
}
```

실행 중에는 `a()`, `b()`, `c()`의 Stack Frame이 순서대로 쌓입니다.

`c()`가 끝나면 `c()`의 Frame이 제거되고, 이후 `b()`, `a()` 순서로 제거됩니다.

이처럼 JVM Stack은 Method 호출 순서를 `LIFO(Last In, First Out)` 방식으로 관리합니다.

---

# Stack Frame

Stack Frame은 하나의 Java Method를 실행하는 데 필요한 정보를 담는 단위입니다.

대표적으로 다음과 같은 정보로 구성됩니다.

- `Local Variable Array` : Parameter와 Local Variable을 저장
- `Operand Stack` : Bytecode 연산에 필요한 값을 임시로 저장
- `Dynamic Linking` : 현재 Method의 Bytecode가 다른 Method나 Field 등을 참조할 때 실제 대상과 연결하는 데 필요한 정보
- `Method Return과 관련된 정보` : Method 실행이 끝난 뒤 호출한 Method로 돌아가기 위해 필요한 정보

Method가 호출될 때마다 새로운 Stack Frame이 생성되기 때문에 서로 다른 Method의 Local Variable과 연산 상태는 각각 자신의 Frame 안에서 관리됩니다.

예를 들어 다음 Method가 있다고 가정합니다.

```java
public int add(int a, int b) {
    int result = a + b;
    return result;
}
```

이 Method의 Stack Frame에는 `a`, `b`, `result`를 관리하는 Local Variable Array와 연산에 사용하는 Operand Stack 등이 존재합니다.

---

# Local Variable Array

Local Variable Array는 Method의 Parameter와 Local Variable을 저장하는 영역입니다.

예를 들어 다음 코드가 있다고 가정합니다.

```java
public int add(int a, int b) {
    int result = a + b;
    return result;
}
```

이 Method에서는 `a`, `b`, `result`가 Local Variable Array에 저장됩니다.

Instance Method에서는 일반적으로 `this`도 Local Variable Array의 첫 번째 Slot에 저장됩니다.

예를 들어 다음과 같이 볼 수 있습니다.

```text
slot 0 : this
slot 1 : a
slot 2 : b
slot 3 : result
```

Bytecode의 `iload_1`, `istore_3` 같은 명령은 이 Slot 번호를 기준으로 값을 읽고 저장합니다.

---

# Operand Stack

Operand Stack은 Bytecode 명령이 계산을 수행할 때 임시로 값을 올려두는 공간입니다.

예를 들어 다음 코드가 있다고 가정합니다.

```java
int a = 1;
int b = 2;
int c = a + b;
```

Bytecode는 대략 다음과 같이 동작할 수 있습니다.

```text
iconst_1    // 숫자 1을 Operand Stack에 올림
istore_1    // 1을 Local Variable 1번 Slot에 저장

iconst_2    // 숫자 2를 Operand Stack에 올림
istore_2    // 2를 Local Variable 2번 Slot에 저장

iload_1     // 1번 Slot의 값을 Operand Stack에 올림
iload_2     // 2번 Slot의 값을 Operand Stack에 올림
iadd        // 두 값을 꺼내 더한 뒤 결과를 다시 Operand Stack에 올림
istore_3    // 결과를 Local Variable 3번 Slot에 저장
```

즉 Local Variable Array가 값을 보관하는 곳이라면, Operand Stack은 실제 연산 과정에서 값을 꺼내 계산하는 작업 공간에 가깝습니다.

---

# Dynamic Linking

Class File의 Bytecode는 다른 Method나 Field를 이름 기반의 `Symbolic Reference` 형태로 참조할 수 있습니다.

Stack Frame은 현재 Method가 실행되는 동안 이러한 Symbolic Reference를 실제 Runtime 대상과 연결하는 데 필요한 정보를 가집니다.  
이를 `Dynamic Linking`이라고 합니다.

예를 들어 다음 코드에서 `add()`를 호출한다고 가정합니다.

```java
return add(1, 2);
```

Bytecode에는 단순히 실제 Memory 주소가 직접 기록되어 있는 것이 아니라 Method에 대한 Symbolic Reference가 존재할 수 있습니다.  
JVM은 Runtime에 이를 실제 실행할 Method와 연결하여 호출합니다.

---

# Method 호출과 Stack Frame

Method 안에서 다른 Method를 호출하면 새로운 Stack Frame이 생성되어 현재 Thread의 JVM Stack 위에 추가됩니다.

예를 들어 다음 코드가 있다고 가정합니다.

```java
public int calculate() {
    return add(1, 2);
}

public int add(int a, int b) {
    return a + b;
}
```

먼저 `calculate()`가 호출되면 `calculate()`의 Stack Frame이 생성됩니다.

그 안에서 `add()`를 호출하면 `calculate()`의 Frame은 그대로 유지된 상태에서 그 위에 `add()`의 새로운 Stack Frame이 생성됩니다.

현재 가장 위에 있는 `add()`의 Stack Frame을 사용해 Method가 실행됩니다.

`add()`가 결과를 반환하면 반환값이 호출한 Method에 전달되고 `add()`의 Stack Frame은 제거됩니다.  
이후 실행 흐름은 다시 `calculate()`의 Stack Frame으로 돌아갑니다.

즉 Method 호출과 반환은 다음과 같은 흐름으로 동작합니다.

1. Method 호출
2. 새로운 Stack Frame 생성
3. JVM Stack 위에 Frame 추가
4. 해당 Frame을 이용해 Method 실행
5. Method가 결과를 반환
6. Stack Frame 제거
7. 호출한 Method의 Frame으로 실행 복귀

이 때문에 Method 호출이 깊어질수록 JVM Stack에는 더 많은 Stack Frame이 쌓입니다.

---

# 왜 Thread마다 JVM Stack이 따로 있을까

Thread마다 서로 다른 Method를 동시에 실행할 수 있기 때문입니다.

Thread A가 주문 처리 Method를 실행하고 있고, Thread B가 예약 조회 Method를 실행하고 있다면 각 Thread의 Method 호출 상태와 Local Variable은 서로 독립적이어야 합니다.

따라서 JVM Stack은 Thread마다 하나씩 생성됩니다.

이 특성 때문에 일반적인 Local Variable은 다른 Thread와 직접 공유되지 않습니다.

---

# StackOverflowError

Method 호출이 너무 깊어지면 JVM Stack에 Stack Frame이 계속 쌓입니다.

대표적인 예가 무한 재귀 호출입니다.

```java
public void recursive() {
    recursive();
}
```

`recursive()`가 호출될 때마다 새로운 Stack Frame이 생성됩니다.

이 과정이 계속되면 Thread에 할당된 Stack 공간을 모두 사용하게 되고 다음 오류가 발생합니다.

```text
java.lang.StackOverflowError
```

이 문제는 Heap Memory 부족과는 다릅니다.

Heap 크기를 늘려도 해결되지 않으며, 재귀 호출 구조나 비정상적으로 깊어진 Method 호출을 확인해야 합니다.

---

# 객체는 Stack에 저장될까

Java에서 객체 자체는 일반적으로 Heap에 생성됩니다.

```java
User user = new User();
```

이 경우 `user`라는 Local Variable은 JVM Stack의 Stack Frame 안에 존재할 수 있지만, `new User()`로 생성된 실제 객체는 Heap에 존재합니다.

즉 다음처럼 구분할 수 있습니다.

- `user` Reference : JVM Stack
- `User` 객체 : Heap

다만 JVM의 JIT 최적화에 따라 실제 물리적인 저장 방식은 달라질 수 있으므로, 이는 JVM의 논리적인 Memory Model을 기준으로 이해하는 것이 좋습니다.

---

# Stack Size

각 Thread는 자신만의 JVM Stack을 가지기 때문에 Thread 수가 많아지면 Stack에 필요한 Memory도 함께 증가합니다.

예를 들어 Thread 하나당 Stack 크기가 크다면 수천 개의 Thread를 생성했을 때 상당한 Memory를 사용할 수 있습니다.

JVM에서는 `-Xss` 옵션으로 Thread Stack 크기를 설정할 수 있습니다.

```text
-Xss1m
```

Stack 크기를 너무 작게 설정하면 깊은 Method 호출에서 `StackOverflowError`가 더 쉽게 발생할 수 있고, 너무 크게 설정하면 많은 Thread를 생성할 때 전체 Memory 사용량이 증가할 수 있습니다.

---

# 참고 자료

- [Java Virtual Machine Specification — Java Virtual Machine Stacks](https://docs.oracle.com/javase/specs/jvms/se21/html/jvms-2.html#jvms-2.5.2)
- [Java Virtual Machine Specification — Frames](https://docs.oracle.com/javase/specs/jvms/se21/html/jvms-2.html#jvms-2.6)
