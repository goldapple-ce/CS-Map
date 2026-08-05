# 개요

Tomcat은 Java의 Servlet specification을 구현하는 Servlet Container이자 HTTP server입니다. Servlet 기반 Spring 웹 애플리케이션에서는 외부의 HTTP 요청을 받아 애플리케이션의 Filter와 Servlet로 전달하는 실행 환경을 제공합니다.

Tomcat이 요청을 Servlet 요청 객체로 만들고, 요청에 적용할 Servlet `FilterChain`을 거쳐 대상 Servlet인 Spring MVC의 `DispatcherServlet`을 호출합니다.

---

# Spring과의 관계

Tomcat은 Spring Framework의 구성 요소가 아니라 `독립적인 Apache 프로젝트`입니다. Spring Boot는 기본 내장 Servlet Container로 함께 실행되는 경우가 많지만, Jetty나 Undertow 같은 다른 Servlet Container를 사용할 수도 있습니다.

Spring Container와 Tomcat도 역할이 다릅니다.

- Tomcat의 Servlet Container: HTTP 요청, Servlet, Filter와 웹 애플리케이션 lifecycle 관리
- Spring Container: 애플리케이션 Bean 생성, 의존성 주입과 Bean lifecycle 관리

---

# 참고 자료

- [Apache Tomcat — Introduction](https://tomcat.apache.org/tomcat-11.0-doc/introduction.html)
- [Apache Tomcat — Architecture Overview](https://tomcat.apache.org/tomcat-11.0-doc/architecture/index.html)
- [Spring Boot — Embedded Web Servers](https://docs.spring.io/spring-boot/reference/web/servlet.html#web.servlet.embedded-container)
