# 한눈에 보기

JIT(Just-In-Time) Compiler는 Application 실행 중 자주 실행되는 method나 Code 구간을 현재 CPU가 실행할 수 있는 기계어로 컴파일합니다.

한 번 생성한 기계어를 다시 실행하면 같은 Bytecode를 계속 해석하는 비용을 줄일 수 있습니다.

---

# Warm-up

JVM이 실행 정보를 모으고 Code를 컴파일·최적화하는 데는 시간이 필요합니다. 따라서 Java Application은 시작 직후와 충분히 실행된 이후의 성능이 다를 수 있습니다.

성능 test에서는 준비 없이 첫 실행 시간만 측정하지 않고 warm-up 여부와 실제 운영 환경의 실행 패턴을 함께 고려해야 합니다.

JIT 최적화에 사용한 가정이 더 이상 맞지 않으면 JVM이 최적화를 되돌리고 다시 실행 정보를 모을 수도 있습니다.

---

# 개발자가 개입하는 지점

개발자가 일반적인 Java Code에서 JIT Compiler를 직접 실행하지는 않습니다. JVM이 실제 실행 상태를 관찰해 최적화 대상을 판단합니다.

필요하면 JIT compilation log나 profiler를 이용해 어떤 method가 많이 실행되고 어디에 시간이 사용되는지 확인할 수 있습니다.

---

# 참고 자료

- [Oracle Java — Java HotSpot Virtual Machine Performance Enhancements](https://docs.oracle.com/en/java/javase/21/vm/java-hotspot-virtual-machine-performance-enhancements.html)
- [Oracle Java — Java Command Options](https://docs.oracle.com/en/java/javase/21/docs/specs/man/java.html)
