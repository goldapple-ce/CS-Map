# 한눈에 보기

Class File은 Java Compiler가 생성하고 JVM이 읽는 출력입니다. 일반적으로 `.class` 확장자를 사용하며, JVM이 이해하는 정해진 Binary 형식을 따릅니다.

Class File에는 Method Bytecode뿐 아니라 Constant Pool, Class·Field·Method 정보와 Attribute도 함께 기록됩니다. 따라서 Class File 전체와 Bytecode는 같은 뜻이 아닙니다.

이 Topic은 Compiler의 출력이라는 역할에만 집중합니다. Class File의 구성 요소와 확인 방법은 Parent Scene의 Class File Topic에서, Loading과 실행은 JVM Scene에서 다룹니다.

---

# 참고 자료

- [JVMS 4 — The class File Format](https://docs.oracle.com/javase/specs/jvms/se21/html/jvms-4.html)
- [Oracle JDK Tools — javap](https://docs.oracle.com/en/java/javase/21/docs/specs/man/javap.html)
