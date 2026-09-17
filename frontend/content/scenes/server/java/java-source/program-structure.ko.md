# 한눈에 보기

Java 프로그램은 Package 안에 Type을 선언하고, Class의 Method 안에 Statement를 작성하는 구조로 읽을 수 있습니다.

```text
Package → Class → Method → Statement
```

---

# Package와 Class

Package는 관련 Type의 이름 공간을 묶습니다. 같은 단순 Class 이름도 Package가 다르면 서로 다른 Type이 될 수 있습니다.

Class는 Field와 Method를 한 Type으로 정의합니다. Source File에 `public` Top-level Type이 있다면 그 Type 이름과 File 이름이 같아야 합니다. 이 Type은 Class뿐 아니라 Interface, Enum이나 Record일 수도 있으며, File 안에 `public`이 아닌 다른 Top-level Type을 함께 선언할 수도 있습니다.

---

# Method와 Statement

Method는 Parameter를 입력으로 받고 동작을 수행하며, 선언된 Return Type에 맞는 값을 반환할 수 있습니다. Method Body의 Statement는 변수 선언, 대입, 조건 분기, 반복과 Method 호출 같은 실행 단위를 표현합니다.

Expression은 값을 계산하고, Statement는 그 Expression을 실행 흐름 안에서 사용합니다. 예를 들어 `count + 1`은 Expression이고 `count = count + 1;`은 대입 Statement입니다.

---

# Keyword

`class`, `if`, `return`, `new`, `static`처럼 Java 문법에서 의미가 정해진 단어를 Keyword라고 합니다. Keyword는 변수나 Method 이름뿐 아니라 Package 이름을 구성하는 각 Identifier로도 사용할 수 없습니다.

개발자가 만든 이름은 Identifier입니다. Package, Class, Method와 변수 이름이 Identifier에 해당합니다.

`true`, `false`, `null`은 Keyword가 아니라 Literal입니다. 하지만 Java 문법이 정한 Literal이므로 Identifier로 사용할 수는 없습니다.

---

# 참고 자료

- [JLS 3 — Lexical Structure](https://docs.oracle.com/javase/specs/jls/se21/html/jls-3.html)
- [JLS 7 — Packages and Modules](https://docs.oracle.com/javase/specs/jls/se21/html/jls-7.html)
- [JLS 8 — Classes](https://docs.oracle.com/javase/specs/jls/se21/html/jls-8.html)
- [JLS 14 — Blocks and Statements](https://docs.oracle.com/javase/specs/jls/se21/html/jls-14.html)
