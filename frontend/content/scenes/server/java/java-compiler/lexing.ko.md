# 한눈에 보기

Compiler는 Source를 하나의 긴 문자열로 다루지 않습니다. 먼저 `문법에서 의미를 가진 작은 단위`로 나누며, 이 작업을 Lexing이라고 합니다. 나뉜 단위를 `Token`이라고 부릅니다.

```java
int result = a + b * 10;
```

입력으로 받은 한 줄은 다음 Token들로 나뉩니다.

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

int는 Keyword, result와 a는 Identifier, 10은 Integer Literal입니다. =, +, *도 각각 역할이 있는 Token입니다.

이 단계의 결과는 의미 있는 조각의 목록입니다. 아직 b * 10이 a + ...보다 먼저 묶인다는 관계는 만들지 않았습니다. 다음 Parsing 단계가 Token 사이의 문법 관계를 찾습니다.

---

# 참고 자료

- [JLS 3 — Lexical Structure](https://docs.oracle.com/javase/specs/jls/se21/html/jls-3.html)
