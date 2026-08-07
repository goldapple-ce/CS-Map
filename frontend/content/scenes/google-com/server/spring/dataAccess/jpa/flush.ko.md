# 한눈에 보기

Flush는 Persistence Context의 Entity 상태를 Database와 동기화하는 과정입니다.

새 Entity의 `INSERT`, 변경된 Entity의 `UPDATE`, 삭제 예정 Entity의 `DELETE`가 이 과정에서 실행될 수 있습니다.

---

# 언제 발생하는가

JPA Provider는 transaction commit 전에 Persistence Context를 flush합니다. Flush Mode가 `AUTO`라면 실행하려는 query 결과에 영향을 줄 수 있는 변경을 먼저 반영하기 위해 query 전에 flush할 수도 있습니다.

개발자는 필요한 경우 `EntityManager#flush()`를 직접 호출할 수 있습니다.

```java
entityManager.persist(member);
entityManager.flush();
```

명시적 flush는 SQL 실행 시점을 앞당겨 Database 제약 조건 오류를 더 일찍 확인하거나 이후 작업 전에 변경을 동기화해야 할 때 사용할 수 있습니다.

---

# Flush와 Commit

Flush는 SQL을 Database에 보내 Persistence Context와 동기화하지만 transaction을 성공으로 확정하지는 않습니다.

```text
Entity 변경
    ↓
flush: SQL 실행
    ↓
commit: Transaction 결과 확정
```

flush 뒤에도 transaction이 rollback되면 flush로 실행된 변경은 함께 취소됩니다.

---

# 개발자가 개입하는 지점

대부분은 transaction commit 시점의 자동 flush에 맡기면 됩니다. 오류 확인 시점이나 대량 처리처럼 명확한 이유가 있을 때만 직접 flush하는 편이 좋습니다.

대량 저장에서는 일정 단위로 `flush()`와 `clear()`를 함께 사용하여 SQL을 보내고 Persistence Context의 managed Entity를 비울 수 있습니다. 다만 clear 이후 기존 Entity가 detached 상태가 된다는 점을 고려해야 합니다.

---

# 헷갈리기 쉬운 점

## `save()` 호출과 SQL 실행 시점은 같지 않을 수 있습니다

Spring Data JPA의 `save()`가 Entity를 persist하거나 merge해도 실제 SQL은 flush 시점까지 미뤄질 수 있습니다.

## Flush가 성공해도 Commit이 보장된 것은 아닙니다

flush 뒤의 다른 작업이 실패하거나 transaction이 rollback-only 상태가 되면 최종 결과는 rollback됩니다.

---

# 참고 자료

- [Jakarta Persistence — Synchronization to the Database](https://jakarta.ee/specifications/persistence/3.2/jakarta-persistence-spec-3.2#synchronization-to-the-database)
- [Jakarta Persistence — FlushModeType API](https://jakarta.ee/specifications/persistence/3.2/apidocs/jakarta.persistence/jakarta/persistence/flushmodetype)
