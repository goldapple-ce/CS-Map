# 한눈에 보기

Native Method Stack은 Java Bytecode가 아닌 native method 실행을 지원하기 위한 Thread별 영역입니다.

Native method는 JVM이 실행하는 일반 Java method와 달리 C나 C++ 같은 언어로 작성된 platform code를 호출할 때 사용될 수 있습니다. JVM 구현이 native method를 지원하는 방식에 따라 실제 Stack 구조는 달라질 수 있습니다.

---

# 언제 등장하는가

Java library 내부에서 OS 기능을 사용하거나 JNI(Java Native Interface)를 통해 native library를 호출할 때 등장할 수 있습니다.

Native code는 OS와 CPU 환경에 맞게 만들어져야 하므로 Java Bytecode만 사용하는 경우보다 플랫폼 독립성이 낮아질 수 있습니다. JVM이 OS 차이를 흡수하더라도 Application이 특정 native library에 직접 의존하면 별도의 환경별 파일과 설정이 필요합니다.

---

# 개발자가 개입하는 지점

일반적인 Spring Application 개발자가 Native Method Stack을 직접 관리하지는 않습니다.

JNI나 native library를 사용한다면 OS와 CPU에 맞는 library 배포, memory 해제, crash와 thread 안정성을 직접 고려해야 합니다. Java Heap 밖에서 발생한 native memory 문제는 일반적인 Heap 분석만으로 찾기 어려울 수 있습니다.

---

# 참고 자료

- [Java Virtual Machine Specification — Native Method Stacks](https://docs.oracle.com/javase/specs/jvms/se21/html/jvms-2.html#jvms-2.5.6)
- [Oracle Java — Java Native Interface Specification](https://docs.oracle.com/en/java/javase/21/docs/specs/jni/)
