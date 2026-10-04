# 한눈에 보기

JIT(Just-In-Time) Compiler는 Application 실행 중 `자주 실행되는 Method나 Code 구간을 현재 CPU가 직접 실행할 수 있는 기계어로 Compile`합니다.  
한 번 Compile된 기계어를 재사용하면 같은 Bytecode를 Interpreter가 계속 해석하는 비용을 줄일 수 있습니다.

JIT를 이해하면 Java Application의 Warm-up, 실행 초반과 이후의 성능 차이, Benchmark 결과가 달라지는 이유를 설명할 수 있습니다.

---

# JIT Compiler란

Java Source Code는 먼저 `javac`에 의해 Bytecode로 Compile됩니다.  
Application이 실행되면 JVM은 이 Bytecode를 Interpreter로 실행할 수 있습니다.

하지만 같은 Code가 반복해서 실행된다면 Interpreter가 매번 같은 Bytecode를 해석하는 비용이 계속 발생합니다.  
JIT Compiler는 이런 Code를 찾아 Native Machine Code로 Compile하고 이후 실행에서 재사용합니다.

예를 들어 다음 Method가 매우 자주 호출된다고 가정합니다.

```java
public int add(int a, int b) {
    return a + b;
}
```

처음에는 Interpreter가 Bytecode를 실행할 수 있지만, 반복 실행되면서 JVM이 이 Method를 `자주 실행되는 Code라고 판단하면 JIT Compiler가 기계어로 Compile`할 수 있습니다.

---

# Hot Code

JIT Compiler가 모든 Code를 바로 Compile하는 것은 아닙니다.  
JVM은 Application을 실행하면서 어떤 Method와 Code 구간이 자주 실행되는지 관찰합니다.

반복적으로 실행되는 Code를 일반적으로 `Hot Code`라고 부릅니다.  
Hot Code가 일정 기준을 만족하면 JIT Compile 대상이 될 수 있습니다.

Hot Code는 Method 전체일 수도 있고 반복문처럼 특정 Code 구간일 수도 있습니다.

```java
for (int i = 0; i < 1_000_000; i++) {
    calculate(i);
}
```

이처럼 반복적으로 실행되는 부분은 JIT 최적화의 대상이 될 가능성이 높습니다.

---

# 왜 모든 Code를 처음부터 Compile하지 않을까

Application에 존재하는 모든 Method가 실제로 자주 사용되는 것은 아닙니다.  
한 번만 실행되는 Code나 아예 실행되지 않는 Code도 존재합니다.

이런 Code까지 Application 시작 시 모두 기계어로 Compile하면 Compile 시간과 Memory가 낭비될 수 있습니다.

또한 JIT Compiler는 실제 Runtime 정보를 이용할 수 있다는 장점이 있습니다.  
어떤 Type이 실제로 들어오는지, 어떤 Branch가 자주 선택되는지 같은 정보를 실행 중에 수집한 뒤 그 정보를 기반으로 최적화할 수 있습니다.

따라서 JVM은 실제로 자주 사용하는 Code에 Compile 비용을 집중할 수 있습니다.

---

# Runtime 최적화

JIT Compiler는 단순히 Bytecode를 기계어로 바꾸는 것만 하는 것이 아니라 Runtime 정보를 이용해 다양한 최적화를 적용할 수 있습니다.

대표적으로 다음과 같은 최적화가 있습니다.

- `Method Inlining`: 자주 호출되는 작은 Method의 내용을 호출 지점에 직접 넣어 Method 호출 비용을 줄일 수 있습니다.
- `Dead Code Elimination`: 실제로 실행될 필요가 없는 Code를 제거할 수 있습니다.
- `Loop Optimization`: 반복문을 더 효율적으로 실행할 수 있도록 최적화할 수 있습니다.
- `Escape Analysis`: 객체가 Method나 Thread 밖으로 빠져나가는지 분석해 객체 할당이나 Lock 비용을 줄일 수 있습니다.

예를 들어 다음과 같은 Method가 있다고 가정합니다.

```java
public int doubleValue(int value) {
    return value * 2;
}
```

