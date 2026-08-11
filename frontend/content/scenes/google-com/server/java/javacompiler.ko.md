# 한눈에 보기

Java Compiler는 `.java` Source Code를 JVM이 실행할 수 있는 `.class` Bytecode로 변환합니다. 대표적인 compiler command가 JDK에 포함된 `javac`입니다.

Compiler는 이 과정에서 문법 오류와 일부 type 오류를 실행 전에 찾아냅니다. 컴파일에 성공했다고 Application의 모든 동작이 올바르다는 뜻은 아니며, 실제 입력과 실행 상태에 따라 runtime 오류가 발생할 수도 있습니다.

---

# 개발자가 개입하는 지점

개발자는 build tool에서 사용할 Java version, compiler option과 annotation processor 등을 설정합니다. 일반적으로 Maven이나 Gradle이 `javac`를 직접 입력하는 작업을 대신합니다.

---

# 참고 자료

- [Oracle JDK Tools — javac](https://docs.oracle.com/en/java/javase/21/docs/specs/man/javac.html)
