# 개요

HTTP 요청은 client가 server에 method, target, header와 선택적인 body를 전송하는 message입니다. Tomcat은 network connection에서 이 byte stream을 받아 HTTP 규칙에 맞게 해석합니다.

이 시점의 요청은 아직 Spring MVC의 Controller 호출이 아닙니다. Connector와 protocol 처리, Servlet mapping과 FilterChain을 거쳐야 `DispatcherServlet`에 도달합니다.

요청 형식이 잘못됐거나 header·body 크기 제한을 넘으면 Spring에 도달하기 전에 Tomcat에서 거부될 수 있습니다.

# 참고 자료

- [RFC 9110 — HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110)
- [Apache Tomcat — Request Process Flow](https://tomcat.apache.org/tomcat-11.0-doc/architecture/requestProcess.html)
