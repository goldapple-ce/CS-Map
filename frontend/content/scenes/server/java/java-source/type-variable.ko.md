# 한눈에 보기

Java 변수에는 Type이 있습니다. Type은 변수에 저장할 수 있는 Value의 종류와 사용할 수 있는 연산을 제한합니다.

변수는 선언 위치에 따라 Local Variable, Parameter, Instance Field와 Static Field로 나눌 수 있습니다.

---

# Primitive Type과 Reference Type

Primitive Type은 `boolean`, 정수 Type, 부동소수점 Type과 `char`이며 변수에 해당 값을 직접 담습니다.

Reference Type 변수에는 객체 자체가 아니라 객체를 가리키는 Reference Value가 들어갑니다. Class, Interface와 Array가 Reference Type에 속하며, 아무 객체도 가리키지 않는 `null`도 Reference Value입니다.

Java Reference는 객체를 가리키지만 C나 C++ Pointer처럼 주소를 숫자로 계산하는 Pointer Arithmetic을 제공하지 않습니다. 그렇다고 Reference가 언제나 안전한 것은 아닙니다. `null`인 Reference를 통해 Instance Field나 Method에 접근하면 `NullPointerException`이 발생할 수 있습니다.

---

# 변수의 종류와 초기화

- `Local Variable`: Method나 Block 안에 선언하며 사용 전에 개발자가 값을 할당해야 합니다.
- `Parameter`: Method 호출자가 전달한 Value를 받는 Local Variable입니다.
- `Instance Field`: 객체마다 별도의 State를 가집니다.
- `Static Field`: Class에 하나가 속하며 해당 Class의 객체들이 공유합니다.

Field와 Array 요소는 생성 시 Type에 맞는 기본값으로 초기화되지만, Local Variable은 자동 기본값에 의존해 사용할 수 없습니다.

---

# Array

Array는 같은 Component Type의 값을 정해진 길이만큼 저장하는 객체입니다. Array 변수도 Reference를 저장하며 `new`로 Array 객체를 만들 수 있습니다.

Primitive Array의 요소에는 Primitive Value가 들어가고, Reference Type Array의 요소에는 Reference Value가 들어갑니다. Array의 길이는 생성 후 바꿀 수 없습니다.

Array에서 기본 `toString()`을 호출하면 요소 목록이 아니라 `Object.toString()` 형식의 문자열이 나옵니다.

```java
int[] numbers = {1, 2, 3};

System.out.println(numbers);                  // 예: [I@2f92e0f4
System.out.println(Arrays.toString(numbers)); // [1, 2, 3]
```

`[I`는 `int[]`를 나타내는 Runtime Class 이름입니다. `@` 뒤의 값은 기본 `hashCode()`를 16진수로 표현한 값이며 Memory 주소라고 단정할 수 없습니다. 요소를 읽기 좋은 형태로 출력하려면 `Arrays.toString()`을 사용합니다.

---

# 참고 자료

- [JLS 4 — Types, Values, and Variables](https://docs.oracle.com/javase/specs/jls/se21/html/jls-4.html)
- [JLS 10 — Arrays](https://docs.oracle.com/javase/specs/jls/se21/html/jls-10.html)
- [Java 21 API — Object.toString](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/Object.html#toString())
- [Java 21 API — Arrays.toString](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/Arrays.html#toString(int[]))
