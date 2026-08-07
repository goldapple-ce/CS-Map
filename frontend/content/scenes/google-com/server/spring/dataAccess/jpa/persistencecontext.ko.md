# 한눈에 보기

Persistence Context는 JPA가 Entity를 관리하는 논리적인 공간입니다. 같은 Entity identity에 대응하는 managed 객체와 그 상태를 기억합니다.

흔히 1차 Cache라고도 설명하지만 단순한 조회 Cache보다 역할이 넓습니다. Entity 동일성 보장, 상태 전이, 변경 감지와 flush의 기준이 됩니다.

---

# 동일성 보장

같은 Persistence Context에서 같은 type과 ID로 Entity를 반복 조회하면 JPA는 같은 managed Entity instance를 제공해야 합니다.

```java
Member first = entityManager.find(Member.class, 1L);
Member second = entityManager.find(Member.class, 1L);

first == second; // 같은 Persistence Context라면 true
```

이 규칙 덕분에 한 작업 안에서 같은 Database 행을 서로 다른 Java 객체로 제각각 수정하는 문제를 줄일 수 있습니다.

---

# 개발자가 개입하는 지점

개발자는 보통 Persistence Context를 직접 만들지 않고 transaction 경계를 통해 수명을 간접적으로 결정합니다.

대량 처리에서는 managed Entity가 계속 쌓이면 memory 사용량이 커질 수 있습니다. 필요한 경우 일정 단위마다 `flush()`와 `clear()`를 호출할 수 있지만, clear 이후 기존 Entity가 detached 상태가 된다는 점을 고려해야 합니다.

---

# 헷갈리기 쉬운 점

## Persistence Context와 Transaction은 같은 개념이 아닙니다

Transaction은 작업의 commit과 rollback 경계이고, Persistence Context는 Entity를 관리하는 공간입니다. Spring의 일반적인 transaction-scoped 사용에서는 두 수명이 비슷하게 보여도 역할은 다릅니다.

## Persistence Context가 모든 Entity를 계속 보관하는 것은 아닙니다

현재 Context에 들어온 managed Entity만 동일성과 변경 상태를 관리합니다. Entity의 상태 종류와 전이 과정은 Entity 토픽에서 다룹니다.

---

# 참고 자료

- [Jakarta Persistence — Persistence Contexts](https://jakarta.ee/specifications/persistence/3.2/jakarta-persistence-spec-3.2#persistence-contexts)
