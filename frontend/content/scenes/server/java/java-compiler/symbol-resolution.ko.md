# 한눈에 보기

Symbol Resolution은 Source에 사용된 이름을 실제 선언과 연결하는 과정입니다.

```java
int a = 1;
int result = a + 10;
```

두 번째 줄의 `a`를 첫 번째 줄에서 선언한 Local Variable과 연결해야 그 Type과 사용 범위를 알 수 있습니다.

```text
사용된 a → 선언된 int a
```

반면 선언하지 않은 이름은 연결할 대상을 찾을 수 없습니다.

```java
int result = x + 10;
```

```text
사용된 x → ?
cannot find symbol
```

이처럼 선언이 없거나 현재 Scope에서 접근할 수 없는 이름이라면 Symbol Resolution이 실패하고 Compile Error가 발생합니다.

이 과정은 같은 단순 이름을 가진 선언 중 Package, Import, Scope와 Overload 후보 등을 고려해 무엇을 가리키는지 판단하는 Semantic Analysis의 일부입니다.

---

# 참고 자료

- [JLS 6 — Names](https://docs.oracle.com/javase/specs/jls/se21/html/jls-6.html)
- [JLS 15.12 — Method Invocation Expressions](https://docs.oracle.com/javase/specs/jls/se21/html/jls-15.html#jls-15.12)
