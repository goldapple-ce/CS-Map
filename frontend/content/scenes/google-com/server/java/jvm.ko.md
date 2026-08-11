# 한눈에 보기

JVM(Java Virtual Machine)은 Java Bytecode를 불러와 실행하는 runtime입니다. Spring Application도 JVM process 안에서 실행됩니다.

JVM은 단순히 Bytecode 명령만 순서대로 읽는 도구가 아닙니다. Class를 불러오고, 실행에 필요한 memory를 관리하며, 자주 실행되는 코드를 현재 CPU가 실행할 수 있는 기계어로 최적화할 수 있습니다.

---

# OS 차이를 맡는 실행 계층

Java Compiler는 Source Code를 특정 OS의 기계어가 아니라 공통 Bytecode로 만듭니다. 그 Bytecode를 Windows용 JVM, Linux용 JVM과 macOS용 JVM이 각 OS와 CPU에 맞게 실행합니다.

```text
                 ┌→ Windows용 JVM → Windows
같은 Bytecode ──┼→ Linux용 JVM   → Linux
                 └→ macOS용 JVM   → macOS
```

따라서 Java Application은 OS의 thread, memory와 network 기능을 매번 서로 다른 방식으로 직접 다루는 대신 JVM이 제공하는 공통 실행 환경을 사용할 수 있습니다. 이것이 Java의 플랫폼 독립성을 이해할 때 가장 중요한 구조입니다.

다만 native library, OS 전용 경로 또는 명령에 의존하는 코드는 다른 OS에서 그대로 동작하지 않을 수 있습니다. JVM이 있다고 해서 모든 Java 코드의 이식성이 자동으로 보장되는 것은 아닙니다.

---

# 주요 역할

- `Class Loading`: 실행에 필요한 Class를 찾아 JVM 내부로 불러옵니다.
- `Runtime Data Area`: 객체, method 호출 정보와 Class 정보를 목적에 맞는 memory 영역에 관리합니다.
- `Execution Engine`: Bytecode를 해석하고 실행하며 필요한 경우 JIT Compiler로 기계어를 생성합니다.
- `Garbage Collection`: 더 이상 사용되지 않는 객체가 차지한 Heap memory를 회수합니다.

이 구성요소들은 이후 JVM 내부 Scene에서 더 자세히 나눌 수 있습니다.

---

# 개발자가 개입하는 지점

개발자는 JVM 구현을 직접 작성하지는 않지만 실행 환경을 선택하고 option을 조정합니다. 대표적으로 Java version, 초기·최대 Heap 크기, Garbage Collector와 오류 진단용 log를 설정할 수 있습니다.

다만 JVM option은 많을수록 좋은 것이 아닙니다. 먼저 Application의 memory 사용량과 응답 시간, Garbage Collection 상태를 측정한 뒤 필요한 설정을 변경해야 합니다.

---

# 헷갈리기 쉬운 점

## JVM은 운영체제와 무관하게 존재하지 않습니다

Bytecode 형식과 JVM 규격은 공통이지만 JVM 프로그램 자체는 운영체제와 CPU에 맞는 구현이 필요합니다. JVM이 Bytecode와 실제 실행 환경 사이의 차이를 맡기 때문에 같은 Java Application을 여러 환경에서 실행하기 쉬워집니다.

## JVM 하나가 모든 Java Application을 실행하는 것은 아닙니다

일반적으로 Java Application을 시작할 때 별도의 JVM process가 만들어집니다. 같은 Server에서 여러 Java Application을 실행하면 각각 다른 JVM process와 Heap을 가질 수 있습니다.

---

# 참고 자료

- [Java Virtual Machine Specification](https://docs.oracle.com/javase/specs/jvms/se21/html/)
- [Oracle Java — Java HotSpot Virtual Machine Performance Enhancements](https://docs.oracle.com/en/java/javase/21/vm/java-hotspot-virtual-machine-performance-enhancements.html)
