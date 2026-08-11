# 한눈에 보기

이 Scene은 외부 요청이 `Proxy Server → Spring Application → 데이터 저장소`로 이어지는 일반적인 Server 구성을 보여줍니다.

Spring Application은 관계형 Database에 SQL을 실행하거나 MongoDB에 Document 데이터를 요청할 수 있습니다. 반복 조회 비용을 줄여야 한다면 Cache를 사용하고, 그 Cache 저장소로 Redis를 선택할 수도 있습니다.

> 이 구성은 Google의 비공개 Server 구조를 설명하는 것이 아닙니다. 공개 문서로 확인할 수 있는 기술의 일반적인 역할을 하나의 학습 흐름으로 연결한 예시입니다.

---

# 요청 흐름

1. Proxy Server가 외부 HTTP 요청을 받습니다.
2. 요청을 처리할 Spring Application으로 전달합니다.
3. Spring이 요청을 해석하고 비즈니스 로직을 실행합니다.
4. 데이터가 필요하면 SQL 또는 MongoDB에 조회나 변경을 요청합니다.
5. 반복해서 사용하는 데이터는 Cache에서 빠르게 조회할 수 있습니다.
6. Redis는 Cache 데이터를 저장하는 구현으로 사용할 수 있습니다.
7. 처리 결과가 반대 방향으로 돌아가 HTTP 응답이 됩니다.

SQL 경로는 table, row, column, 관계와 constraint를 중심으로 데이터를 다룹니다. MongoDB 경로는 collection과 BSON document를 중심으로 데이터를 다룹니다. Cache 경로는 Cache 사용 전략을 설명하고, Redis 경로는 memory 기반 Key-Value 구조, Data Type, TTL과 Eviction을 보여줍니다.

---

# 구성요소

- `Proxy Server`: 외부 요청을 받고 실제 Application Server로 전달합니다.
- `Spring`: 요청 처리와 비즈니스 로직을 실행합니다.
- `Cache`: 반복해서 조회하는 데이터의 복사본을 가까운 곳에 두고 재사용하는 방법과 전략을 설명합니다.
- `SQL`: 관계형 Database에 구조화된 query를 전달합니다.
- `MongoDB`: BSON Document를 Collection에 저장하는 문서형 Database입니다.
- `Redis`: 이 Map에서는 반복 조회를 줄이기 위한 Cache로 사용합니다.

MongoDB도 애플리케이션이 기대하는 Document 구조와 validation 규칙이 필요합니다. 관계형 Database와 MongoDB를 단순히 “schema가 있음”과 “schema가 없음”으로 구분하면 안 됩니다.

---

# 개발자가 개입하는 지점

개발자는 요청의 성격과 데이터 접근 패턴에 맞춰 저장소를 선택하고 연결 설정, query, transaction과 오류 처리를 구성합니다.

여러 저장소를 함께 사용한다면 어떤 데이터가 최종 기준인지, 저장소 사이의 변경 실패를 어떻게 복구할지 명확하게 설계해야 합니다. 서로 다른 저장소에 보낸 작업이 하나의 transaction으로 자동 결합되지는 않습니다.

---

# 헷갈리기 쉬운 점

## SQL은 Database 제품 이름이 아닙니다

SQL은 관계형 데이터를 정의하고 조회·변경하는 언어입니다. PostgreSQL, MySQL 같은 관계형 Database Management System이 SQL을 해석하고 실행합니다.

## Cache와 Redis는 같은 말이 아닙니다

Cache는 반복 작업의 결과를 재사용하는 개념입니다. Redis는 Cache 저장소로 사용할 수 있는 제품이며, 어떤 Cache 전략을 사용할지는 Application과 Cache 계층의 설계에 따라 달라집니다.

## MongoDB와 Redis는 역할이 다릅니다

둘 다 NoSQL 제품으로 분류되기도 하지만 MongoDB는 BSON Document와 Collection을 중심으로 동작하고, Redis는 memory의 Key와 다양한 Value 자료구조를 중심으로 동작합니다. 이 Map의 Redis Scene은 그중 Cache 용도에 필요한 특징을 다룹니다.

---

# 참고 자료

- [NGINX — Proxy Module](https://nginx.org/en/docs/http/ngx_http_proxy_module.html)
- [Spring Framework — DispatcherServlet](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-servlet.html)
- [PostgreSQL — SQL Language](https://www.postgresql.org/docs/current/tutorial-sql.html)
- [MongoDB — Documents](https://www.mongodb.com/docs/manual/core/document/)
- [Redis — Cache-Aside](https://redis.io/docs/latest/develop/use-cases/cache-aside/)
