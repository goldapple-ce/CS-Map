# 한눈에 보기

Runtime Data Area에는 Thread마다 따로 가지는 실행 상태와 모든 Thread가 함께 사용하는 데이터가 있습니다. PC Register, JVM Stack과 Native Method Stack은 Thread마다 고유하고, Method Area와 Heap은 모든 Thread가 공유합니다.

---

# Thread별 영역

각 Thread는 현재 실행 중인 명령 위치와 Method 호출 상태가 다릅니다. 그래서 PC Register, JVM Stack과 Native Method Stack을 Thread마다 따로 가지며, 서로 다른 코드를 각자의 실행 상태로 진행할 수 있습니다.

Thread가 늘어나면 Thread별 Stack 같은 영역도 함께 필요하므로 memory 비용이 증가합니다.

하지만 Stack과 local variable이 Thread별이라는 사실이 객체까지 자동으로 분리하거나 Thread-safe하게 만들지는 않습니다. 서로 다른 Stack의 Reference가 같은 Heap 객체를 가리키면 그 객체는 여러 Thread가 공유합니다.

---

# 공유 상태에서 생기는 문제

여러 Thread가 같은 변경 가능한 객체를 읽고 쓰면 실행 순서에 따라 결과가 달라질 수 있습니다. 이를 Race Condition이라고 합니다.

예를 들어 count++은 하나의 동작처럼 보이지만 실제로는 값을 읽고, 1을 더하고, 다시 쓰는 과정입니다. 두 Thread가 같은 값을 읽은 뒤 각각 계산하고 쓰면 한쪽 변경이 사라질 수 있습니다.

---

# CPU Cache와 Java의 기준

CPU Core는 성능을 위해 Cache와 Buffer를 사용합니다. 그래서 한 Core에서 바꾼 값이 다른 Core에서 곧바로 같은 모습으로 관찰되지 않는 상황을 떠올릴 수 있습니다.

CPU Cache는 JVM Runtime Data Area가 아닙니다. 또한 동시성 문제를 CPU Cache 하나만으로 설명할 수도 없습니다. Compiler와 CPU의 명령 재배치 같은 요소도 값이 관찰되는 순서에 영향을 줄 수 있습니다.

Java Code에서 실제로 따라야 하는 기준은 JMM(Java Memory Model)입니다. JMM은 어떤 동작이 다른 동작보다 먼저 일어난 것으로 보장되는지, 한 Thread의 쓰기를 다른 Thread가 언제 볼 수 있는지를 Java 규칙으로 정의합니다.

---

# volatile이 보장하는 것

volatile Field에 쓴 값은 이후 그 Field를 읽는 다른 Thread에서 볼 수 있도록 관계를 만듭니다. 이 관계는 Visibility와 Ordering을 제공합니다.

하지만 volatile은 여러 단계로 이루어진 작업 전체를 하나의 작업으로 만들지 않습니다. 따라서 volatile count에 count++을 수행해도 읽기, 계산, 쓰기 사이에 다른 Thread가 끼어들 수 있습니다.

복합 연산을 한 번에 보호해야 한다면 `synchronized`로 접근을 묶거나 `AtomicInteger` 같은 Atomic Class를 목적에 맞게 사용할 수 있습니다.

---

# 참고 자료

- [JVMS 2.5 — Run-Time Data Areas](https://docs.oracle.com/javase/specs/jvms/se21/html/jvms-2.html#jvms-2.5)
- [JLS 17.4 — Memory Model](https://docs.oracle.com/javase/specs/jls/se21/html/jls-17.html#jls-17.4)
- [JLS 17.4.5 — Happens-before Order](https://docs.oracle.com/javase/specs/jls/se21/html/jls-17.html#jls-17.4.5)
