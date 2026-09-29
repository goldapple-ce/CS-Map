# 한눈에 보기

JIT(Just-In-Time) Compiler는 Application 실행 중 자주 실행되는 Code 구간을 현재 CPU가 실행할 수 있는 기계어로 컴파일합니다.

한 번 생성한 기계어를 다시 실행하면 같은 Bytecode를 `Interpreter가 계속 해석하는 비용을 줄일 수 있습니다.`

---

# Hot Code

JIT Compiler는 모든 Bytecode를 처음부터 기계어로 변환하지 않습니다.

JVM은 Application을 실행하면서 Method 호출 횟수나 반복문 실행 횟수 등의 정보를 수집하고, 자주 실행되는 Code를 `Hot Code`로 판단합니다.

```text
Bytecode 실행 → 실행 정보 수집 → Hot Code 판단 → JIT Compile → Native Code 실행
```

---

# Warm-up

JVM이 실행 정보를 모으고 Code를 컴파일·최적화하는 데는 시간이 필요합니다. 따라서 Java Application은 시작 직후와 충분히 실행된 이후의 성능이 다를 수 있습니다.

---

# Optimization

JIT Compiler는 Bytecode를 단순히 기계어로 변환하는 것뿐만 아니라, 실행 중 수집한 정보를 이용해 Code를 최적화합니다.

대표적으로 Method 호출을 줄이는 `Inlining`, `불필요한 Code 제거`, `반복문 최적화` 등이 있습니다.

JIT가 실제 실행 정보를 이용할 수 있기 때문에 javac 단계에서는 하기 어려운 최적화도 수행할 수 있습니다.

---

# Deoptimization

JIT는 실행 정보를 기반으로 특정 상황이 계속될 것이라고 가정하고 Code를 최적화할 수 있습니다.

하지만 실행 중 그 가정이 더 이상 맞지 않으면 JVM은 최적화된 Code를 되돌리고 다시 실행 정보를 수집할 수 있습니다. 이를 Deoptimization이라고 합니다.

---

# 참고 자료

- [Oracle Java — Java HotSpot Virtual Machine Performance Enhancements](https://docs.oracle.com/en/java/javase/21/vm/java-hotspot-virtual-machine-performance-enhancements.html)
- [Oracle Java — Java Command Options](https://docs.oracle.com/en/java/javase/21/docs/specs/man/java.html)
- [OpenJDK — JMH](https://openjdk.org/projects/code-tools/jmh/)
