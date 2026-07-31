# 개요

`CoyoteAdapter`는 Tomcat의 Coyote Connector 영역과 Catalina Servlet Container 영역을 연결합니다.

Protocol Processor가 다루는 낮은 수준의 request·response를 Servlet 처리에 사용할 수 있는 Tomcat request·response로 연결하고, Catalina pipeline에 처리를 넘깁니다. 따라서 HTTP parsing이 끝난 요청이 web application, Filter와 Servlet을 찾는 단계로 들어가는 경계입니다.

Spring의 Adapter가 아니라 Tomcat 내부 구성 요소이며, Spring MVC의 `HandlerAdapter`와는 이름만 비슷할 뿐 역할이 다릅니다.

# 참고 자료

- [Apache Tomcat — Request Process Flow](https://tomcat.apache.org/tomcat-11.0-doc/architecture/requestProcess.html)
