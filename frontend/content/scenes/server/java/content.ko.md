# 한눈에 보기

Java로 작성한 Source Code는 그대로 실행되지 않습니다. Java Compiler가 JVM이 읽을 수 있는 Class File을 만들고, 현재 OS에 맞게 만들어진 JVM이 그 안의 Bytecode를 실행합니다.

```text
Java Source → Java Compiler → Class File → JVM → OS
```

이 구조의 핵심은 Java Application을 OS마다 서로 다른 기계어로 직접 만들지 않아도 된다는 점입니다. 동일한 Class File과 Bytecode를 Windows용 JVM, Linux용 JVM과 macOS용 JVM이 각 환경에 맞게 실행합니다.

---

# 구성 요소

- `Java Source`: 개발자가 `.java` 파일에 작성한 코드입니다.
- `Java Compiler`: Source Code를 검사하고 `.class` Class File로 변환합니다.
- `Class File`: Class 구조와 Constant Pool, Field·Method 정보 및 Method Bytecode를 담는 JVM 입력 형식입니다.
- `JVM`: Class를 불러오고 Bytecode를 실행하며 memory와 Garbage Collection을 관리합니다.
- `OS`: process, thread, file, network와 memory 같은 실제 시스템 기능을 제공합니다.

---

# 전체 흐름

1. 개발자가 Java Source Code를 작성합니다.
2. Java Compiler가 문법과 type을 검사하고 `.class` Class File을 생성합니다.
3. Application을 시작하면 JVM이 필요한 Class File을 불러옵니다.
4. JVM이 Class 구조를 준비하고 Method Bytecode를 실행할 수 있는 상태로 만듭니다.
5. 현재 OS와 CPU에 맞는 JVM이 Bytecode를 해석하거나 자주 실행되는 부분을 현재 CPU의 기계어로 컴파일해 실행합니다.
6. JVM은 thread, file과 network처럼 실제 시스템 기능이 필요할 때 OS의 기능을 사용합니다.
7. 실행 중 생성된 객체와 method 호출에 필요한 memory를 관리하고, 사용하지 않는 객체는 Garbage Collector가 정리합니다.

`JAR` 파일은 여러 `.class` 파일과 resource를 하나로 묶는 배포 형식입니다. JAR 자체가 새로운 실행 언어인 것은 아니며 내부의 Java Class는 여전히 JVM에서 실행됩니다.

---

# 개발자가 개입하는 지점

개발자는 Java version과 build 설정을 선택하고 Source Code를 작성합니다. Application을 실행할 때는 JVM option으로 Heap 크기, Garbage Collector와 진단 설정 등을 조정할 수 있습니다.

성능이나 memory 문제가 생기면 Source Code만 확인하지 않고 JVM의 Heap 사용량, Garbage Collection 기록과 thread 상태도 함께 살펴봅니다.

---

# 헷갈리기 쉬운 점

## Java와 JVM은 같은 것이 아닙니다

Java는 Source Code를 작성하는 language와 관련 도구/library의 생태계를 가리킵니다. JVM은 컴파일된 Bytecode를 실제로 실행하는 runtime입니다.

## JVM 자체가 모든 OS에서 동일한 것은 아닙니다

공통인 것은 Bytecode와 JVM의 동작 규격입니다. 실제 JVM 프로그램은 Windows, Linux, macOS와 CPU 종류에 맞게 구현됩니다. OS별 JVM이 환경 차이를 맡기 때문에 같은 Bytecode를 여러 OS에서 실행하기 쉬운 것입니다.

---

# 참고 자료

- [Java Virtual Machine Specification](https://docs.oracle.com/javase/specs/jvms/se21/html/)
- [Java Language Specification](https://docs.oracle.com/javase/specs/jls/se21/html/)
