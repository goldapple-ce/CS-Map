# 한눈에 보기

Interpreter는 Java Bytecode를 명령 단위로 읽고 바로 실행하는 Execution Engine의 구성 요소입니다.  
Interpreter를 이해하면 Java Application이 처음 실행될 때 Bytecode가 어떻게 처리되는지, 그리고 왜 JIT Compiler가 필요한지 이해할 수 있습니다.

---

# Interpreter란

Java Source Code는 `javac`에 의해 Bytecode로 Compile됩니다.  
JVM은 이 Bytecode를 그대로 CPU에서 실행할 수 없기 때문에 실제 실행 과정이 필요합니다.

Interpreter는 Bytecode 명령을 하나씩 읽고 해당 명령의 의미에 따라 실행합니다.

예를 들어 다음 코드가 있다고 가정합니다.

```java
int a = 1;
int b = 2;
int c = a + b;
```

Compile된 Bytecode에는 다음과 같은 명령이 포함될 수 있습니다.

```text
iconst_1
istore_1
iconst_2
istore_2
iload_1
iload_2
iadd
istore_3
```

Interpreter는 이러한 Bytecode Instruction을 순서대로 읽으며 실행합니다.

---

# 왜 Interpreter가 필요할까

Java Bytecode는 특정 CPU의 기계어가 아닙니다.  
같은 `.class` 파일을 서로 다른 OS와 CPU 환경에서 실행할 수 있는 이유도 Bytecode가 특정 Hardware에 종속되지 않기 때문입니다.

JVM은 현재 실행 중인 환경에 맞게 Bytecode를 실제로 실행해야 합니다.  
Interpreter는 별도의 사전 기계어 Compile 없이 Bytecode를 바로 실행할 수 있기 때문에 Application이 실행되자마자 Code를 수행할 수 있습니다.

---

# Interpreter의 장점

Interpreter는 Bytecode를 미리 전부 기계어로 Compile할 필요가 없습니다. 따라서 처음 실행되는 Method도 즉시 실행할 수 있습니다.

또한 Application의 모든 Code가 자주 실행되는 것은 아니기 때문에 한 번만 실행되거나 아예 실행되지 않는 Code까지 미리 Compile하는 비용을 줄일 수 있습니다.

Application이 실행되면 Interpreter가 Code를 실행하고, JVM은 그 과정에서 어떤 Method와 Code 구간이 자주 실행되는지 Runtime 정보를 수집할 수 있습니다.

---

# Interpreter의 단점

같은 Bytecode가 반복해서 실행되면 Interpreter는 같은 명령을 계속 해석해야 합니다.  
한두 번 실행되는 Code에서는 큰 문제가 아니지만 매우 자주 실행되는 Code에서는 반복적인 해석 비용이 누적될 수 있습니다.

예를 들어 다음 Method가 수백만 번 호출된다고 가정합니다.

```java
public int add(int a, int b) {
    return a + b;
}
```

매번 같은 Bytecode를 해석하는 것보다 한 번 기계어로 Compile한 뒤 재사용하는 편이 더 효율적일 수 있습니다.  
이 문제를 해결하기 위해 JVM은 `JIT Compiler`를 함께 사용합니다.

---

# Interpreter와 JIT Compiler

Java Application은 Interpreter와 JIT Compiler 중 하나만 사용하는 것이 아니라 둘을 함께 사용할 수 있습니다.  
처음 실행되는 Code는 Interpreter가 바로 실행합니다.

JVM은 실행 과정에서 Method 호출 횟수, 분기 결과, Type 정보 같은 Runtime 데이터를 수집할 수 있습니다.  
그중 반복적으로 실행되는 Code가 발견되면 JIT Compiler가 해당 Code를 현재 CPU가 직접 실행할 수 있는 기계어로 Compile합니다.

이후 같은 Code를 실행할 때는 매번 Bytecode를 해석하지 않고 Compile된 기계어를 사용할 수 있습니다.

- `Interpreter`: 바로 실행할 수 있습니다.
- `JIT Compiler`: 반복 실행되는 Code를 기계어로 Compile해 재사용할 수 있습니다.

---

# 왜 처음부터 전부 Compile하지 않을까

Application의 모든 Code가 자주 실행되는 것은 아닙니다. 한 번도 호출되지 않는 Method도 있고 Application 시작 과정에서 한 번만 실행되는 Code도 있습니다.

이런 Code까지 처음부터 모두 기계어로 Compile하면 Compile 시간과 Memory가 사용됩니다.  
또한 JVM은 실제 Runtime 정보를 이용해 최적화할 수 있기 때문에 실행 패턴을 확인한 뒤 필요한 Code를 Compile하는 것이 유리할 수 있습니다.

따라서 JVM은 Interpreter로 빠르게 실행을 시작하고 자주 실행되는 Code를 JIT Compiler가 Compile하는 방식을 사용할 수 있습니다.

---

# 성능 Test와 Interpreter

Interpreter와 JIT Compiler의 존재 때문에 Java Application은 실행 직후와 충분히 실행된 이후의 성능이 다를 수 있습니다.  
Application 시작 직후에는 아직 많은 Code가 Interpreter로 실행되고 있거나 JIT 최적화가 충분히 적용되지 않았을 수 있습니다.

반복 실행하면서 Runtime 정보가 쌓이고 JIT Compile이 진행되면 동일한 Code가 더 빠르게 실행될 수 있습니다. 따라서 Java 성능 Test에서는 시작 직후의 결과만 측정하기보다 `Warm-up`을 고려해야 합니다.

---

# 참고 자료

- [Oracle Java — Java HotSpot Virtual Machine Performance Enhancements](https://docs.oracle.com/en/java/javase/21/vm/java-hotspot-virtual-machine-performance-enhancements.html)
