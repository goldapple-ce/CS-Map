# 한눈에 보기

Entity는 JPA가 Database에 저장하고 identity를 기준으로 관리하는 domain 객체입니다.

일반 Java 객체와 달리 `@Entity`로 mapping 대상임을 표시하고 반드시 식별자를 가져야 합니다.

---

# 기본 구성

```java
@Entity
@Table(name = "member")
class Member {

    @Id
    @GeneratedValue
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    protected Member() {
    }
}
```

- `@Entity`: JPA가 관리할 Entity class임을 나타냅니다.
- `@Id`: Entity identity를 나타냅니다.
- `@GeneratedValue`: 식별자 생성 전략을 지정합니다.
- `@Table`, `@Column`: 기본 mapping 규칙과 다른 table 또는 column 정보를 지정합니다.

---

# Entity 상태

Entity는 Persistence Context와의 관계에 따라 네 가지 상태로 구분됩니다.

- `new` 또는 `transient`: Java 객체는 만들어졌지만 Persistence Context가 관리하지 않고 Database identity와 연결되지 않은 상태입니다.
- `managed`: Persistence Context가 identity와 변경 상태를 관리하는 상태입니다. Dirty Checking의 대상이 됩니다.
- `detached`: 이전에는 managed였지만 현재 Persistence Context에서는 분리된 상태입니다.
- `removed`: managed Entity가 삭제 예정으로 표시된 상태입니다. flush 과정에서 `DELETE`가 실행될 수 있습니다.

EntityManager의 동작에 따라 상태가 바뀝니다.

```text
new ── persist ──→ managed ── remove ──→ removed
                      │
                      └─ detach / clear / Context 종료 ─→ detached

find 또는 query ──→ managed
detached ── merge ──→ 별도의 managed Entity에 상태 복사
```

`merge`는 전달한 detached Entity 자체를 managed 상태로 바꾸지 않습니다. 그 값을 managed Entity에 복사하고 managed Entity를 반환합니다.

Transaction이 commit되었다는 이유만으로 Java 객체가 즉시 사라지는 것은 아닙니다. 다만 transaction-scoped Persistence Context가 종료되면 그 Context가 관리하던 Entity는 detached 상태가 됩니다.

---

# Entity와 값 객체의 차이

Entity는 field 값이 일부 바뀌어도 같은 identity를 가진 대상으로 취급합니다. 예를 들어 회원 email이 변경되어도 같은 회원 ID라면 같은 Entity입니다.

JPA에서 모든 domain 객체를 Entity로 만들 필요는 없습니다. 독립 identity가 필요하지 않은 값은 `@Embeddable` 같은 방식으로 표현할 수 있습니다.

---

# 개발자가 개입하는 지점

개발자는 Entity identity, 생성 방식, 변경 method와 연관 관계의 주인을 설계합니다. JPA annotation을 붙이는 것만큼 객체가 항상 유효한 상태를 유지하도록 만드는 것도 중요합니다.

연관 관계를 추가할 때는 cascade와 fetch 방식을 함께 검토해야 합니다. 편의를 위해 모든 관계를 즉시 조회하거나 모든 작업을 cascade하면 예상보다 많은 SQL이나 원치 않는 삭제가 발생할 수 있습니다.

---

# 헷갈리기 쉬운 점

## Entity 하나가 항상 table 하나와 정확히 일치하는 것은 아닙니다

상속 mapping, secondary table과 embedded value 같은 기능 때문에 객체와 table의 관계가 항상 일대일인 것은 아닙니다.

## Entity의 `equals`와 Database identity는 별도로 설계해야 합니다

식별자가 저장 시점에 생성되는 Entity는 저장 전후 hash 값이 바뀌지 않도록 `equals`와 `hashCode` 구현을 신중하게 정해야 합니다.

## detached Entity는 자동 변경 감지 대상이 아닙니다

Persistence Context에서 분리된 Entity를 변경해도 그 변경은 자동으로 flush되지 않습니다. Database에 반영하려면 managed Entity를 다시 조회해 값을 변경하거나 `merge`의 반환값을 사용해야 합니다.

---

# 참고 자료

- [Jakarta Persistence — Entity Classes](https://jakarta.ee/specifications/persistence/3.2/jakarta-persistence-spec-3.2#the-entity-class)
- [Jakarta Persistence — Entity Life Cycle](https://jakarta.ee/specifications/persistence/3.2/jakarta-persistence-spec-3.2#entity-instance-s-life-cycle)
- [Jakarta Persistence — Entity Annotation](https://jakarta.ee/specifications/persistence/3.2/apidocs/jakarta.persistence/jakarta/persistence/entity)
