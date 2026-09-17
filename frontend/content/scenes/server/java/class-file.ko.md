# 한눈에 보기

Class File은 Java Compiler의 출력이자 JVM의 입력이 되는 Binary File 형식입니다. 일반적으로 `.class` 확장자를 사용합니다.

Bytecode는 Class File 안에 들어 있는 Method 실행 명령입니다. Class File 전체가 Bytecode만으로 이루어져 있거나 두 용어가 완전히 같은 뜻은 아닙니다.

---

# Class File에 들어 있는 정보

JVM은 Class File에서 Class의 구조와 Method 실행에 필요한 정보를 읽습니다.

- `Constant Pool`: 문자열·숫자 상수와 Class, Field, Method를 가리키는 Symbolic Reference를 담습니다.
- `Class Metadata`: Class 이름, 상위 Class, 구현한 Interface와 접근 Flag 등을 나타냅니다.
- `Field 정보`: Field 이름, Type과 Modifier를 나타냅니다.
- `Method 정보`: Method 이름, Parameter·Return Type과 Modifier를 나타냅니다.
- `Method Bytecode`: 실행 가능한 Method의 `Code` Attribute 안에 JVM 명령으로 저장됩니다.
- `Attribute`: Source 위치, Exception, Annotation 등 Class·Field·Method에 필요한 추가 정보를 표현합니다.

Method에 따라 Bytecode Body가 없을 수도 있고, Compiler가 어떤 Attribute를 기록하는지도 설정과 Compiler에 따라 달라질 수 있습니다.

---

# Bytecode와 플랫폼 독립성

Method Bytecode는 특정 CPU의 기계어가 아니라 JVM Instruction Set을 사용합니다. 같은 Class File을 읽을 수 있는 JVM 구현이 각 OS와 CPU에 맞게 Bytecode를 실행합니다.

이는 모든 Java 프로그램이 환경과 무관하다는 뜻은 아닙니다. 사용하는 Java Version, Library, Native Code와 OS 기능이 다르면 호환 문제가 생길 수 있습니다.

---

# Source 문법의 Lowering

Class File이 Java Source 문법을 그대로 보존하는 것은 아닙니다. Compiler는 Source의 의미를 여러 Bytecode 명령과 분기 구조로 낮춰 표현할 수 있습니다. 이를 Lowering이라고 합니다.

예를 들어 String을 사용하는 `switch`에 대응하는 전용 JVM 명령이 반드시 필요한 것은 아닙니다. Compiler가 비교와 분기의 조합으로 변환할 수 있으며, 구체적인 Bytecode 형태는 Compiler와 Version에 따라 달라질 수 있습니다.

`javap -c`를 사용하면 Method Bytecode를, `javap -v`를 사용하면 Constant Pool과 Method 정보 등 Class File의 더 자세한 구조를 확인할 수 있습니다.

---

# 참고 자료

- [JVMS 4 — The class File Format](https://docs.oracle.com/javase/specs/jvms/se21/html/jvms-4.html)
- [JVMS 6 — The Java Virtual Machine Instruction Set](https://docs.oracle.com/javase/specs/jvms/se21/html/jvms-6.html)
- [Oracle JDK Tools — javap](https://docs.oracle.com/en/java/javase/21/docs/specs/man/javap.html)
