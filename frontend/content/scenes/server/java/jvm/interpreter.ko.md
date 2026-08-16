# 한눈에 보기

Interpreter는 Java Bytecode 명령을 읽어 바로 실행합니다. JIT compilation을 기다리지 않고 Code를 실행할 수 있다는 장점이 있습니다.

다만 같은 Bytecode를 반복해서 실행할 때도 매번 해석하면 비용이 쌓일 수 있습니다. JVM은 실행 상태를 관찰하고 자주 실행되는 Code를 JIT Compiler가 최적화하도록 할 수 있습니다.

---

# 개발자가 개입하는 지점

일반적인 Application 개발자가 Interpreter를 직접 호출하거나 특정 method의 해석 순서를 결정하지는 않습니다.

그럼에도 Interpreter의 역할을 알면 Application 시작 직후와 충분히 실행된 이후의 성능이 달라질 수 있는 이유, JIT warm-up이 필요한 이유를 이해하는 데 도움이 됩니다.

---

# 참고 자료

- [Oracle Java — Java HotSpot Virtual Machine Performance Enhancements](https://docs.oracle.com/en/java/javase/21/vm/java-hotspot-virtual-machine-performance-enhancements.html)
