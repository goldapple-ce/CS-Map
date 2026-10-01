# 한눈에 보기

JVM(Java Virtual Machine)은 Java Bytecode를 현재 OS와 CPU에서 실행하는 runtime입니다. Spring Application도 하나의 JVM process 안에서 실행됩니다.

JVM 내부는 Class Loading과 Runtime Data Area, Execution Engine으로 크게 나눠 볼 수 있습니다. Runtime Data Area 안에는 Thread별 영역과 공유 영역을 나누어 표시합니다.

- 필요한 Class를 불러옵니다.
- 실행에 필요한 정보와 객체를 memory에 관리합니다.
- Execution Engine이 Bytecode 실행과 실행 중 memory 관리를 담당합니다.

---

# OS 차이를 맡는 실행 계층

Java Compiler는 Source Code를 특정 OS의 기계어가 아니라 공통 Bytecode로 만듭니다. 같은 Bytecode를 Windows용 JVM, Linux용 JVM과 macOS용 JVM이 각 OS와 CPU에 맞게 실행합니다.

공통인 것은 Bytecode 형식과 JVM 규격입니다. JVM 실행 파일 자체는 OS와 CPU에 맞게 구현됩니다. JVM이 Java Application과 OS 사이에서 환경 차이를 맡기 때문에 같은 Bytecode를 여러 환경에서 실행하기 쉬워집니다.

다만 native library, OS 전용 file path나 명령에 의존하는 코드는 다른 OS에서 그대로 동작하지 않을 수 있습니다. JVM이 있다고 해서 모든 Java 코드의 이식성이 자동으로 보장되는 것은 아닙니다.

---

# 구성 요소

- `Class Loading`: 실행에 필요한 Class를 찾아 불러오고 사용할 수 있는 상태로 준비합니다.
- `Method Area`: Class 구조, method Bytecode와 static field 같은 Class 단위 정보를 여러 Thread가 공유합니다.
- `Heap`: 객체와 배열이 생성되며 여러 Thread가 공유하고 Garbage Collector의 정리 대상이 됩니다.
- `PC Register`: 각 Thread가 현재 실행 중인 JVM 명령의 위치를 추적합니다.
- `JVM Stack`: 각 Thread의 Java method 호출 frame을 관리합니다.
- `Native Method Stack`: 각 Thread의 native method 실행을 지원합니다.
- `Execution Engine`: Interpreter로 Bytecode를 실행하고, JIT Compiler로 자주 실행되는 코드를 최적화하며, Garbage Collector로 Heap의 미사용 객체를 정리합니다.

Runtime Data Area의 소유 관계와 공유 상태에서 생기는 동시성 문제는 Area 설명에서 다룹니다. Garbage Collector는 Execution Engine 안에서 동작하지만 정리 대상인 객체는 Runtime Data Area의 Heap에 있습니다.

---

# 개발자가 개입하는 지점

개발자는 JVM 구현을 직접 작성하지는 않지만 Java version과 JVM 배포판을 선택하고 실행 option을 조정합니다. 대표적으로 초기·최대 Heap 크기, Garbage Collector와 진단 log를 설정할 수 있습니다.

성능이나 memory 문제가 생기면 Heap 사용량과 Garbage Collection 기록, thread dump, Class Loading 상태와 JIT 동작을 관찰합니다. 먼저 측정한 뒤 실제 병목과 관련된 설정만 조정하는 것이 중요합니다.

---

# 헷갈리기 쉬운 점

## JVM 하나가 모든 Java Application을 실행하는 것은 아닙니다

일반적으로 Java Application을 시작할 때 별도의 JVM process가 만들어집니다. 같은 Server에서 여러 Java Application을 실행하면 각각 다른 JVM process와 Heap을 가질 수 있습니다.

## JVM 규격과 JVM 구현은 다릅니다

JVM 규격은 Class 파일 형식과 실행에 필요한 공통 동작을 정의합니다. HotSpot 같은 JVM 구현은 그 규격을 실제 OS와 CPU에서 동작하는 Software로 만든 것입니다.

---

# 참고 자료

- [Java Virtual Machine Specification](https://docs.oracle.com/javase/specs/jvms/se21/html/)
- [Java Virtual Machine Specification — Run-Time Data Areas](https://docs.oracle.com/javase/specs/jvms/se21/html/jvms-2.html#jvms-2.5)
- [Oracle Java — Java HotSpot Virtual Machine Performance Enhancements](https://docs.oracle.com/en/java/javase/21/vm/java-hotspot-virtual-machine-performance-enhancements.html)
