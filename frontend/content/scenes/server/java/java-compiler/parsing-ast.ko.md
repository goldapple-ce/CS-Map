# 한눈에 보기

Parsing은 Token들이 Java 문법에 맞게 연결되는지 확인하고 중첩 관계를 Tree로 표현합니다. 이때 사용하는 대표적인 구조가 AST(Abstract Syntax Tree)입니다.

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

이 Tree에서는 `b * 10`이 `a + ...` 안에 포함되고, 그 결과가 `result`에 대입되는 구조를 볼 수 있습니다.

오른쪽 Expression만 떼어 보면 중첩 관계가 더 선명합니다.

```text
  +
 / \
a   *
   / \
  b  10
```

`*`가 `+`보다 안쪽에 놓인 것은 곱셈의 우선순위가 더 높기 때문입니다. 즉 AST는 Token의 순서뿐 아니라 어떤 연산이 다른 연산 안에 포함되는지도 나타냅니다.

---

# 왜 Tree일까?

대입문 안에 Expression이 있고, 그 Expression 안에 다시 곱셈이 들어가는 것처럼 문법 요소가 계층적으로 중첩되기 때문입니다.

---

# 왜 Abstract일까?

Source의 모든 문자를 그대로 나열하기보다 Compiler가 분석할 문법 요소와 관계에 집중하기 때문입니다. 일반적인 Compiler AST는 의미에 직접 필요하지 않은 공백과 주석을 핵심 Node로 반드시 보존하지는 않습니다.

다만 AST의 정확한 모양과 Source 위치·주석 정보를 별도로 제공하는 방식은 Compiler 구현과 API에 따라 다릅니다. Java 언어 규격이 하나의 고정된 javac AST 구조를 JVM 입력으로 규정하는 것은 아닙니다.

AST는 Compiler의 분석 표현이며 JVM이 직접 실행하는 최종 결과물이 아닙니다.

---

# 참고 자료

- [JLS 18 — Syntax](https://docs.oracle.com/javase/specs/jls/se21/html/jls-18.html)
- [Compiler Tree API](https://docs.oracle.com/en/java/javase/21/docs/api/jdk.compiler/com/sun/source/tree/package-summary.html)
