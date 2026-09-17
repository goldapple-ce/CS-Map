# 한눈에 보기

JIT(Just-In-Time) Compiler는 Application 실행 중 자주 실행되는 method나 Code 구간을 현재 CPU가 실행할 수 있는 기계어로 컴파일합니다.

한 번 생성한 기계어를 다시 실행하면 같은 Bytecode를 계속 해석하는 비용을 줄일 수 있습니다.

---

# Warm-up

JVM이 실행 정보를 모으고 Code를 컴파일·최적화하는 데는 시간이 필요합니다. 따라서 Java Application은 시작 직후와 충분히 실행된 이후의 성능이 다를 수 있습니다.

성능 test에서는 준비 없이 첫 실행 시간만 측정하지 않고 warm-up 여부와 실제 운영 환경의 실행 패턴을 함께 고려해야 합니다.

JIT 최적화에 사용한 가정이 더 이상 맞지 않으면 JVM이 최적화를 되돌리고 다시 실행 정보를 모을 수도 있습니다.

---

# Loop와 작은 문법 차이의 성능

반복문은 같은 Code를 여러 번 실행하므로 JIT Compiler의 최적화 대상이 되기 쉽습니다. 하지만 `for`와 `while` 중 하나가 항상 빠르거나 `i++`와 `++i` 중 하나가 항상 빠르다고 일반화할 수는 없습니다.

Compiler가 만든 Bytecode와 JIT가 최적화한 기계어, 실제 입력과 실행 환경에 따라 결과가 달라집니다. JVM 성능을 비교할 때는 단순한 실행 시간 한 번보다 Warm-up과 최적화 영향을 고려하는 JMH 같은 Benchmark 도구를 사용하는 편이 안전합니다.

`static`도 소유 방식의 의미가 먼저이며 성능 최적화 Keyword가 아닙니다. Static 여부만으로 Runtime 성능을 판단하지 않고 실제 병목을 측정해야 합니다.

Collection 반복도 같은 기준으로 봐야 합니다. `list.size()`를 반복 조건에서 호출하는 방식, For-each와 Index 기반 `for` 중 어느 하나가 항상 빠르다고 일반화할 수 없습니다. `List` 구현이 Array 기반인지 연결 구조인지, Iterator를 사용하는지와 JIT가 어떤 최적화를 적용하는지에 따라 결과가 달라집니다.

Array의 For-each는 Index 기반 반복으로 Lowering될 수 있고, `Iterable`의 For-each는 Iterator를 사용하는 형태로 Lowering될 수 있습니다. 문법이 같아 보여도 대상 Type에 따라 실행 구조가 다를 수 있습니다.

`size()`를 미리 변수에 저장하면 호출 횟수는 줄어들 수 있지만, Loop 중 Collection 크기가 바뀌어야 하는 Code라면 의미까지 달라질 수 있습니다. 먼저 자료구조와 의도에 맞는 반복 방식을 선택하고, 성능이 중요할 때 JMH로 실제 환경을 측정합니다.

---

# 개발자가 개입하는 지점

개발자가 일반적인 Java Code에서 JIT Compiler를 직접 실행하지는 않습니다. JVM이 실제 실행 상태를 관찰해 최적화 대상을 판단합니다.

필요하면 JIT compilation log나 profiler를 이용해 어떤 method가 많이 실행되고 어디에 시간이 사용되는지 확인할 수 있습니다.

---

# 참고 자료

- [Oracle Java — Java HotSpot Virtual Machine Performance Enhancements](https://docs.oracle.com/en/java/javase/21/vm/java-hotspot-virtual-machine-performance-enhancements.html)
- [Oracle Java — Java Command Options](https://docs.oracle.com/en/java/javase/21/docs/specs/man/java.html)
- [OpenJDK — JMH](https://openjdk.org/projects/code-tools/jmh/)
