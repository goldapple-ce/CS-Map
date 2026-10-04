# 한눈에 보기

Class Loader를 이해하면 Compile된 Class가 Runtime에 어떻게 선택되고 Loading되어 실행되는지 알 수 있습니다.

이를 통해 Compile 환경과 Runtime 환경의 차이로 발생하는 Class Loading 문제, 같은 이름의 Class가 서로 다른 Type으로 인식되는 문제, `static` 초기화 시점과 관련된 문제 등을 분석할 수 있습니다.

또한 Runtime에 필요한 Class를 동적으로 Loading하는 Plugin, SPI, Hot Reload 같은 구조를 이해하는 데도 도움이 됩니다.

---

# Class Loader란

Class Loader는 `실행에 필요한 Class를 찾아 JVM에 불러오고 사용할 수 있는 상태로 준비하는 역할`을 합니다.

Class를 사용할 수 있는 상태로 만드는 과정은 크게 다음과 같이 나눌 수 있습니다.

1. `Loading` : 필요한 `.class` 파일을 찾아 Bytecode를 읽어 JVM 내부에 Class 정보를 생성합니다.
2. `Linking` : Loading된 Class를 실제로 사용할 수 있도록 준비합니다.
3. `Initialization` : Class의 `static` Field에 실제 값을 할당하고 `static` Block을 실행합니다.

---

# Loading

`Loading`은 필요한 `.class` 파일을 찾아 Bytecode를 읽고 JVM 내부에 Class 정보를 생성하는 과정입니다.

Java는 모든 Class를 Application 시작 시 한 번에 Loading하지 않고, 필요한 시점에 Class Loader를 통해 Loading할 수 있습니다.
이 특성을 이용하면 Application이 Compile 시점에 모든 구현 Class를 직접 알고 있지 않아도 Runtime에 존재하는 Class를 찾아 사용할 수 있습니다.

## 활용 예시

Java의 SPI(Service Provider Interface)는 Runtime에 구현체를 찾아 사용하는 대표적인 예입니다.

```java
ServiceLoader<PaymentProvider> providers = ServiceLoader.load(PaymentProvider.class);

for (PaymentProvider provider : providers) {
    provider.pay();
}
```

Application은 `PaymentProvider` Interface만 알고 있고, 실제 구현체는 Runtime에 추가할 수 있습니다.  
이런 구조는 Plugin이나 확장 가능한 Framework를 만들 때 활용할 수 있습니다.

---

# Linking

`Linking`은 Loading된 Class를 JVM에서 실제로 사용할 수 있도록 준비하는 과정입니다.

다음 세 단계로 나눌 수 있습니다.

1. `Verification` : Bytecode가 JVM 규칙에 맞는지 검사합니다.
2. `Preparation` : `static` Field를 위한 Memory를 준비하고 기본값을 할당합니다.
3. `Resolution` : Class, Method, Field의 Symbolic Reference를 Runtime에서 실제 사용할 대상과 연결합니다.

예를 들어 다음 Field가 있다고 가정합니다.

```java
static int count = 10;
```

Preparation 단계에서는 먼저 기본값인 `0`이 준비되고, 실제 값인 `10`은 이후 Initialization 단계에서 할당됩니다.

`Resolution`에서는 Compile 시 Bytecode에 기록된 Class, Method, Field에 대한 이름 기반 참조를 Runtime에서 실제 사용할 대상과 연결합니다.

이 과정을 알면 Compile은 정상적으로 끝났지만 Runtime에서 Method나 Field를 찾지 못하는 문제가 왜 발생할 수 있는지 이해하기 쉬워집니다.

---

# Initialization

`Initialization`은 Class의 `static` Field에 실제 값을 할당하고 `static` Block을 실행하는 단계입니다.

Class가 Loading됐다고 해서 바로 Initialization까지 완료된 것은 아닙니다. Java는 일반적으로 Class가 실제로 처음 사용되는 시점에 Initialization합니다.

