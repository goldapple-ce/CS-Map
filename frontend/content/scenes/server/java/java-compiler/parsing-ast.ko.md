# 한눈에 보기

Lexing이 Token 목록을 만들었다면, 이제 Compiler는 이 조각들이 어떤 문장을 이루는지 파악해야 합니다.

Token을 Java `문법에 맞게 묶는 일을 Parsing`이라고 하고, 그 결과를 나타내는 대표적인 구조가 `AST(Abstract Syntax Tree)`입니다.

앞 단계에서 얻은 Token을 간단히 나타내면 다음과 같습니다.

```text
[int] [result] [=] [a] [+] [b] [*] [10] [;]
```

Parsing은 이 순서를 그대로 나열하는 데서 끝나지 않고, 전체 대입문을 다음과 같은 관계로 묶습니다.

```text
      =
    /   \
result   +
        / \
        a  *
          / \
         b  10
```

이 Tree에서는 곱셈이 덧셈 안에 포함되고, 그 결과가 result에 대입되는 구조를 볼 수 있습니다.

오른쪽 Expression만 떼어 보면 중첩 관계가 더 선명합니다.

```text
  +
 / \
a   *
   / \
  b  10
```

`*`가 `+`보다 안쪽에 놓인 것은 곱셈의 우선순위가 더 높기 때문입니다. 즉 AST는 Token의 `순서뿐 아니라 어떤 연산이 다른 연산 안에 포함되는지도 나타냅니다`.

---

# 왜 Tree일까?

대입문 안에 Expression이 있고, 그 Expression 안에 다시 곱셈이 들어가는 것처럼 문법 요소가 계층적으로 중첩되기 때문입니다.

---

# 왜 Abstract일까?

Source의 모든 문자를 복사하지 않고, Compiler가 분석하는 데 필요한 문법 요소와 관계를 골라 표현하기 때문입니다. 그래서 공백이나 줄바꿈 같은 정보는 보통 핵심 Node가 되지 않습니다.

이렇게 만든 AST는 다음 단계가 a와 b가 무엇을 가리키는지 찾을 수 있는 문장 구조를 제공합니다. AST는 Compiler 안에서 사용하는 분석 표현이며 JVM이 직접 실행하는 결과물은 아닙니다.

---

# 참고 자료

- [JLS 18 — Syntax](https://docs.oracle.com/javase/specs/jls/se21/html/jls-18.html)
- [Compiler Tree API](https://docs.oracle.com/en/java/javase/21/docs/api/jdk.compiler/com/sun/source/tree/package-summary.html)
