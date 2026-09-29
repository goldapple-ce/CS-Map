# 한눈에 보기

Java Compiler는 `.java` Source를 분석하고 오류를 검사한 뒤 JVM이 읽을 수 있는 Class File을 생성합니다. 대표적인 Java Compiler가 JDK의 `javac`입니다.

---

# 왜 알아야 할까?

Java Source는 작성한 문장 그대로 실행되지 않습니다. Compiler가 코드를 작은 단위로 나누고, 문장 구조를 파악하고, 이름과 Type이 올바른지 확인한 뒤 JVM이 읽을 파일로 바꿉니다.

이 흐름을 알면 Compile Error도 막연하게 보이지 않습니다. 괄호나 연산식의 모양이 잘못되었다면 문법 문제이고, 선언하지 않은 이름을 썼다면 이름 연결 문제이며, 맞지 않는 Type을 대입했다면 Type 문제입니다.

다음 한 줄이 Compiler 안에서 어떻게 바뀌는지 따라가 봅시다.

```java
int result = a + b * 10;
```

---

# 처리 흐름

Scene은 입력인 Java Source부터 출력인 Class File까지 여덟 단계를 모두 보여 줍니다.

1. Java Source: 개발자가 작성한 `.java` 파일이 Compiler의 입력이 됩니다.
2. Lexing: Source Text를 Keyword, Identifier, Operator와 Literal 같은 Token으로 구분합니다.
3. Parsing / AST: Token의 문법 관계를 분석해 Tree 구조로 표현합니다.
4. Symbol Resolution: 사용된 이름을 실제 Class, Method와 변수 선언에 연결합니다.
5. Type Check: 대입, 연산과 Method 호출이 Java Type 규칙에 맞는지 검사합니다.
6. Desugar: 편의를 위해 제공된 문법을 더 기본적인 Compiler 내부 구조로 낮춥니다.
7. Bytecode Generation: 검증·변환된 구조에서 Method Bytecode와 Class File 정보를 생성합니다.
8. Class File: 생성된 `.class` 파일이 JVM의 입력이 됩니다.

Symbol Resolution과 Type Check는 문장의 모양을 넘어 코드의 의미가 맞는지 확인합니다. 두 단계를 묶어 Semantic Analysis라고 부릅니다.

이 흐름은 Compiler를 이해하기 쉽게 나눈 대표적인 모델입니다. 실제 Compiler나 Version에 따라 내부 단계의 이름, 묶는 방식과 세부 처리 순서는 달라질 수 있습니다.

---

# 참고 자료

- [Oracle JDK Tools — javac](https://docs.oracle.com/en/java/javase/21/docs/specs/man/javac.html)
- [JLS 7.3 — Compilation Units](https://docs.oracle.com/javase/specs/jls/se21/html/jls-7.html#jls-7.3)
- [Compiler Tree API](https://docs.oracle.com/en/java/javase/21/docs/api/jdk.compiler/com/sun/source/tree/package-summary.html)
