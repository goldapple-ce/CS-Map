# 한눈에 보기

Mapping Metadata는 Entity와 관계형 Database 구조의 대응 관계를 JPA Provider에 알려주는 정보입니다.

일반적으로 `jakarta.persistence`의 annotation을 사용하며 XML mapping도 사용할 수 있습니다.

---

# 무엇을 mapping하는가

- Entity class와 table
- field 또는 property와 column
- Entity identity와 primary key
- Entity 사이의 연관 관계와 foreign key
- 상속 구조와 table 구조
- Java type과 Database type의 변환

JPA에는 이름 기반 기본 규칙이 있으므로 모든 field에 `@Column`을 붙일 필요는 없습니다. 기본 규칙과 다른 정보가 필요할 때 명시적으로 설정합니다.

---

# 연관 관계 Mapping

```java
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "team_id")
private Team team;
```

`@OneToOne`, `@OneToMany`, `@ManyToOne`, `@ManyToMany`는 객체 사이의 관계를 표현합니다. 이 annotation은 Java 객체 관계만 나타내는 것이 아니라 foreign key, 조회 방식과 상태 전파에도 영향을 줍니다.

양방향 관계에서는 foreign key를 변경하는 연관 관계의 주인을 정해야 합니다. 반대편의 `mappedBy`만 변경하면 Database foreign key가 갱신되지 않을 수 있습니다.

---

# 개발자가 개입하는 지점

개발자는 annotation을 이용해 table, column, identity와 연관 관계를 mapping합니다. 특히 다음 설정은 실제 SQL 수와 저장 범위에 직접 영향을 줄 수 있습니다.

- `fetch`: 연관 Entity를 언제 조회할지 결정합니다.
- `cascade`: 한 Entity의 상태 변경을 연관 Entity에 전파할지 결정합니다.
- `orphanRemoval`: 관계에서 제거된 Entity를 삭제할지 결정합니다.
- `optional`, `nullable`: 객체 관계와 Database 제약의 의도를 표현합니다.

---

# 헷갈리기 쉬운 점

## Mapping은 Database schema 자체가 아닙니다

Mapping은 객체와 schema의 관계를 설명합니다. annotation을 수정했다고 운영 Database schema가 안전하게 변경되는 것은 아니므로 schema migration은 별도로 관리해야 합니다.

## LAZY를 지정해도 모든 상황에서 query가 적게 나오는 것은 아닙니다

필요한 연관 Entity를 반복 접근하면 N+1 query가 발생할 수 있습니다. 실제 사용 형태에 맞춰 fetch join, EntityGraph나 별도 query를 선택해야 합니다.

---

# 참고 자료

- [Jakarta Persistence — Object/Relational Mapping](https://jakarta.ee/specifications/persistence/3.2/jakarta-persistence-spec-3.2#metadata-for-object-relational-mapping)
- [Jakarta Persistence — Entity Relationships](https://jakarta.ee/specifications/persistence/3.2/jakarta-persistence-spec-3.2#entity-relationships)
