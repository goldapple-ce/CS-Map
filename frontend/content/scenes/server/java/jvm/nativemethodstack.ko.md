# 한눈에 보기

Native Method Stack은 Java가 아닌 `Native Code를 실행할 때 사용하는 Thread 전용 Stack 영역`입니다.

Java Application이 JNI나 JVM 내부 Native 기능을 사용할 때 Java Method와는 다른 실행 정보가 필요하기 때문에 별도의 Native Method Stack이 사용될 수 있습니다.

---

# Native Method Stack이란

Java Application이 항상 Java Bytecode만 실행하는 것은 아닙니다.

필요한 경우 Java Code에서 C, C++ 같은 Native Code를 호출할 수 있습니다.

예를 들어 다음과 같이 `native` Method를 선언할 수 있습니다.

```java
public native void callNative();
```

이 Method의 실제 구현은 Java Bytecode가 아니라 Native Code에 존재합니다.

이처럼 Thread가 Native Method를 실행할 때 필요한 호출 정보와 실행 상태를 관리하는 영역이 `Native Method Stack`입니다.

---

# 왜 별도의 Stack이 필요한가

Java Method와 Native Method는 실행 방식이 다릅니다.

Java Method는 JVM Bytecode를 실행하기 때문에 `JVM Stack`의 Stack Frame을 사용합니다.

반면 Native Method는 JVM Bytecode가 아닌 Native Code를 실행하므로 JVM Stack과는 다른 형태의 실행 정보가 필요할 수 있습니다.

따라서 JVM은 Native Method 실행을 위해 별도의 Native Method Stack을 사용할 수 있습니다.

정리하면 다음과 같습니다.

- `JVM Stack` : Java Method 실행 정보 관리
- `Native Method Stack` : Native Method 실행 정보 관리

---

# JNI와의 관계

Java에서 Native Code를 호출할 때 대표적으로 `JNI(Java Native Interface)`를 사용할 수 있습니다.

예를 들어 Java에서는 다음과 같이 Native Method를 선언합니다.

```java
public class NativeExample {

    public native int add(int a, int b);
}
```

실제 `add()` 구현은 C나 C++ 같은 Native Code에 존재할 수 있습니다.

Java Thread가 이 Method를 호출하면 실행 흐름이 Java Bytecode에서 Native Code로 넘어갑니다.

이때 Native Code 실행에 필요한 정보는 Native Method Stack과 연결됩니다.

---

# Thread마다 존재하는 이유

Native Method Stack도 일반적으로 Thread별로 관리됩니다.

Thread A와 Thread B가 서로 다른 Native Method를 동시에 실행할 수 있기 때문에 각 Thread의 Native 실행 상태 역시 독립적으로 관리되어야 합니다.

이 점은 JVM Stack과 비슷합니다.

---

# JVM Stack과 차이

둘 다 Method 실행을 위한 Stack이지만 대상이 다릅니다.

Java Method를 실행하면 JVM Stack에 Stack Frame이 생성되고, Native Method를 실행하면 Native Method 실행을 위한 Stack이 사용될 수 있습니다.

예를 들어 다음과 같은 흐름이 있을 수 있습니다.

```java
public void process() {
    calculate();
    callNative();
}
```

`process()`와 `calculate()`는 Java Method이므로 JVM Stack에서 관리됩니다.

`callNative()`가 Native Method라면 해당 실행은 Native Method Stack과 연결될 수 있습니다.

즉 Java와 Native Code를 오갈 때 Thread는 서로 다른 실행 영역을 사용할 수 있습니다.

---

# 언제 신경 써야 할까

일반적인 Spring Boot Application을 개발하면서 Native Method Stack을 직접 다룰 일은 거의 없습니다.

다만 다음과 같은 경우에는 관련될 수 있습니다.

- JNI를 직접 사용하는 경우
- C/C++ 기반 Native Library를 호출하는 경우
- JVM 내부 Native 기능과 관련된 문제를 분석하는 경우
- Native Stack Overflow나 Native Crash를 분석하는 경우

일반적인 Java Backend 개발에서는 구조만 이해하고 넘어가도 충분한 영역입니다.

---

# 참고 자료

- [Java Virtual Machine Specification — Native Method Stacks](https://docs.oracle.com/javase/specs/jvms/se21/html/jvms-2.html#jvms-2.5.6)
- [Oracle Java — Java Native Interface Specification](https://docs.oracle.com/en/java/javase/21/docs/specs/jni/)
