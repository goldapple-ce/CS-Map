# 개요

`HandlerAdapter`는 HandlerMapping이 선택한 handler를 DispatcherServlet이 일관된 방식으로 실행할 수 있게 하는 전략 interface입니다.

handler의 실제 형태는 annotation 기반 Controller method, `HttpRequestHandler` 등으로 다를 수 있습니다. DispatcherServlet은 `supports()` 결과를 바탕으로 알맞은 Adapter를 고르고 실행을 맡깁니다.

annotation 기반 Controller에서는 Adapter가 argument resolution, type conversion, validation과 return value 처리를 조정합니다. 이름이 비슷한 Tomcat의 `CoyoteAdapter`와는 관계없는 Spring MVC 구성 요소입니다.

# 참고 자료

- [Spring Framework — HandlerAdapter API](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/web/servlet/HandlerAdapter.html)
