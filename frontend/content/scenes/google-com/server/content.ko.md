# 일반적인 Server 요청 처리

## 개요

이 Scene은 외부 요청이 `Proxy Server → Application Server → Database`로 이어지는 일반적인 웹 서비스 구성을 보여줍니다. 각 역할을 이해하기 위해 NGINX, Spring, SQL과 NoSQL을 구현 예시로 연결합니다.

> 이 구성은 Google의 비공개 서버 구조를 설명하는 것이 아닙니다. 공식 문서로 확인할 수 있는 각 기술의 일반적인 기능을 하나의 학습 흐름으로 조합한 예시입니다.

## 필요한 이유

모든 책임을 한 프로세스에 모으지 않으면 외부 연결 처리, 애플리케이션 로직과 데이터 저장을 서로 다른 역할로 나눌 수 있습니다. 다만 실제 시스템에서는 이 세 역할이 합쳐지거나, 여러 계층과 서비스로 더 세분화될 수 있습니다.

## 동작 과정

1. Proxy Server가 외부 HTTP 요청을 받습니다.
2. 요청 규칙에 따라 처리할 Application Server로 전달합니다.
3. Application Server가 요청을 해석하고 비즈니스 로직을 실행합니다.
4. 데이터가 필요하면 Database에 조회나 변경을 요청합니다.
5. 처리 결과가 반대 방향으로 돌아가 HTTP 응답이 됩니다.

## 내부 구조

- Proxy Server에서는 NGINX의 reverse proxy와 upstream 전달을 살펴봅니다.
- Application Server에서는 Spring MVC의 요청 분배와 Controller 실행 예시를 살펴봅니다.
- Database에서는 관계형 SQL 방식과 문서형 NoSQL 예시를 비교합니다.

## 실패 상황

- Proxy Server가 올바른 upstream을 선택하지 못하거나 upstream에 연결하지 못할 수 있습니다.
- Application Server의 요청 매핑, 로직 또는 외부 의존성이 실패할 수 있습니다.
- Database 연결, 질의, 제약 조건 또는 transaction이 실패할 수 있습니다.

## 실무 맥락

오류를 조사할 때는 HTTP 상태 코드만 보지 말고 Proxy의 접근·오류 로그, Application의 요청 추적 정보와 Database의 느린 질의나 연결 상태를 같은 요청 기준으로 연결해야 합니다.

## 출처

- NGINX, _ngx_http_proxy_module_
- Spring Framework, _DispatcherServlet_
- PostgreSQL Documentation, _SQL Tutorial_

## 지도 참고

- NGINX, Spring과 Database는 Google 내부 구조가 아니라 역할을 연결해 보기 위한 일반적인 학습 예시입니다.

## 참고 자료

- [NGINX ngx_http_proxy_module](https://nginx.org/en/docs/http/ngx_http_proxy_module.html)
- [Spring Framework — DispatcherServlet](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-servlet.html)
- [PostgreSQL Documentation — SQL Tutorial](https://www.postgresql.org/docs/current/tutorial.html)
