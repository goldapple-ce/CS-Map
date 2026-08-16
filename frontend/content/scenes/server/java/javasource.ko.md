# 한눈에 보기

Java Source는 개발자가 `.java` 파일에 작성한 class, method와 변수 등의 코드입니다.

Source Code는 사람이 작성하고 읽기 위한 형태이며, JVM이 이 파일의 문자열을 그대로 실행하는 것은 아닙니다. 먼저 Java Compiler의 컴파일 과정을 거쳐야 합니다.

---

# 개발자가 개입하는 지점

개발자는 Source Code에 Application의 동작을 작성하고 package와 class 구조, type과 접근 범위를 설계합니다.

Spring Application에서는 annotation과 설정도 Java Source에 작성할 수 있지만, 이 코드는 결국 일반 Java 코드와 함께 컴파일되어 JVM에서 실행됩니다.

---

# 참고 자료

- [Java Language Specification](https://docs.oracle.com/javase/specs/jls/se21/html/)
