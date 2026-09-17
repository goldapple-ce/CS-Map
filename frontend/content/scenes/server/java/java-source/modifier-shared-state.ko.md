# 한눈에 보기

Modifier는 Class, Field와 Method의 소유 방식이나 변경 가능 범위를 나타냅니다. `static`과 `final`은 이름이 비슷한 목적의 기능이 아니라 각각 소유권과 재할당 가능성을 다룹니다.

---

# static

Instance Field는 객체마다 존재하지만 Static Field는 Class에 하나가 속하며 모든 Instance가 공유합니다. Static Method는 특정 객체 없이 Class를 통해 호출하며 Instance Member에 직접 접근할 수 없습니다.

Java에는 Class 밖에 선언하는 진짜 전역 변수가 없습니다. 대신 `public static` Field를 어디서나 접근하게 만들면 전역 상태처럼 동작할 수 있습니다.

변경 가능한 Static Field를 여러 코드와 Thread가 공유하면 누가 언제 값을 바꿨는지 추적하기 어렵고, Test 사이에 상태가 남거나 Race Condition이 생길 수 있습니다. 공유가 필요하다면 접근 범위를 제한하고 동시성 제어와 Lifecycle을 함께 설계해야 합니다.

---

# final

Final 변수는 한 번 값이 정해진 뒤 다시 대입할 수 없습니다. Primitive Final 변수는 해당 Primitive Value를, Reference Final 변수는 Reference의 재할당을 막습니다.

Final Reference가 가리키는 객체 자체까지 Immutable이 되는 것은 아닙니다. 객체의 변경을 막으려면 Class의 설계가 별도로 필요합니다.

변하지 않는 Class 단위 상수는 보통 `static final`로 선언합니다. `static`은 Class 소유, `final`은 재할당 금지라는 두 의미가 함께 적용됩니다.

---

# 참고 자료

- [JLS 4.12.4 — final Variables](https://docs.oracle.com/javase/specs/jls/se21/html/jls-4.html#jls-4.12.4)
- [JLS 8.3.1 — Field Modifiers](https://docs.oracle.com/javase/specs/jls/se21/html/jls-8.html#jls-8.3.1)
- [JLS 8.4.3 — Method Modifiers](https://docs.oracle.com/javase/specs/jls/se21/html/jls-8.html#jls-8.4.3)
