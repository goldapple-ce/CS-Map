# 한눈에 보기

Method Area는 JVM이 Loading한 Class의 구조와 Method, Field 같은 `Class 단위 정보`를 저장하는 영역입니다.

이를 이해하면 Heap에 저장되는 객체 정보와 Class 자체의 정보를 구분할 수 있고, Class Metadata가 계속 쌓여 발생하는 `Metaspace` 부족 문제를 분석할 수 있습니다.

---

# Method Area란

Method Area는 JVM이 Loading한 Class와 관련된 정보를 저장하는 Runtime Data Area입니다.

대표적으로 다음과 같은 정보가 관리됩니다.

- Class 구조 정보
- Field 정보
- Method 정보
- Method Bytecode
- Runtime Constant Pool
- Class와 관련된 Runtime 정보

Method Area는 특정 Thread만 사용하는 영역이 아니라 여러 Thread가 공유합니다.

같은 Class를 이용해 여러 객체를 만들더라도 Class의 구조 자체는 동일하기 때문에 Class 정보는 공용 영역에서 관리됩니다.

---

# Runtime Constant Pool

각 Class에는 Compile 과정에서 만들어진 Constant Pool 정보가 존재합니다.

JVM은 Class를 Loading하면서 이 정보를 Runtime에서 사용할 수 있는 형태로 관리합니다.

여기에는 문자열 Literal, 숫자 Constant, Class 이름, Method나 Field를 참조하기 위한 Symbolic Reference 같은 정보가 포함될 수 있습니다.

예를 들어 다음 코드가 있다면:

```java
String message = "hello";
```

`"hello"` 같은 Literal이나 Method, Class 참조에 필요한 정보가 Constant Pool과 연결됩니다.

Runtime Constant Pool은 Class가 실행되는 동안 이러한 정보를 Runtime에서 사용할 수 있도록 관리하는 영역입니다.

---

# Method Bytecode

Java Method는 Compile되면 Bytecode로 변환됩니다.

예를 들어 다음 Method가 있다고 가정합니다.

```java
public int add(int a, int b) {
    return a + b;
}
```

Compile된 Class에는 이 Method의 이름, Parameter, Return Type과 함께 실행할 Bytecode 정보가 포함됩니다.

JVM은 Class를 Loading할 때 이러한 Method 정보를 관리하고, Execution Engine은 이를 이용해 Method를 실행합니다.

즉 Method Area는 단순히 Class 이름만 저장하는 것이 아니라 `이 Class가 어떤 Method를 가지고 있고 그 Method를 어떻게 실행해야 하는지`에 대한 정보도 관리합니다.

---

# 여러 Thread가 공유하는 이유

Method Area에 저장되는 정보는 특정 객체나 특정 Method 호출에만 필요한 정보가 아닙니다.

하나의 Class 정보는 여러 Thread가 동시에 사용할 수 있습니다.

예를 들어 여러 Thread가 같은 Service Method를 실행하더라도 Method Bytecode 자체를 Thread마다 따로 저장할 필요는 없습니다.

모든 Thread가 같은 Class와 Method 정보를 공유하고, 실제 Method 호출에 필요한 실행 상태는 각 Thread의 JVM Stack에서 따로 관리됩니다.

---

# Metaspace와의 관계

`Method Area`는 JVM Specification에서 정의하는 논리적인 Runtime Data Area입니다.

HotSpot JVM에서는 Java 8 이후 Class Metadata를 저장하기 위해 `Metaspace`를 사용합니다.

Metaspace는 Java Heap이 아니라 Native Memory를 사용합니다.

따라서 `Method Area = Metaspace`라고 완전히 동일하게 보기보다는, HotSpot JVM이 Method Area에 필요한 Class Metadata를 관리하기 위해 Metaspace를 사용하는 것으로 이해하는 것이 좋습니다.

---

# Metaspace가 부족해지는 경우

Application에서 Class가 계속 Loading되고 기존 Class와 ClassLoader가 해제되지 않으면 Class Metadata가 계속 쌓일 수 있습니다.

이런 상황은 다음과 같은 환경에서 발생할 수 있습니다.

- Runtime에 Class를 계속 생성하는 경우
- Plugin을 반복해서 Loading하는 경우
- Application Server에서 Application을 반복해서 Reload하는 경우
- Hot Reload 과정에서 이전 ClassLoader가 해제되지 않는 경우

Metaspace를 모두 사용하면 다음과 같은 오류가 발생할 수 있습니다.

```text
java.lang.OutOfMemoryError: Metaspace
```

이 문제는 객체가 Heap에 많이 쌓여 발생하는 `Java heap space`와는 원인이 다릅니다.

---

# ClassLoader와 Metaspace

Class Metadata의 생명주기는 ClassLoader와 밀접하게 연결되어 있습니다.

특정 ClassLoader가 Loading한 Class들이 더 이상 필요하지 않고 해당 ClassLoader 자체도 더 이상 참조되지 않으면 Class Unloading을 통해 관련 Metadata가 정리될 수 있습니다.

반대로 ClassLoader가 계속 참조되고 있다면 해당 ClassLoader가 Loading한 Class Metadata도 계속 남을 수 있습니다.

따라서 Metaspace 사용량이 계속 증가한다면 단순히 Class 개수만 보는 것이 아니라 `어떤 ClassLoader가 계속 살아 있는지`도 확인할 필요가 있습니다.

---

# 참고 자료

- [Java Virtual Machine Specification — Method Area](https://docs.oracle.com/javase/specs/jvms/se21/html/jvms-2.html#jvms-2.5.4)
- [Oracle Java — Java Command Options](https://docs.oracle.com/en/java/javase/21/docs/specs/man/java.html)
