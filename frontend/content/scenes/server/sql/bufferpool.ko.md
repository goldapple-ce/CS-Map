# 한눈에 보기

Buffer Pool은 Database가 저장장치에서 읽은 table과 index 데이터를 memory에 잠시 보관하는 cache입니다.

MySQL의 InnoDB는 이 공간을 `Buffer Pool`이라고 부릅니다. 한 번 읽은 데이터가 Buffer Pool에 남아 있으면 다음 요청은 저장장치를 다시 읽지 않고 빠른 memory에서 처리할 수 있습니다.

---

# 간단한 동작 방식

```text
필요한 데이터 요청
       ↓
Buffer Pool에 있는가?
  ├─ 있음 → Memory에서 읽음
  └─ 없음 → 저장장치에서 읽음
                    ↓
              Buffer Pool에 보관
```

Buffer Pool에 필요한 데이터가 있는 것을 Cache Hit, 없어서 저장장치에서 읽는 것을 Cache Miss라고 합니다.

Buffer Pool은 공간이 한정되어 있으므로 모든 데이터를 계속 보관하지는 않습니다. 자주 사용하는 데이터는 남을 가능성이 높고 오랫동안 사용하지 않은 데이터는 다른 데이터를 위해 빠질 수 있습니다.

---

# 성능 테스트에서 주의할 점

같은 query를 처음 실행했을 때는 저장장치에서 데이터를 읽느라 느릴 수 있습니다. 바로 다시 실행하면 필요한 데이터가 Buffer Pool에 남아 있어 훨씬 빠르게 나올 수 있습니다.

```text
첫 번째 실행
저장장치 읽기 포함 → 느릴 수 있음

두 번째 이후 실행
Buffer Pool에서 읽음 → 빨라질 수 있음
```

따라서 한 번 실행한 시간만 보고 query 성능을 판단하면 안 됩니다. 비교할 두 query를 항상 같은 순서로 실행하면 먼저 실행한 query가 cache를 데우고, 나중 query가 그 이점을 받아 불공정한 결과가 나올 수도 있습니다.

성능 테스트를 시작하기 전에 무엇을 측정할지 먼저 정해야 합니다.

- Cold Cache: 필요한 데이터가 memory에 거의 없는 첫 실행 성능을 봅니다.
- Warm Cache: 자주 사용하는 데이터가 memory에 올라온 반복 실행 성능을 봅니다.

둘 중 하나만 정답인 것은 아닙니다. 오래 실행 중인 서비스를 알고 싶다면 Warm Cache가 중요하고, 재시작 직후나 처음 접근하는 데이터의 지연을 알고 싶다면 Cold Cache도 따로 측정해야 합니다.

---

# 개발자가 개입하는 지점

개발자는 Database 설정에서 Buffer Pool 크기를 확인하고 조정할 수 있습니다. MySQL InnoDB에서는 `innodb_buffer_pool_size`를 사용합니다.

```sql
SHOW VARIABLES LIKE 'innodb_buffer_pool_size';
```

Buffer Pool이 너무 작으면 필요한 데이터가 자주 빠져 저장장치를 더 많이 읽을 수 있습니다. 반대로 너무 크게 잡으면 애플리케이션이나 운영체제가 사용할 memory가 부족해질 수 있으므로 무조건 크게 설정하는 것은 좋지 않습니다.

운영 환경에서는 보통 Database 관리자나 인프라 담당자와 함께 서버 memory와 실제 사용량을 보고 조정합니다. 개발자는 성능 테스트를 할 때 운영 환경과 Buffer Pool 크기가 크게 다르지 않은지 확인하고, 첫 실행인지 반복 실행인지, warm-up을 했는지와 측정 순서를 결과에 남겨야 합니다.

---

# 헷갈리기 쉬운 점

## Buffer Pool은 Query 결과를 그대로 저장하지 않습니다

Buffer Pool은 `SELECT` 결과 전체를 저장하는 것이 아니라 table과 index의 데이터 page를 보관합니다. SQL 문장이 달라도 같은 데이터를 읽는 query라면 이미 올라온 page를 함께 사용할 수 있습니다.

## Buffer Pool과 Connection Pool은 다릅니다

Buffer Pool은 Database가 table과 index 데이터를 memory에 보관하는 공간입니다. Connection Pool은 애플리케이션이 Database Connection을 미리 만들어 두고 재사용하는 기능입니다.

일반적인 Spring Boot 애플리케이션에서는 HikariCP 같은 Connection Pool이 `DataSource`와 함께 애플리케이션 안에서 동작합니다. MySQL의 `max_connections`는 Database가 동시에 허용할 Connection 수를 제한하지만, Connection을 빌려주고 회수하는 애플리케이션의 Pool과는 다른 설정입니다.

## 같은 Query가 항상 같은 시간으로 실행되지는 않습니다

Buffer Pool뿐 아니라 실행 계획, 동시 요청, lock, CPU와 저장장치 상태도 실행 시간에 영향을 줍니다. Cache 여부만으로 모든 차이를 설명하면 안 됩니다.

## Database 재시작만으로 완전히 같은 Cold Cache가 보장되지는 않습니다

운영체제와 저장장치에도 별도의 cache가 있을 수 있습니다. 정확한 비교가 필요하다면 동일한 테스트 환경과 절차를 반복해서 사용해야 합니다.

---

# 참고 자료

- [MySQL — InnoDB Buffer Pool](https://dev.mysql.com/doc/refman/8.4/en/innodb-buffer-pool.html)
- [MySQL — InnoDB Buffer Pool Configuration](https://dev.mysql.com/doc/refman/8.4/en/innodb-performance-buffer-pool.html)
- [MySQL — EXPLAIN ANALYZE](https://dev.mysql.com/doc/refman/8.4/en/explain.html)
