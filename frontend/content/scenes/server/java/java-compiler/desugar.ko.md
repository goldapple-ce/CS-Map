# 한눈에 보기

Desugar는 사람이 편하게 쓴 `문법을` Compiler가 `더 기본적인 형태로 풀어내는 과정`입니다.

편하게 쓰도록 제공된 문법을 Syntactic Sugar라고 하고, 이를 풀어내는 작업을 Desugar라고 합니다.

예를 들어 다음 Enhanced for는 반복 코드를 짧게 작성하게 해 줍니다.

```java
for (String name : names) {
    System.out.println(name);
}
```

names가 Iterable이라면 Compiler 내부에서는 개념적으로 다음과 같은 Iterator와 while 형태로 풀어낼 수 있습니다.

```java
Iterator<String> iterator = names.iterator();
while (iterator.hasNext()) {
    String name = iterator.next();
    System.out.println(name);
}
```

Array를 Enhanced for로 순회할 때는 Iterator가 아니라 Index를 사용하는 형태로 풀릴 수 있습니다.

Desugar는 개발자가 저장한 Source File을 고쳐 쓰지 않습니다. Compiler 내부 표현을 바꾸며, 다음 Bytecode Generation 단계가 그 결과를 사용합니다. 이런 변환을 `Lowering`이라고도 합니다.

---

# 참고 자료

- [JLS 14.14.2 — The enhanced for Statement](https://docs.oracle.com/javase/specs/jls/se21/html/jls-14.html#jls-14.14.2)
- [Compiler Tree API — EnhancedForLoopTree](https://docs.oracle.com/en/java/javase/21/docs/api/jdk.compiler/com/sun/source/tree/EnhancedForLoopTree.html)
