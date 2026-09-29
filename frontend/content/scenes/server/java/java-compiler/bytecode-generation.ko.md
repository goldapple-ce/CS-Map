# 한눈에 보기

Bytecode Generation은 Compiler가 이해한 `코드 구조를 JVM이 실행할 명령 순서로 바꾸는 단계`입니다.

AST는 Compiler가 코드를 분석할 때 쓰는 구조이므로 JVM이 직접 실행할 수 없습니다. JVM은 Bytecode Instruction을 실행하기 때문에 AST의 의미를 명령 순서로 번역해야 합니다.

다음 대입문을 예로 살펴봅시다.

```java
int result = a + 10;
```

오른쪽 Expression의 AST를 단순화하면 다음과 같습니다.

```text
   +
  / \
 a  10
```

Compiler가 만들어야 할 흐름을 먼저 쉬운 말로 나타내면 다음과 같습니다.

```text
a 값 읽기 → 10 준비 → 더하기 → result에 저장
```

JVM은 연산할 값을 Operand Stack에 올려 두고 계산합니다. 이 예제에서 Stack의 변화만 보면 다음과 같습니다.

```text
a 읽기      [a]
10 준비     [a, 10]
더하기      [a + 10]
result 저장 []
```

이를 실제에 가까운 Bytecode Instruction으로 나타내면 다음과 같습니다.

```text
iload_1
bipush 10
iadd
istore_2
```

`iload_1`은 a의 정수 값을 Operand Stack에 올리고, `bipush 10`은 정수 10을 올립니다. `iadd`는 두 값을 꺼내 더한 결과를 다시 올리고, `istore_2`는 그 결과를 result가 사용하는 Local Variable Slot에 저장합니다. Slot 번호 1과 2는 이 설명을 위한 예시이며 실제 번호는 주변 코드에 따라 달라질 수 있습니다.

생성된 Bytecode는 Constant Pool 같은 정보와 함께 Class File에 저장됩니다. Bytecode는 Class File 전체가 아니라 그 안에 들어가는 실행 명령입니다. 실제로 생성된 명령은 `javap -c`로 확인할 수 있습니다.

---

# 참고 자료

- [JVMS 4 — The class File Format](https://docs.oracle.com/javase/specs/jvms/se21/html/jvms-4.html)
- [JVMS 6 — The Java Virtual Machine Instruction Set](https://docs.oracle.com/javase/specs/jvms/se21/html/jvms-6.html)
- [Oracle JDK Tools — javap](https://docs.oracle.com/en/java/javase/21/docs/specs/man/javap.html)
