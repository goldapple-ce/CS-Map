# 한눈에 보기

PC Register는 각 Thread가 현재 실행하고 있는 JVM 명령의 위치를 추적하기 위한 영역입니다. `PC`는 Program Counter를 뜻합니다.

여러 Thread가 번갈아 실행되더라도 각 Thread가 자신의 실행 위치를 따로 가지고 있어야 다시 실행 기회를 얻었을 때 이어서 처리할 수 있습니다.

Native method를 실행 중일 때 PC Register의 값은 JVM 명령 위치를 나타내지 않을 수 있습니다.

---

# 개발자가 개입하는 지점

개발자가 Java Code에서 PC Register 값을 직접 읽거나 변경하는 일반적인 방법은 없습니다.

직접 설정할 수 있는 영역은 아니지만 Thread dump와 stack trace에 각 Thread의 현재 실행 위치가 나타나는 기반을 이해하는 데 도움이 됩니다.

---

# 참고 자료

- [Java Virtual Machine Specification — The pc Register](https://docs.oracle.com/javase/specs/jvms/se21/html/jvms-2.html#jvms-2.5.1)
