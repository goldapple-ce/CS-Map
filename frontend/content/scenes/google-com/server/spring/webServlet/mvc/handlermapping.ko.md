# 개요

`HandlerMapping`은 현재 HTTP 요청을 처리할 handler를 찾는 전략 interface입니다. annotation 기반 MVC에서는 보통 request mapping 정보를 이용해 알맞은 Controller method를 선택합니다.

조회 결과에는 handler뿐 아니라 요청 전후에 실행할 interceptor chain도 포함될 수 있습니다. DispatcherServlet은 등록된 HandlerMapping들을 순서대로 확인해 처리 가능한 결과를 찾습니다.

HandlerMapping은 Controller를 직접 실행하지 않습니다. 선택 결과를 반환하고, 실제 호출은 해당 handler 유형을 지원하는 `HandlerAdapter`가 담당합니다.

# 참고 자료

- [Spring Framework — HandlerMapping API](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/web/servlet/HandlerMapping.html)
