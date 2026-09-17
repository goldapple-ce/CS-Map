# 한눈에 보기

Bytecode Generation은 분석과 변환을 마친 Compiler 내부 구조에서 JVM 명령을 생성하는 단계입니다.

```java
int result = a + 10;
```

오른쪽 Expression의 AST를 단순화하면 다음과 같습니다.

```text
   +
  / \
 a  10
```

이 Expression만 설명하기 위한 Bytecode 예시는 다음과 같습니다.

```text
iload_1
bipush 10
iadd
```

`iload_1`은 Local Variable Slot의 정수 값을 읽고, `bipush 10`은 정수 `10`을 준비하며, `iadd`는 두 값을 더합니다. 이 코드는 오른쪽 Expression만 보여 주는 부분 예시이므로 `result`에 저장하는 Instruction은 생략했습니다.

실제 Instruction과 Local Variable Slot 번호는 주변 Code, Compiler와 Version에 따라 달라질 수 있으므로 이 예시를 고정된 출력으로 보면 안 됩니다. 실제 결과는 `javap -c`로 확인할 수 있습니다.

Bytecode는 Class File 전체가 아닙니다. Compiler는 Method Bytecode와 함께 Constant Pool, Class·Field·Method 정보와 Attribute를 Class File 형식으로 기록합니다.

---

# 참고 자료

- [JVMS 4 — The class File Format](https://docs.oracle.com/javase/specs/jvms/se21/html/jvms-4.html)
- [JVMS 6 — The Java Virtual Machine Instruction Set](https://docs.oracle.com/javase/specs/jvms/se21/html/jvms-6.html)
- [Oracle JDK Tools — javap](https://docs.oracle.com/en/java/javase/21/docs/specs/man/javap.html)
