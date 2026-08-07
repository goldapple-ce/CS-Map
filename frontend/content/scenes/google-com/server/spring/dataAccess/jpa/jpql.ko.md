# 한눈에 보기

JPQL은 table과 column이 아니라 Entity와 attribute를 대상으로 작성하는 JPA query 언어입니다.

JPA Provider가 JPQL을 해석하고 mapping 정보를 이용해 실제 Database SQL로 변환합니다.

---

# 기본 형태

```java
List<Member> members = entityManager.createQuery(
        "select m from Member m where m.email = :email",
        Member.class
    )
    .setParameter("email", email)
    .getResultList();
```

`Member`는 table 이름이 아니라 Entity 이름이고, `m.email`은 column 이름이 아니라 Entity attribute입니다.

JPQL은 조회뿐 아니라 bulk update와 delete도 지원합니다. 다만 bulk 연산은 Persistence Context의 managed Entity 상태를 직접 갱신하지 않으므로 실행 뒤 상태 불일치를 주의해야 합니다.

---

# Spring Data JPA와의 관계

Spring Data JPA의 query method는 method 이름으로 query를 만들 수 있고, `@Query`를 이용해 JPQL을 직접 작성할 수도 있습니다.

```java
@Query("select m from Member m where m.email = :email")
Optional<Member> findMember(@Param("email") String email);
```

Spring Data JPA가 제공하는 편의 기능이고, 실제 JPQL 해석과 실행은 JPA Provider가 담당합니다.

---

# 개발자가 개입하는 지점

개발자는 필요한 결과와 연관 관계 조회 범위를 고려해 JPQL을 작성합니다. 외부 값을 문자열로 이어 붙이지 말고 parameter binding을 사용해야 합니다.

조회 성능이 중요하다면 JPQL만 읽고 판단하지 말고 Provider가 만든 실제 SQL, join 수와 실행 계획을 확인해야 합니다.

---

# 헷갈리기 쉬운 점

## JPQL은 SQL의 단순한 별칭이 아닙니다

문법이 비슷하지만 JPQL은 JPA의 Entity model을 대상으로 하고, SQL은 Database schema를 대상으로 합니다.

## 모든 Database 기능을 JPQL로 표현할 수 있는 것은 아닙니다

Database 전용 기능이 필요하면 native SQL이나 Provider 확장 기능을 사용할 수 있습니다. 이 경우 JPA 표준만 사용할 때보다 특정 Database나 Provider에 대한 의존이 커집니다.

---

# 참고 자료

- [Jakarta Persistence — Query Language](https://jakarta.ee/specifications/persistence/3.2/jakarta-persistence-spec-3.2#query-language)
- [Jakarta Persistence — Query APIs](https://jakarta.ee/specifications/persistence/3.2/jakarta-persistence-spec-3.2#query-apis)
