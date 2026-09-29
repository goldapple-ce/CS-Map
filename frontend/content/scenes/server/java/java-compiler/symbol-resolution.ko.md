# 한눈에 보기

Symbol Resolution은 Compiler가 `코드에서 사용한 이름을 그 이름이 선언된 곳과 연결하는 과정`입니다.

---

# 이름을 찾으면

```java
int count = 10;
int result = count + 1;
```

```text
아래에서 사용한 count → 위에서 선언한 int count
```

이름이 선언과 연결되어야 Compiler는 count가 int라는 사실을 알 수 있습니다. 이 정보는 다음 Type Check에서 사용합니다.

---

# 이름을 찾지 못하면

```java
int result = value + 1;
```

```text
사용한 value → 찾을 선언 없음
cannot find symbol
```

Symbol Resolution은 이름의 대상을 찾고, Type Check는 찾은 대상을 그 방식으로 사용해도 되는지 검사합니다.

---

# 참고 자료

- [JLS 6 — Names](https://docs.oracle.com/javase/specs/jls/se21/html/jls-6.html)
- [JLS 15.12 — Method Invocation Expressions](https://docs.oracle.com/javase/specs/jls/se21/html/jls-15.html#jls-15.12)
