# 개요

이 Scene은 Servlet 기반 Spring 웹 애플리케이션의 큰 요청 경로를 보여줍니다. Tomcat이 HTTP 요청을 Servlet FilterChain에 전달하고, FilterChain을 통과한 요청은 Spring MVC의 front controller인 `DispatcherServlet`에 도달합니다.

Spring Security는 이 경로와 분리된 별도 요청 처리기가 아니라, Servlet FilterChain 안에 보안 Filter들을 연결하는 방식으로 결합됩니다. WebSocket은 최초 HTTP handshake 이후 통신 방식이 달라지므로 일반적인 Spring MVC 요청과 구분해서 봐야 합니다.

---

# 구성 요소

- `Tomcat`: 연결 수신, HTTP protocol 처리와 Servlet 실행 환경을 제공하는 Servlet Container입니다.
- `FilterChain`: 요청에 적용할 Servlet Filter들을 순서대로 호출한 뒤 대상 Servlet을 호출합니다.
- `Spring MVC`: `DispatcherServlet`을 중심으로 요청에 맞는 Controller를 찾고 실행합니다.
- `Spring Security`: `DelegatingFilterProxy`와 `FilterChainProxy`를 통해 Servlet FilterChain 안에서 인증과 인가를 처리합니다.
- `Web Socket`: HTTP upgrade handshake로 연결을 시작한 뒤 하나의 연결에서 양방향 message를 주고받는 기능입니다.

Tomcat은 Spring Framework의 구성 요소가 아닙니다. Spring Boot 애플리케이션에 내장되어 함께 실행될 수 있지만, Servlet 애플리케이션은 Jetty나 Undertow 같은 다른 Servlet Container에서도 동작할 수 있습니다.

---

# 일반적인 HTTP 요청 흐름

1. Tomcat Connector가 연결을 받고 HTTP 요청을 해석합니다.
2. Servlet Container가 요청에 적용할 Filter들과 대상 Servlet로 Servlet FilterChain을 구성합니다.
3. FilterChain이 각 Servlet Filter를 등록 순서대로 호출합니다.
4. Spring Security가 구성돼 있다면 `DelegatingFilterProxy`가 Spring Bean인 `FilterChainProxy`로 보안 처리를 위임합니다.
5. 인증·인가에 실패한 Filter가 응답을 끝내면 뒤쪽 Filter와 DispatcherServlet은 호출되지 않을 수 있습니다.
6. 요청이 계속 진행되면 FilterChain이 대상 Servlet인 Spring MVC의 `DispatcherServlet`을 호출합니다.
7. DispatcherServlet이 HandlerMapping과 HandlerAdapter를 이용해 Controller를 실행하고 응답을 만듭니다.

Scene의 `Tomcat → FilterChain → Spring MVC` 화살표는 이 일반적인 요청 방향을 나타냅니다. 응답은 중첩된 호출이 반환되면서 반대 방향으로 Filter들을 거쳐 Tomcat으로 돌아갑니다.

---

# Spring Security와 FilterChain의 관계

Spring Security는 보안 기능을 Spring MVC Controller마다 반복하지 않고, Controller 앞의 Filter 계층에서 공통으로 적용합니다.

```text
Tomcat의 Servlet FilterChain
└─ DelegatingFilterProxy
   └─ FilterChainProxy
      └─ SecurityFilterChain
         └─ Spring Security Filter들
```

Scene의 Spring Security 지원 관계는 Spring Security가 이 FilterChain 구조를 제공한다는 뜻입니다. 모든 Servlet Filter가 Spring Security Filter인 것은 아니며, Servlet Container가 관리하는 FilterChain과 Spring Security 내부의 SecurityFilterChain은 서로 다른 계층입니다.

---

# WebSocket은 어디에 놓이는가

WebSocket 연결도 처음에는 HTTP 요청으로 시작하며, handshake 단계에서는 Servlet Filter와 Spring Security 설정의 영향을 받을 수 있습니다. 그러나 upgrade가 완료된 뒤 오가는 WebSocket message가 매번 `DispatcherServlet`과 일반 HTTP FilterChain을 다시 통과하는 것은 아닙니다.

Spring의 WebSocket 지원은 `WebSocketHandler` 또는 STOMP message handling 같은 별도 처리 모델을 제공합니다. 따라서 이 Scene의 WebSocket 노드는 Servlet 웹 기능에 속한다는 관계를 나타내며, `Tomcat → FilterChain → DispatcherServlet` 요청선의 다음 단계라는 뜻은 아닙니다.

---

# 범위

이 Scene은 Servlet stack의 큰 경계만 설명합니다. Tomcat 내부 요청 전달, Servlet FilterChain과 Spring Security, DispatcherServlet 이후의 Spring MVC 처리는 각각의 자식 Scene에서 자세히 다룹니다. Reactive WebFlux와 Netty 기반 요청 처리는 이 흐름에 포함하지 않습니다.

# 참고 자료

- [Spring Framework — Web on Servlet Stack](https://docs.spring.io/spring-framework/reference/web.html)
- [Spring Framework — DispatcherServlet](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-servlet.html)
- [Spring Security — Servlet Architecture](https://docs.spring.io/spring-security/reference/servlet/architecture.html)
- [Spring Framework — WebSockets](https://docs.spring.io/spring-framework/reference/web/websocket.html)
- [Apache Tomcat — Request Process Flow](https://tomcat.apache.org/tomcat-11.0-doc/architecture/requestProcess.html)