예를 들어 다음과 같은 Class가 있다고 가정합니다.

```java
public class Config {

    static String host = loadHost();

    static {
        System.out.println("Config initialized");
    }
}
```

`Config`가 처음 실제로 사용되는 시점에 `host`의 값이 설정되고 `static` Block이 실행됩니다.

이 과정을 알면 `static` Field가 언제 만들어지는지, 초기화 순서에 따라 왜 예상과 다른 값이나 오류가 발생할 수 있는지 분석할 수 있습니다.

---

# Class Loader의 종류

JVM에서는 여러 Class Loader가 역할을 나눠 Class를 Loading합니다.

- `Bootstrap Class Loader` : Java의 핵심 Class를 Loading합니다.
- `Platform Class Loader` : Java Platform에서 제공하는 Module과 Library를 Loading합니다.
- `Application Class Loader` : Application의 Classpath에 존재하는 Class와 외부 Library를 Loading합니다.

일반적인 Application에서는 개발자가 작성한 Class와 외부 Library 대부분이 `Application Class Loader`를 통해 Loading됩니다.

여러 Class Loader를 직접 의식해야 하는 경우는 Application Server, Plugin, Hot Reload처럼 Class를 서로 격리하거나 별도로 Loading해야 하는 환경입니다.

## Parent Delegation

Class Loader는 일반적으로 자신이 바로 Class를 Loading하지 않고 먼저 상위 Class Loader에게 요청합니다.

```
Application Class Loader → Platform Class Loader → Bootstrap Class Loader
```

상위 Class Loader가 Class를 찾지 못하면 하위 Class Loader가 자신이 담당하는 위치에서 Class를 찾습니다.

이를 `Parent Delegation Model`이라고 합니다. 이 구조를 사용하면 Java의 핵심 Class가 Application에서 정의한 같은 이름의 Class에 의해 쉽게 대체되는 것을 방지할 수 있습니다.

예를 들어 Application에서 `java.lang.String`과 같은 이름의 Class를 정의하더라도 일반적인 Parent Delegation 구조에서는 Bootstrap Class Loader가 제공하는 Java의 실제 `String`이 우선 사용됩니다.

---

# Class의 정체성

JVM에서 Class의 정체성은 Class 이름만으로 결정되지 않습니다.

`Class 이름 + Class를 Loading한 Class Loader`

이 두 가지가 함께 같아야 같은 Type으로 취급됩니다.

따라서 이름과 Bytecode가 같은 Class라도 서로 다른 Class Loader가 Loading하면 JVM에서는 서로 다른 Type이 될 수 있습니다.

## 활용 예시

Plugin마다 별도의 Class Loader를 사용하면 서로 다른 Version의 Library를 독립적으로 Loading할 수 있습니다.

또 Hot Reload에서는 기존 Class Loader를 계속 수정하는 대신 새로운 Class Loader를 만들고 수정된 Class를 다시 Loading하는 방식을 사용할 수 있습니다.

```java
Class<?> oldUser = oldLoader.loadClass("com.example.User");
Class<?> newUser = newLoader.loadClass("com.example.User");

System.out.println(oldUser == newUser); // false
```

Class 이름은 같지만 서로 다른 Class Loader가 Loading했기 때문에 JVM에서는 서로 다른 Class로 취급할 수 있습니다.

이 특성이 Class Isolation, Plugin 구조, Hot Reload를 구현할 수 있는 기반 중 하나가 됩니다.

---

# 참고 자료

- [Java Virtual Machine Specification — Loading, Linking, and Initializing](https://docs.oracle.com/javase/specs/jvms/se21/html/jvms-5.html)
- [Java Language Specification — Execution](https://docs.oracle.com/javase/specs/jls/se21/html/jls-12.html)
- [Oracle Java Tutorial — Understanding Extension Class Loading](https://docs.oracle.com/javase/tutorial/ext/basics/load.html)
- [Spring Boot Reference — Developer Tools](https://docs.spring.io/spring-boot/reference/using/devtools.html)
