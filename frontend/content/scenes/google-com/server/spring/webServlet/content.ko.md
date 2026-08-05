# 한눈에 보기

Spring Web Servlet은 Servlet 기술을 기반으로 HTTP 요청을 처리하는 Spring 웹 구조입니다.

화면의 중심 흐름은 `Tomcat → Servlet FilterChain → Spring MVC`입니다. Tomcat이 요청을 받고, Filter들이 공통 작업을 처리한 뒤, Spring MVC가 알맞은 Controller를 실행해 응답을 만듭니다.

---

# 구성 요소

- `Tomcat`: HTTP 요청을 받고 Servlet과 Filter를 실행하는 환경입니다.
- `FilterChain`: 요청에 적용할 Servlet Filter들을 순서대로 실행한 뒤 대상 Servlet을 호출합니다.
- `Spring MVC`: `DispatcherServlet`을 중심으로 요청에 맞는 Controller를 찾아 실행합니다.
- `Spring Security`: FilterChain 안에 보안 Filter들을 연결해 인증과 인가를 처리합니다.
- `WebSocket`: HTTP로 연결을 시작한 뒤 하나의 연결에서 양방향 message를 주고받습니다.

Tomcat은 Spring 자체의 구성 요소가 아닙니다. Spring Boot가 기본적으로 함께 제공하는 Servlet Container이며, 필요하면 Jetty 같은 다른 구현으로 교체할 수 있습니다.

---

# 전체 흐름

1. 클라이언트가 HTTP 요청을 보냅니다.
2. Tomcat이 요청을 받아 현재 요청에 적용할 Servlet FilterChain을 실행합니다.
3. FilterChain의 각 Filter가 로깅, 인코딩, 보안 같은 공통 작업을 처리합니다.
4. 모든 Filter가 요청을 계속 진행시키면 대상 Servlet인 `DispatcherServlet`이 호출됩니다.
5. DispatcherServlet이 요청에 맞는 Controller를 찾아 실행합니다.
6. 만들어진 응답은 호출 순서의 반대로 Filter들을 거쳐 클라이언트에게 돌아갑니다.

중간의 Filter가 응답을 바로 만들면 뒤쪽 Filter와 DispatcherServlet은 호출되지 않을 수 있습니다.

---

# Spring Security는 어디에 들어가는가

Spring Security는 Spring MVC 옆에서 별도의 요청 흐름을 만드는 것이 아닙니다. Servlet FilterChain에 등록된 `DelegatingFilterProxy`를 통해 보안 Filter들을 실행합니다.

```text
Servlet FilterChain
└─ DelegatingFilterProxy
   └─ FilterChainProxy
      └─ SecurityFilterChain의 Security Filter들
```

따라서 인증과 인가는 보통 Controller가 실행되기 전에 처리됩니다. 보안 검사를 통과한 요청만 원래 Servlet FilterChain으로 돌아와 Spring MVC까지 진행합니다.

---

# 개발자가 개입하는 지점

개발자는 보통 전체 요청 체인을 직접 만들지 않고, 필요한 구간의 설정이나 코드를 작성합니다.

- 서버 설정: `server.port`, session, timeout 같은 Tomcat 설정 변경
- 공통 처리: Servlet Filter를 구현하고 적용 범위와 순서 설정
- 보안 처리: `SecurityFilterChain` Bean으로 인증·인가 규칙 구성
- 요청 처리: Controller와 Spring MVC 설정 작성
- 실시간 통신: WebSocket endpoint와 message 처리기 구성

문제가 발생한 위치에 따라 확인할 지점도 달라집니다. Controller까지 요청이 오지 않았다면 Tomcat, Servlet FilterChain과 Spring Security를 먼저 확인하고, Controller 선택이나 인잣값 변환 문제라면 Spring MVC 흐름을 확인하는 것이 좋습니다.

---

# 꼭 알아둘 점

## Servlet FilterChain과 SecurityFilterChain은 다릅니다

Servlet FilterChain은 Tomcat 같은 Servlet Container가 관리하는 전체 요청 체인입니다. `SecurityFilterChain`은 그 안에서 `FilterChainProxy`가 선택하는 Spring Security Filter 목록입니다.

## WebSocket은 일반 HTTP 흐름의 다음 단계가 아닙니다

WebSocket도 처음에는 HTTP handshake로 시작하므로 Filter와 Spring Security의 영향을 받을 수 있습니다. 하지만 연결이 WebSocket으로 전환된 뒤의 message가 매번 DispatcherServlet을 통과하는 것은 아닙니다.

## 이 구조는 Servlet 방식의 흐름입니다

Spring WebFlux는 Servlet과 DispatcherServlet을 기반으로 하지 않으므로 이 화면의 요청 흐름과 다릅니다.

---

# 참고 자료

- [Spring Framework — Web on Servlet Stack](https://docs.spring.io/spring-framework/reference/web.html)
- [Spring Framework — DispatcherServlet](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-servlet.html)
- [Spring Security — Servlet Architecture](https://docs.spring.io/spring-security/reference/servlet/architecture.html)
- [Spring Framework — WebSockets](https://docs.spring.io/spring-framework/reference/web/websocket.html)
- [Spring Boot — Servlet Web Applications](https://docs.spring.io/spring-boot/reference/web/servlet.html)
