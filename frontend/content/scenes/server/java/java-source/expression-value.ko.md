# 한눈에 보기

Expression은 Value를 계산합니다. 대입과 Method 호출에서는 그 Value가 다른 변수로 복사됩니다.

Java는 Primitive Value와 Reference Value를 모두 Pass-by-Value 방식으로 전달합니다.

---

# 대입과 Method 호출

Primitive 변수를 대입하면 Primitive Value가 복사됩니다. Reference 변수를 대입하면 객체가 복제되는 것이 아니라 같은 객체를 가리키는 Reference Value가 복사됩니다.

Method Parameter도 마찬가지입니다. Method 안에서 Parameter가 다른 객체를 가리키도록 바꿔도 호출자의 변수는 바뀌지 않습니다. 다만 복사된 Reference로 같은 객체의 Field를 변경하면 호출자도 변경된 객체를 보게 됩니다.

```text
호출자 Reference ─┐
Parameter Reference ─┴→ 같은 Object
```

---

# `==`와 `equals()`

Primitive Value에 `==`를 사용하면 값을 비교합니다. Reference Value에 `==`를 사용하면 두 Reference가 같은 객체를 가리키는지 비교합니다.

`equals()`는 객체가 정의한 논리적 동등성을 비교하는 Method입니다. Class가 Override하지 않으면 `Object.equals()`의 기본 동작은 같은 객체인지 비교합니다.

String의 내용 비교에는 일반적으로 `equals()`를 사용합니다. Literal Pool 때문에 우연히 같은 Reference가 보이는 경우를 `==` 내용 비교의 근거로 사용하면 안 됩니다.

`equals()`를 구현하거나 사용할 때는 최소한 같은 객체, 같은 내용의 다른 객체, 다른 내용과 `null`을 구분해 확인하는 것이 좋습니다.

```java
String value = new String("java");
String sameObject = value;
String sameContent = new String("java");
String different = "kotlin";

value.equals(sameObject);  // true
value.equals(sameContent); // true
value.equals(different);   // false
value.equals(null);        // false
```

Reference의 동일성도 확인하려면 `==`를 별도로 사용합니다. `null.equals(value)`처럼 `null`을 Receiver로 호출할 수는 없으며, 이 경우 `NullPointerException`이 발생합니다.

---

# Local Variable Capture

Local Class, Anonymous Class와 Lambda Expression이 바깥 Method의 Local Variable을 사용하려면 그 변수는 `final`이거나 값을 다시 대입하지 않는 Effectively Final이어야 합니다.

Capture되는 것은 변수의 Value입니다. Reference 변수라면 Reference Value가 복사되므로 새 객체가 복제되는 것은 아니며, 바깥 코드와 Capture한 코드가 같은 객체를 가리킬 수 있습니다.

---

# Operator와 증가식

Operator는 피연산자로 Value를 계산합니다. `i++`는 기존 값을 결과로 낸 뒤 증가시키고, `++i`는 증가된 값을 결과로 냅니다.

```text
int a = i++; // a에는 증가 전 값
int b = ++i; // b에는 증가 후 값
```

Expression 결과를 사용하지 않는 단순 증가 Statement에서는 두 표현이 같은 결과를 만들 수 있습니다. 어느 쪽이 항상 더 빠르다고 판단하기보다 의미에 맞게 쓰고 실제 성능은 Bytecode와 JIT 실행 결과를 측정해야 합니다.

---

# 참고 자료

- [JLS 5.3 — Invocation Contexts](https://docs.oracle.com/javase/specs/jls/se21/html/jls-5.html#jls-5.3)
- [JLS 15 — Expressions](https://docs.oracle.com/javase/specs/jls/se21/html/jls-15.html)
- [JLS 6.5.6.1 — Simple Expression Names](https://docs.oracle.com/javase/specs/jls/se21/html/jls-6.html#jls-6.5.6.1)
- [Java 21 API — Object.equals](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/Object.html#equals(java.lang.Object))
