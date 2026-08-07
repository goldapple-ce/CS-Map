# 한눈에 보기

이 Scene은 외부 요청이 `Proxy Server → Spring Application → 데이터 저장소`로 이어지는 일반적인 Server 구성을 보여줍니다.

Spring Application이 사용하는 저장소는 관계형 Database와 SQL일 수도 있고 NoSQL 저장소일 수도 있습니다. 두 종류를 반드시 하나만 선택해야 하는 것은 아니며, 한 애플리케이션이 목적에 따라 함께 사용할 수도 있습니다.

> 이 구성은 Google의 비공개 Server 구조를 설명하는 것이 아닙니다. 공개 문서로 확인할 수 있는 기술의 일반적인 역할을 하나의 학습 흐름으로 연결한 예시입니다.

---

# 요청 흐름

1. Proxy Server가 외부 HTTP 요청을 받습니다.
2. 요청을 처리할 Spring Application으로 전달합니다.
3. Spring이 요청을 해석하고 비즈니스 로직을 실행합니다.
4. 데이터가 필요하면 SQL 또는 NoSQL 저장소에 조회나 변경을 요청합니다.
5. 처리 결과가 반대 방향으로 돌아가 HTTP 응답이 됩니다.

SQL 경로는 table, row, column, 관계와 constraint를 중심으로 데이터를 다룹니다. NoSQL 경로는 여러 비관계형 모델을 포함하며, 이 Map에서는 MongoDB 같은 문서형 Database를 구체적인 예시로 사용합니다.

---

# 구성요소

- `Proxy Server`: 외부 요청을 받고 실제 Application Server로 전달합니다.
- `Spring`: 요청 처리와 비즈니스 로직을 실행합니다.
- `SQL`: 관계형 Database에 구조화된 query를 전달합니다.
- `NoSQL`: 문서형, key-value, wide-column, graph 등 관계형 table 이외의 모델을 사용합니다.

SQL과 NoSQL은 단순히 “정해진 schema가 있음”과 “schema가 없음”으로 구분할 수 없습니다. NoSQL 제품도 데이터 구조와 validation 규칙을 가질 수 있고, 관계형 Database도 JSON 같은 다양한 type을 지원할 수 있습니다.

---

# 개발자가 개입하는 지점

개발자는 요청의 성격과 데이터 접근 패턴에 맞춰 저장소를 선택하고 연결 설정, query, transaction과 오류 처리를 구성합니다.

여러 저장소를 함께 사용한다면 어떤 데이터가 최종 기준인지, 저장소 사이의 변경 실패를 어떻게 복구할지 명확하게 설계해야 합니다. 서로 다른 저장소에 보낸 작업이 하나의 transaction으로 자동 결합되지는 않습니다.

---

# 헷갈리기 쉬운 점

## SQL은 Database 제품 이름이 아닙니다

SQL은 관계형 데이터를 정의하고 조회·변경하는 언어입니다. PostgreSQL, MySQL 같은 관계형 Database Management System이 SQL을 해석하고 실행합니다.

## NoSQL은 하나의 데이터 모델이 아닙니다

문서형, key-value, wide-column과 graph Database는 구조와 query 방식이 서로 다릅니다. 하위 Scene의 문서형 흐름을 NoSQL 전체의 공통 내부 구조로 일반화하면 안 됩니다.

---

# 참고 자료

- [NGINX — Proxy Module](https://nginx.org/en/docs/http/ngx_http_proxy_module.html)
- [Spring Framework — DispatcherServlet](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-servlet.html)
- [PostgreSQL — SQL Language](https://www.postgresql.org/docs/current/tutorial-sql.html)
- [MongoDB — Documents](https://www.mongodb.com/docs/manual/core/document/)
