# 한눈에 보기

Class Loading은 JVM이 실행에 필요한 `.class` Bytecode를 찾아 내부로 불러오고 사용할 수 있는 상태로 준비하는 과정입니다.

Application의 모든 Class를 처음부터 한꺼번에 불러오는 것은 아닙니다. 일반적으로 실행 중 필요한 Class가 처음 사용되는 시점에 불러올 수 있습니다.

---

# 크게 보는 과정

1. `Loading`: Class Loader가 이름에 해당하는 Class Bytecode를 찾고 JVM 내부에 Class를 만듭니다.
2. `Linking`: Bytecode가 올바른지 확인하고 static field를 위한 memory 등을 준비하며 필요한 참조를 연결합니다.
3. `Initialization`: static field의 초기값과 static initializer를 실행합니다.

JVM은 불러온 Class의 구조와 method Bytecode 같은 정보를 Runtime Data Area에 관리하고, Execution Engine은 이 정보를 이용해 method를 실행합니다.

---

# Class Loader

JVM에는 Java의 핵심 Class, platform Class와 Application Class를 서로 다른 범위에서 찾는 Class Loader가 있습니다. 일반적인 Application에서는 상위 Class Loader가 먼저 찾을 기회를 갖는 위임 구조를 사용합니다.

같은 이름의 Class라도 서로 다른 Class Loader가 불러오면 JVM에서는 서로 다른 Class로 취급될 수 있습니다. Application Server, plugin 구조나 library 충돌을 분석할 때 이 특성이 중요해집니다.

---

# 개발자가 개입하는 지점

일반적인 Spring Application에서는 개발자가 Class Loader를 직접 구현하지 않습니다. 대신 build 결과에 필요한 dependency가 포함됐는지와 runtime classpath가 올바른지 관리합니다.

`ClassNotFoundException`, `NoClassDefFoundError`, method가 없다는 오류가 발생하면 dependency version, classpath와 실제로 어떤 Class Loader가 Class를 불러왔는지 확인합니다.

---

# 참고 자료

- [Java Virtual Machine Specification — Loading, Linking, and Initializing](https://docs.oracle.com/javase/specs/jvms/se21/html/jvms-5.html)
- [Java API — ClassLoader](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/ClassLoader.html)