이 Method가 매우 자주 호출된다면 JIT Compiler가 Method 호출 자체를 없애고 호출 지점에 연산을 직접 포함시키는 식으로 최적화할 수 있습니다.

---

# Warm-up

JIT Compiler가 최적화하기 위해서는 Application의 실제 실행 정보를 어느 정도 수집해야 합니다.  
따라서 Application 시작 직후에는 아직 충분한 Runtime 정보가 없고 많은 Code가 Interpreter로 실행되거나 낮은 수준의 Compile 상태에 있을 수 있습니다.

Application이 일정 시간 실행되면 자주 실행되는 Code가 발견되고 JIT Compile과 최적화가 진행됩니다.  
이 때문에 Java Application은 시작 직후와 충분히 실행된 이후의 성능이 다를 수 있습니다.

이 과정을 흔히 `Warm-up`이라고 설명합니다.

---

# 성능 Test와 JIT

JIT 때문에 Java 성능 Test에서는 첫 실행 결과만 보고 성능을 판단하면 잘못된 결론을 내릴 수 있습니다.

예를 들어 같은 Method를 반복 실행하더라도 초반에는 Interpreter나 덜 최적화된 Code가 실행되고, 이후에는 JIT Compile된 기계어가 실행될 수 있습니다.  
따라서 측정 구간에 JIT Compile 과정이 포함됐는지에 따라 결과가 달라질 수 있습니다.

성능 Test에서는 실제 측정 전에 일정 시간 Application을 실행해 Warm-up을 수행하고, 측정 구간과 준비 구간을 분리하는 것이 중요합니다.

---

# Tiered Compilation

HotSpot JVM은 Code를 한 번에 최고 수준으로 최적화하는 대신 여러 단계의 Compile을 사용할 수 있습니다.  
이를 `Tiered Compilation`이라고 합니다.

실행 초반에는 Compile 속도가 빠른 방식으로 Code를 빠르게 기계어로 만들고, 더 많은 Runtime 정보가 쌓이면 자주 실행되는 Code를 더 높은 수준으로 다시 최적화할 수 있습니다.

이 방식은 Application 시작 성능과 장기 실행 성능 사이의 균형을 맞추기 위한 것입니다.

---

# Deoptimization

JIT Compiler는 Runtime 정보를 바탕으로 현재 상황에 맞는 최적화를 적용할 수 있습니다.  
하지만 최적화할 때 사용한 가정이 이후 Runtime에서 더 이상 맞지 않을 수도 있습니다.

이 경우 JVM은 기존 최적화를 계속 사용하는 대신 최적화된 Code를 포기하고 이전 실행 방식으로 돌아갈 수 있습니다. 이를 `Deoptimization`이라고 합니다.

예를 들어 특정 호출 지점에서 항상 하나의 Type만 들어온다고 판단해 최적화했는데 이후 새로운 Type이 들어오면 기존 가정이 깨질 수 있습니다.

JVM은 이런 상황에서도 Java Code의 의미가 바뀌지 않도록 최적화를 되돌리고 새로운 Runtime 정보를 다시 수집할 수 있습니다.

---

# JIT의 비용

JIT Compiler도 공짜로 동작하는 것은 아닙니다. Code를 분석하고 Compile하는 과정에서 CPU와 Memory를 사용합니다.

따라서 Application 시작 직후에는 실제 Business Logic뿐 아니라 JIT Compile 작업도 함께 수행될 수 있습니다.  
짧게 실행되고 종료되는 Application에서는 JIT 최적화로 얻는 이점보다 Compile 비용이 상대적으로 크게 느껴질 수도 있습니다.

반대로 오래 실행되는 Server Application에서는 한 번의 Compile 비용을 지불한 뒤 최적화된 Code를 반복해서 실행할 수 있기 때문에 JIT의 효과를 크게 얻을 수 있습니다.

---

# 참고 자료

- [Oracle Java — Java HotSpot Virtual Machine Performance Enhancements](https://docs.oracle.com/en/java/javase/21/vm/java-hotspot-virtual-machine-performance-enhancements.html)
- [Oracle Java — Java Command Options](https://docs.oracle.com/en/java/javase/21/docs/specs/man/java.html)
- [OpenJDK — JMH](https://openjdk.org/projects/code-tools/jmh/)
