# 한눈에 보기

Method Area는 JVM이 불러온 Class의 구조, method와 field 정보, method Bytecode와 static field처럼 Class 단위의 정보를 저장하는 공유 영역입니다.

이름에 `Method`가 들어가지만 method 실행마다 만들어지는 호출 frame을 저장하는 곳은 아닙니다. 각 method 호출의 local variable과 중간 계산 값은 해당 Thread의 JVM Stack frame에서 관리됩니다.

---

# Method Area와 Metaspace

JVM 규격은 Method Area라는 논리적 역할을 정의하지만 실제 구현 방법까지 하나로 고정하지 않습니다.

HotSpot JVM에서는 Java 8부터 Class metadata를 native memory의 `Metaspace`에 저장합니다. 따라서 Method Area와 Metaspace를 완전히 같은 일반 용어로 보거나, Metaspace가 Heap 안에 있다고 이해하면 안 됩니다.

---

# 개발자가 개입하는 지점

일반적인 Application 개발자가 Method Area에 값을 직접 저장하지는 않습니다. Class Loader가 많은 Class를 계속 불러오거나 불필요한 Class Loader가 해제되지 않으면 Class metadata 사용량이 커질 수 있습니다.

관련 memory 오류가 발생하면 동적으로 생성되거나 반복해서 불러온 Class, Class Loader의 생명주기와 Metaspace 사용량을 확인합니다. HotSpot에서는 JVM option으로 Metaspace의 최대 크기를 제한할 수도 있습니다.

---

# 참고 자료

- [Java Virtual Machine Specification — Method Area](https://docs.oracle.com/javase/specs/jvms/se21/html/jvms-2.html#jvms-2.5.4)
- [Oracle Java — Java Command Options](https://docs.oracle.com/en/java/javase/21/docs/specs/man/java.html)
