# 한눈에 보기

Class는 객체가 가질 Field와 Method를 정의하는 Type이고, Object는 그 Class를 바탕으로 Runtime에 만들어진 Instance입니다.

Field는 객체의 State를, Method는 객체가 제공하는 Behavior를 표현합니다.

---

# 객체 생성과 Constructor

`new`는 객체를 만들고 Constructor를 호출해 초기 상태를 구성합니다. Constructor는 Class와 같은 이름을 사용하지만 Return Type을 선언하지 않습니다.

Constructor도 Parameter 구성을 다르게 하여 Overload할 수 있습니다. 개발자가 Constructor를 하나도 선언하지 않았을 때만 Compiler가 조건에 맞는 Default Constructor를 제공하므로 항상 자동으로 생긴다고 가정하면 안 됩니다.

---

# 접근 범위

`public`, `protected`, Package Access와 `private`은 Class와 Member에 접근할 수 있는 범위를 정합니다. Field를 무조건 공개하기보다 객체가 지켜야 할 규칙을 Method 안에 두면 State 변경을 통제하기 쉽습니다.

---

# Overload와 Override

Overload는 같은 Class에서 같은 이름의 Method를 서로 다른 Parameter 목록으로 선언하는 것입니다. 어떤 Method를 호출할지는 Compile Time의 Type 정보로 결정됩니다.

Override는 Subclass가 상속받은 Instance Method의 구현을 다시 정의하는 것입니다. 실제로 실행할 Override Method는 Runtime의 객체 Type에 따라 결정될 수 있습니다.

---

# String 객체

String Literal은 같은 내용의 Literal을 재사용할 수 있도록 Intern된 String 객체를 참조합니다. `new String("java")`는 Constructor 호출을 통해 별도의 String 객체를 만들 수 있으므로 Literal Reference와 같다고 가정하면 안 됩니다.

String은 Immutable이라 생성된 객체의 문자열 내용이 바뀌지 않습니다. 문자열을 변경하는 것처럼 보이는 연산은 결과를 나타내는 다른 String 객체를 만듭니다.

Immutability는 String Pool의 객체를 안전하게 재사용할 수 있는 기반입니다. 여러 코드가 같은 pooled String 객체를 참조해도 한 코드가 그 객체의 문자열 내용을 바꿔 다른 코드에 영향을 줄 수 없습니다.

Java 규격은 String Interning의 의미를 정의하지만, Pool이 특정 JVM Memory 영역의 어디에 구현되어야 한다고 Source Code 수준에서 단정하지는 않습니다.

---

# 참고 자료

- [JLS 8 — Classes](https://docs.oracle.com/javase/specs/jls/se21/html/jls-8.html)
- [JLS 15.9 — Class Instance Creation Expressions](https://docs.oracle.com/javase/specs/jls/se21/html/jls-15.html#jls-15.9)
- [JLS 3.10.5 — String Literals](https://docs.oracle.com/javase/specs/jls/se21/html/jls-3.html#jls-3.10.5)
- [Java 21 API — String](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/String.html)
