# 한눈에 보기

Java Source는 개발자가 `.java` 파일에 작성하는 코드입니다. Package와 Class로 프로그램을 구성하고, Type이 있는 변수와 객체를 사용하며, Expression과 Statement로 동작을 표현합니다.

이 Scene은 실행 순서가 아니라 Java Source를 이해할 때 구분해야 할 다섯 범위를 보여줍니다.

---

# 구성 요소

- `Program Structure`: Package, Class, Method와 Statement가 코드를 구성하는 방식입니다.
- `Type & Variable`: Primitive Type과 Reference Type, 변수와 Array를 구분합니다.
- `Object & Class`: Class로 객체의 State와 Behavior를 정의하고 생성·확장하는 방법입니다.
- `Expression & Value`: 연산, 대입, 비교와 Method 호출에서 Value가 전달되는 방식을 설명합니다.
- `Modifier & Shared State`: `static`, `final`과 접근 제어가 소유권과 변경 범위를 정하는 방식입니다.

Source Code는 JVM이 그대로 실행하지 않습니다. Parent Scene의 Java Compiler가 이를 검사하고 Bytecode를 포함한 Class File로 변환합니다.

---

# 참고 자료

- [Java Language Specification 21](https://docs.oracle.com/javase/specs/jls/se21/html/)
