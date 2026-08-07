# 한눈에 보기

Dirty Checking은 Persistence Context가 관리하는 Entity의 변경을 JPA Provider가 감지하여 필요한 `UPDATE` SQL을 준비하는 동작입니다.

개발자가 Entity를 조회한 뒤 값을 변경하면 별도의 update method를 호출하지 않아도 transaction의 flush 과정에서 변경이 반영될 수 있습니다.

---

# 동작 방식

```java
@Transactional
public void changeEmail(Long memberId, String email) {
    Member member = entityManager.find(Member.class, memberId);
    member.changeEmail(email);
}
```

1. Entity를 조회해 managed 상태로 만듭니다.
2. 애플리케이션이 Entity 상태를 변경합니다.
3. JPA Provider가 flush 과정에서 변경 여부를 확인합니다.
4. 변경된 mapping 정보를 바탕으로 필요한 SQL을 실행합니다.

JPA는 managed Entity의 변경이 Database와 동기화되어야 한다는 동작을 정의합니다. Hibernate가 이전 상태의 snapshot과 현재 상태를 비교하는 방식 등은 구현체의 구체적인 전략입니다.

---

# 개발자가 개입하는 지점

Dirty Checking 자체를 호출하기보다 transaction 안에서 managed Entity의 상태를 변경합니다. 변경 method를 Entity에 두면 어떤 비즈니스 규칙으로 상태가 바뀌는지 표현하기 쉽습니다.

많은 Entity를 한 번에 관리하면 변경 확인 비용과 Persistence Context memory 사용량이 커질 수 있습니다. 조회 전용 작업에서는 `@Transactional(readOnly = true)`가 Provider 최적화에 사용될 수 있습니다.

---

# 헷갈리기 쉬운 점

## 모든 Java 객체의 변경을 감지하지는 않습니다

현재 Persistence Context의 managed Entity만 대상입니다. new 객체나 detached Entity의 field를 바꿔도 그 변경이 자동으로 Database에 반영되지 않습니다.

## Dirty Checking이 즉시 UPDATE를 실행하는 것은 아닙니다

Entity를 변경한 순간이 아니라 flush가 일어나는 시점에 SQL이 만들어지고 실행되는 것이 일반적입니다.

## Spring Data JDBC와 MyBatis의 기능이 아닙니다

이 동작은 JPA Persistence Context와 JPA Provider의 Entity 상태 관리에서 나옵니다. Spring Data JDBC나 MyBatis에서는 저장 또는 update 작업을 명시적으로 요청해야 합니다.

---

# 참고 자료

- [Jakarta Persistence — Managed Instances](https://jakarta.ee/specifications/persistence/3.2/jakarta-persistence-spec-3.2#managed-instances)
- [Hibernate ORM — Persistence Context](https://docs.hibernate.org/orm/current/userguide/html_single/Hibernate_User_Guide.html#pc)
