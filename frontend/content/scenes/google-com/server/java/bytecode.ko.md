# 한눈에 보기

Bytecode는 Java Compiler가 생성하고 JVM이 실행하는 중간 명령 형식입니다. 일반적으로 `.class` 파일에 저장됩니다.

특정 CPU의 기계어로 바로 고정하지 않기 때문에 같은 Bytecode를 해당 환경에 맞는 JVM이 실행할 수 있습니다. 흔히 말하는 Java의 플랫폼 독립성은 Source Code가 아무 조건 없이 동작한다는 뜻이 아니라, JVM이라는 공통 실행 계층을 둔다는 뜻에 가깝습니다.

---

# 개발자가 개입하는 지점

일반적인 Application 개발자가 Bytecode를 직접 작성하는 경우는 드뭅니다. 그럼에도 Bytecode가 중간에 존재한다는 사실을 알면 compile 오류와 runtime 오류의 차이, Java version 호환 문제와 JVM의 실행 방식을 이해하는 데 도움이 됩니다.

필요하면 `javap` 같은 도구로 Class의 구조와 Bytecode 명령을 확인할 수 있습니다.

---

# 참고 자료

- [Java Virtual Machine Specification — The class File Format](https://docs.oracle.com/javase/specs/jvms/se21/html/jvms-4.html)
- [Oracle JDK Tools — javap](https://docs.oracle.com/en/java/javase/21/docs/specs/man/javap.html)
