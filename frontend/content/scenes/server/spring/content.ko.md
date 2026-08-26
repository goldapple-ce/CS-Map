# 한눈에 보기

이 Scene은 Spring을 사용하는 Server Application에서 요청 처리, Data Access와 객체 관리가 어디에서 만나는지 보여줍니다.

Area는 기능의 범위를 나타내고, 화살표는 대표적인 요청 전달이나 지원 관계를 나타냅니다. 모든 Topic이 항상 한 번에 사용되거나 그림의 모든 화살표를 차례로 거치는 것은 아닙니다.

---

# Web과 Web Servlet

일반적인 Servlet 기반 요청은 다음 흐름으로 이어질 수 있습니다.

```text
Tomcat → Spring Security → Spring MVC → Spring Data
```

`Tomcat`은 HTTP 요청을 받아 Spring 쪽으로 전달합니다. `Spring Security`를 사용하는 Application에서는 보안 Filter가 인증 정보와 접근 권한을 확인한 뒤 요청을 다음 처리 대상으로 넘깁니다.

`Spring MVC`는 Controller를 찾아 HTTP 요청을 처리합니다. `WebSocket`은 연결을 시작할 때 HTTP Handshake를 사용하며, 이후에는 지속된 연결로 Message를 주고받습니다. 두 경로의 Application Code는 필요한 경우 `Spring Data`를 통해 데이터를 읽거나 저장할 수 있습니다.

`RestClient`는 Server가 외부 HTTP API를 호출할 때 사용하는 동기식 Client입니다. 들어온 요청을 처리하는 Spring MVC와 방향이 다르므로 이 Scene에서는 요청 흐름 Edge로 연결하지 않았습니다.

`Web` Area는 Server 요청과 관련해 함께 쓰일 수 있는 Topic을 넓게 보여줍니다. 그 안의 `Web Servlet` Area는 중심 열의 Web 기능을 시각적으로 묶지만, `RestClient`까지 들어오는 요청 순서에 포함된다는 뜻은 아닙니다. Spring Security와 Spring Data는 Spring Framework 내부 Module이 아니라 Application이 필요에 따라 결합하는 별도 Spring 프로젝트입니다.

---

# Data Access

`Spring Data`는 Repository 중심의 Data Access를 제공합니다. 그중 JDBC 기반 경로는 `Spring JDBC`의 SQL 실행과 자원 관리 기능을 활용할 수 있습니다.

`Spring JDBC`는 `JdbcClient`와 `JdbcTemplate`을 제공하며, 그 아래에서 `DataSource`, JDBC API와 JDBC Driver를 사용합니다. 내부 실행 흐름은 Spring JDBC Child Scene에서 확인할 수 있습니다.

`Transaction`은 Spring JDBC 뒤에 실행되는 마지막 단계가 아닙니다. 여러 Data Access 작업이 같은 Transaction 경계와 Connection에 참여하도록 관리하는 지원 관계입니다.

---

# Core

`Spring Container`는 설정을 읽어 `Bean`을 만들고 의존 관계와 생명주기를 관리합니다. Web Handler, Security 구성과 Data Access 객체도 Application 설정에 따라 Bean으로 관리될 수 있습니다.

`Spring AOP`는 선택한 Bean을 Proxy로 감싸 Transaction 같은 공통 기능을 Method 호출 전후에 적용할 수 있습니다. 모든 Bean에 자동으로 적용되는 단계는 아닙니다.

---

# Option

`Spring Batch`는 사용자 요청에 즉시 응답하는 Web 흐름과 달리, 많은 데이터를 일정한 단위로 읽고 처리하고 쓰는 Batch 작업에 사용합니다. 필요한 Application에서 선택하는 별도 Spring 프로젝트이므로 `Option` Area에 분리되어 있습니다.

---

# 참고 자료

- [Spring Framework — Core Technologies](https://docs.spring.io/spring-framework/reference/core.html)
- [Spring Framework — Web on Servlet Stack](https://docs.spring.io/spring-framework/reference/web.html)
- [Spring Framework — WebSocket API](https://docs.spring.io/spring-framework/reference/web/websocket/server.html)
- [Spring Framework — REST Clients](https://docs.spring.io/spring-framework/reference/integration/rest-clients.html)
- [Spring Framework — Data Access](https://docs.spring.io/spring-framework/reference/data-access.html)
- [Spring Security — Servlet Applications](https://docs.spring.io/spring-security/reference/servlet/index.html)
- [Spring Data Commons](https://docs.spring.io/spring-data/commons/reference/)
- [Spring Batch — Introduction](https://docs.spring.io/spring-batch/reference/spring-batch-intro.html)
