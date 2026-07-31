## 개요

Tomcat은 HTTP 요청을 받은 뒤 protocol 처리와 Servlet Container의 요청 pipeline을 거쳐 애플리케이션의 Filter와 Servlet로 전달합니다. 이 Scene은 Spring MVC의 `DispatcherServlet`에 도달하는 지점까지만 표시합니다.

## 필요한 이유

Spring MVC Controller가 호출되기 전에 socket 연결, HTTP parsing과 Servlet request 구성은 Tomcat 같은 Servlet Container가 담당합니다. 이 경계를 알면 네트워크 연결 문제와 Spring handler 문제를 구분할 수 있습니다.

## 동작 과정

1. Connector의 Endpoint가 네트워크 연결과 데이터를 받습니다.
2. Protocol Processor가 HTTP protocol을 처리합니다.
3. CoyoteAdapter가 connector 영역과 Catalina Servlet 처리 영역을 연결합니다.
4. Servlet Container가 대상 web application과 Servlet mapping을 찾습니다.
5. 설정된 Servlet FilterChain이 요청을 순서대로 전달합니다.
6. FilterChain을 통과한 요청이 Spring MVC의 `DispatcherServlet`에 도달합니다.

## 내부 구조

Tomcat 공식 구조에서 요청은 Endpoint, protocol 처리와 CoyoteAdapter를 거쳐 Servlet request processing으로 이어집니다. 실제 Connector 구현과 비동기 요청 흐름은 설정과 protocol에 따라 달라질 수 있으므로 화면은 동기 HTTP 요청의 핵심 경계를 단순화합니다.

## 실패 상황

- Connector가 port에 bind하지 못하거나 연결을 받지 못할 수 있습니다.
- 잘못된 HTTP 메시지나 크기 제한 때문에 protocol 단계에서 거부될 수 있습니다.
- web application, Servlet mapping 또는 Filter 설정이 요청과 맞지 않을 수 있습니다.
- Filter가 다음 chain을 호출하지 않아 DispatcherServlet에 도달하지 않을 수 있습니다.

## 범위

응답이 Tomcat을 통해 클라이언트로 돌아가는 경로는 이번 Scene에서 제외합니다.

## 출처

- Apache Tomcat, _Request Process Flow_
- Apache Tomcat, _Architecture Overview_

## 참고 자료

- [Apache Tomcat — Request Process Flow](https://tomcat.apache.org/tomcat-11.0-doc/architecture/requestProcess.html)
- [Apache Tomcat — Architecture Overview](https://tomcat.apache.org/tomcat-11.0-doc/architecture/index.html)
