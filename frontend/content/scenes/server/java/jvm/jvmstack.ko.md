# 한눈에 보기

JVM Stack은 Java method 호출 상태를 관리하기 위해 Thread마다 따로 생성되는 영역입니다.

method가 호출될 때 frame이 쌓이고 method가 끝나면 해당 frame이 제거됩니다. 각 frame에는 local variable, 중간 계산에 사용하는 Operand Stack과 method 실행을 마치고 돌아가기 위한 정보 등이 들어갑니다.

---

# Method 호출과 Stack Frame

method가 다른 method를 호출하면 새 frame이 기존 frame 위에 쌓입니다. 현재 method가 끝나면 그 frame이 사라지고 호출한 method의 실행으로 돌아갑니다. 이 구조 덕분에 각 method 호출의 local variable과 계산 상태를 서로 구분할 수 있습니다.

---

# 개발자가 개입하는 지점

개발자는 JVM option으로 Thread별 Stack 크기를 조정할 수 있지만, Stack이 크면 같은 memory에서 만들 수 있는 Thread 수가 줄어들 수 있습니다.

무한 재귀나 지나치게 깊은 method 호출로 frame이 계속 쌓이면 `StackOverflowError`가 발생할 수 있습니다. 이때는 Stack 크기만 늘리기보다 호출이 끝나는 조건과 호출 구조를 먼저 확인합니다.

---

# 참고 자료

- [Java Virtual Machine Specification — Java Virtual Machine Stacks](https://docs.oracle.com/javase/specs/jvms/se21/html/jvms-2.html#jvms-2.5.2)
- [Java Virtual Machine Specification — Frames](https://docs.oracle.com/javase/specs/jvms/se21/html/jvms-2.html#jvms-2.6)
