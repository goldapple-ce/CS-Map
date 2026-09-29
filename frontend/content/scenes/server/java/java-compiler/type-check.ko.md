# 한눈에 보기

Type Check는 `값과 변수의 Type을 확인`해 연산하거나 대입해도 되는지 검사하는 과정입니다.

---

# Type이 맞으면

```java
int a = 10;
int b = 20;
int result = a + b;
```

```text
a: int + b: int → 결과: int → result: int에 대입 가능
```

---

# Type이 맞지 않으면

```java
int count = "twenty";
```

```text
String 값 → int 변수에 대입 불가 → Compile Error
```

먼저 Symbol Resolution이 이름을 선언과 연결해 Type을 알아냅니다. 그다음 Type Check가 그 값을 연산하거나 대입해도 되는지 검사합니다.

Type Check가 모든 Runtime 오류를 막는 것은 아닙니다.

---

# 참고 자료

- [JLS 4 — Types, Values, and Variables](https://docs.oracle.com/javase/specs/jls/se21/html/jls-4.html)
- [JLS 5 — Conversions and Contexts](https://docs.oracle.com/javase/specs/jls/se21/html/jls-5.html)
