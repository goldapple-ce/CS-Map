# 한눈에 보기

Desugar는 Java가 편의를 위해 제공하는 문법을 Bytecode Generation이 다루기 쉬운 더 기본적인 Compiler 내부 구조로 낮추는 과정입니다.

예를 들어 Enhanced `for`는 반복 대상에 따라 서로 다른 기본 구조로 변환될 수 있습니다.

- Array를 순회하면 Index를 사용하는 반복 구조가 될 수 있습니다.
- `Iterable`을 순회하면 Iterator를 사용하는 반복 구조가 될 수 있습니다.

```java
for (String name : names) {
    System.out.println(name);
}
```

Compiler 내부에서는 먼저 다음과 같은 Enhanced `for` Tree로 표현할 수 있습니다.

```text
EnhancedForLoop
├─ Variable: String name
├─ Expression: names
└─ Body
   └─ println(name)
```

`names`가 `Iterable`인 경우를 개념적으로 낮추면 다음처럼 더 기본적인 반복 구조로 이해할 수 있습니다.

```text
IteratorLoop
├─ iterator = names.iterator()
└─ while iterator.hasNext()
   ├─ name = iterator.next()
   └─ println(name)
```

따라서 모든 Enhanced `for`가 언제나 Iterator 형태로 바뀐다고 단정하면 안 됩니다. 구체적인 내부 Tree와 변환 순서는 Compiler 구현에 따라 달라질 수 있습니다.

Desugar는 개발자의 Source File을 다시 작성하는 과정이 아니라 Compiler 내부 표현을 변환하는 과정입니다.

---

# 참고 자료

- [JLS 14.14.2 — The enhanced for Statement](https://docs.oracle.com/javase/specs/jls/se21/html/jls-14.html#jls-14.14.2)
- [Compiler Tree API — EnhancedForLoopTree](https://docs.oracle.com/en/java/javase/21/docs/api/jdk.compiler/com/sun/source/tree/EnhancedForLoopTree.html)
