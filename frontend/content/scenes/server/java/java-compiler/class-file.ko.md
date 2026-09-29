# 한눈에 보기

검사와 변환이 끝나면 Java Compiler는 JVM이 읽을 수 있는 Class File을 만듭니다. 일반적으로 `.class` 확장자를 사용하며, Java Source를 바로 실행하는 대신 이 파일이 JVM으로 넘어갑니다.

Class File에는 Method Bytecode뿐 아니라 Constant Pool, Class·Field·Method 정보와 Attribute도 함께 기록됩니다. 따라서 Class File 전체와 Bytecode는 같은 뜻이 아닙니다.

여기서는 Compiler의 출력이라는 역할만 봅니다. Class File의 구성 요소와 확인 방법은 Parent Scene의 Class File Topic에서, JVM이 파일을 읽고 실행하는 과정은 JVM Scene에서 자세히 다룹니다.

---

# 참고 자료

- [JVMS 4 — The class File Format](https://docs.oracle.com/javase/specs/jvms/se21/html/jvms-4.html)
- [Oracle JDK Tools — javap](https://docs.oracle.com/en/java/javase/21/docs/specs/man/javap.html)
