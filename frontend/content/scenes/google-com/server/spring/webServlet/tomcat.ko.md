# 한눈에 보기

Tomcat은 HTTP 요청을 받아 Java의 Servlet과 Filter를 실행해 주는 Servlet Container입니다.

Spring Boot 웹 애플리케이션에서는 애플리케이션 안에 내장되어 함께 실행되는 경우가 많습니다. 외부에서 들어온 요청을 Servlet 요청 객체로 만들고, FilterChain을 거쳐 Spring MVC의 `DispatcherServlet`까지 전달합니다.

---

# 동작 방식

1. 설정된 port에서 클라이언트의 연결을 받습니다.
2. HTTP 요청을 해석하고 Servlet 요청·응답 객체를 준비합니다.
3. 요청 URL에 적용할 Filter들과 대상 Servlet을 찾습니다.
4. Servlet FilterChain을 실행합니다.
5. FilterChain이 끝까지 진행되면 대상 Servlet을 호출합니다.
6. 만들어진 HTTP 응답을 클라이언트에게 전송합니다.

Spring MVC 애플리케이션에서 이 대상 Servlet은 일반적으로 `DispatcherServlet`입니다.

---

# 개발자가 개입하는 지점

개발자가 Tomcat 내부 요청 처리 코드를 직접 작성하는 경우는 드뭅니다. Spring Boot의 설정으로 필요한 동작을 조정하는 경우가 대부분입니다.

```yaml
server:
  port: 8080
  servlet:
    context-path: /api
  tomcat:
    threads:
      max: 200
```

port, context path, session, connection과 thread 같은 서버 설정을 변경할 수 있습니다. 특별한 요구가 있으면 내장 Tomcat을 Jetty 같은 다른 Servlet Container로 교체할 수도 있습니다.

---

# 헷갈리기 쉬운 점

## Tomcat은 Spring이 아닙니다

Tomcat은 독립적인 Apache 프로젝트입니다. Spring Boot가 Tomcat을 자동으로 구성하고 함께 실행해 주기 때문에 하나처럼 보일 뿐입니다.

## Tomcat과 Spring Container는 역할이 다릅니다

- Tomcat의 Servlet Container: HTTP 요청, Servlet, Filter와 웹 애플리케이션 lifecycle 관리
- Spring Container: Bean 생성, 의존성 주입과 Bean lifecycle 관리

이 차이를 알면 요청이 서버에 도착하지 않은 문제와 Spring Bean 구성 문제를 서로 다른 구간에서 추적할 수 있습니다.

---

# 참고 자료

- [Apache Tomcat — Introduction](https://tomcat.apache.org/tomcat-11.0-doc/introduction.html)
- [Apache Tomcat — Architecture Overview](https://tomcat.apache.org/tomcat-11.0-doc/architecture/index.html)
- [Spring Boot — Servlet Web Applications](https://docs.spring.io/spring-boot/reference/web/servlet.html)
- [Spring Boot — Embedded Web Servers](https://docs.spring.io/spring-boot/how-to/webserver.html)
