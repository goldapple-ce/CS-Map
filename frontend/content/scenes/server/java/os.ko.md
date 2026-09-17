# 한눈에 보기

OS(Operating System)는 JVM process가 실제로 실행되는 기반입니다. CPU 실행 시간과 memory를 배분하고 thread, file, network와 같은 시스템 기능을 제공합니다.

Java Application은 이러한 기능을 OS마다 직접 구현하기보다 Java API와 JVM을 통해 사용하는 경우가 많습니다. JVM은 현재 OS에 맞는 방식으로 필요한 기능을 연결합니다.

---

# JVM과 OS의 관계

같은 `.class` Class File과 그 안의 Bytecode를 여러 OS에서 사용할 수 있지만, JVM 실행 파일까지 완전히 같은 것은 아닙니다. Windows에는 Windows용 JVM이 필요하고 Linux에는 Linux용 JVM이 필요합니다.

```text
Java Application
       ↓
공통 Bytecode
       ↓
OS에 맞는 JVM
       ↓
OS와 Hardware
```

즉, Java Application이 OS와 완전히 관계없는 것이 아니라 JVM이 그 사이에서 차이를 흡수합니다.

---

# 개발자가 개입하는 지점

개발자는 배포할 Server의 OS와 CPU에 맞는 JDK 또는 JVM 배포판을 선택합니다. File path, 문자 encoding, process 권한과 native library처럼 OS에 영향을 받는 부분도 확인해야 합니다.

일반적인 Java 코드가 OS 기능을 어떻게 호출하는지 직접 구현하지는 않습니다. 그럼에도 JVM 아래에 OS가 있다는 사실을 알면 thread 수, file descriptor, memory 제한과 network 오류가 Java Application에도 영향을 주는 이유를 이해할 수 있습니다.

---

# 참고 자료

- [Java Virtual Machine Specification](https://docs.oracle.com/javase/specs/jvms/se21/html/)
- [Oracle Java — Java Native Interface Specification](https://docs.oracle.com/en/java/javase/21/docs/specs/jni/)
