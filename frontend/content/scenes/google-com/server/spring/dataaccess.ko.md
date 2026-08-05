# 한눈에 보기

Spring Data Access는 애플리케이션이 관계형 데이터베이스와 여러 저장소에 접근할 때 필요한 반복 작업을 줄이고, 일관된 transaction 처리 방식을 제공하는 영역입니다.

Spring Framework는 JDBC 지원, transaction 추상화와 ORM 통합을 제공합니다. Spring Data 프로젝트는 Repository 추상화를 더해 저장소별 데이터 접근 코드를 간결하게 작성하도록 돕습니다.

---

# 주요 구성 요소

- `JDBC 지원`: connection과 resource 정리, 예외 변환 같은 반복 작업을 줄입니다.
- `Transaction`: 여러 데이터 작업을 하나의 성공 또는 실패 단위로 묶습니다.
- `ORM 통합`: JPA와 Hibernate 같은 기술을 Spring Container와 연결합니다.
- `Repository`: 저장, 조회와 삭제 같은 데이터 접근 동작을 interface 중심으로 작성하게 합니다.

예를 들어 Spring Data JPA는 Repository interface를 바탕으로 구현 객체를 만들고 Spring Bean으로 등록할 수 있습니다.

---

# 개발자가 개입하는 지점

개발자는 datasource와 ORM 설정, entity, Repository interface와 transaction 경계를 작성합니다.

```java
public interface MemberRepository extends JpaRepository<Member, Long> {
    Optional<Member> findByEmail(String email);
}
```

```java
@Transactional
public void changeEmail(Long memberId, String email) {
    Member member = memberRepository.findById(memberId).orElseThrow();
    member.changeEmail(email);
}
```

Repository가 실제 저장소 접근을 맡고, `@Transactional`이 여러 작업의 실행 범위를 정합니다.

---

# 헷갈리기 쉬운 점

## Data Access는 웹 요청에만 속하지 않습니다

Controller에서 시작된 요청이 Service와 Repository로 이어질 수는 있지만, batch나 message 처리에서도 같은 데이터 접근 기능을 사용할 수 있습니다.

## Spring Data와 JPA는 같은 기술이 아닙니다

JPA는 Java ORM specification이고, Spring Data JPA는 JPA를 편리하게 사용하도록 Repository 추상화와 Spring 통합 기능을 제공하는 프로젝트입니다.

이 토픽의 세부 구성 요소는 이후 자식 Scene에서 더 자세히 나눌 수 있습니다.

---

# 참고 자료

- [Spring Framework — Data Access](https://docs.spring.io/spring-framework/reference/data-access.html)
- [Spring Framework — Transaction Management](https://docs.spring.io/spring-framework/reference/data-access/transaction.html)
- [Spring Data — Repositories](https://docs.spring.io/spring-data/commons/reference/repositories.html)
