# 한눈에 보기

Lexing은 Source Text를 Compiler가 구분할 수 있는 Token으로 나누는 단계입니다. Compiler는 코드를 하나의 긴 문자열로만 보지 않고, 문법에서 의미를 가진 단위로 읽습니다.

```java
int result = a + b * 10;
```

이 코드는 개념적으로 다음 Token들로 구분됩니다.

```text
KEYWORD(int)
IDENTIFIER(result)
ASSIGN(=)
IDENTIFIER(a)
PLUS(+)
IDENTIFIER(b)
MULTIPLY(*)
INTEGER_LITERAL(10)
SEMICOLON(;)
```

Token은 Keyword, Identifier, Literal, Separator와 Operator처럼 Java 문법이 구분하는 최소 단위입니다. Lexing은 아직 `b * 10`을 먼저 계산해야 한다는 문법 관계까지 Tree로 만들지는 않습니다.

---

# 참고 자료

- [JLS 3 — Lexical Structure](https://docs.oracle.com/javase/specs/jls/se21/html/jls-3.html)
