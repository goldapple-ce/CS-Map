# 한눈에 보기

Type Check는 대입, 연산과 Method 호출이 Java의 Type 규칙에 맞는지 검사합니다. Symbol Resolution으로 이름이 가리키는 선언을 알아야 Type도 판단할 수 있습니다.

```java
int count = "twenty"; // String을 int에 대입할 수 없음
```

Compiler는 오른쪽 Expression의 Type이 `String`이고 왼쪽 변수의 Type이 `int`임을 확인해 Compile Error를 보고합니다.

```text
Symbol Resolution 결과
  대입 대상 count → 선언된 변수 int count → Type: int
  오른쪽 "twenty" → String Literal         → Type: String

Type Check
  String 값을 int 변수에 대입할 수 있는가? → 아니요 → Compile Error
```

Source에 적힌 `count`라는 이름만 보아서는 어떤 선언과 Type을 뜻하는지 확정할 수 없습니다. 먼저 이름을 선언에 연결해야 `count`가 `int`라는 정보를 얻고, 그다음 오른쪽 값과 대입 규칙을 비교할 수 있습니다. 그래서 대표적인 Compiler 흐름에서는 Symbol Resolution 뒤에 Type Check를 이해하는 것이 자연스럽습니다.

Method 호출에서는 Argument Type이 Parameter에 전달될 수 있는지, Return Value가 사용 위치의 Type과 맞는지 등을 검사합니다. Compile에 성공해도 모든 Runtime 오류가 사라지는 것은 아닙니다. 실제 입력에 따른 `NullPointerException` 같은 문제는 실행 중 발생할 수 있습니다.

---

# 참고 자료

- [JLS 4 — Types, Values, and Variables](https://docs.oracle.com/javase/specs/jls/se21/html/jls-4.html)
- [JLS 5 — Conversions and Contexts](https://docs.oracle.com/javase/specs/jls/se21/html/jls-5.html)
