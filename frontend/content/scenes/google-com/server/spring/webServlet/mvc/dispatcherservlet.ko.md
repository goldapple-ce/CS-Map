# 개요

`DispatcherServlet`은 Spring MVC의 front controller입니다. Servlet Container로부터 요청을 받은 뒤 handler 조회, 실행과 response 생성을 여러 전략 객체에 위임하며 전체 흐름을 조정합니다.

요청에 맞는 handler는 `HandlerMapping`에서 찾고, 선택한 handler는 이를 지원하는 `HandlerAdapter`가 실행합니다. 서버 측 View 응답이면 논리적인 View 이름을 `ViewResolver`로 해석하고 Model을 적용해 rendering합니다.

모든 응답이 ViewResolver를 거치는 것은 아닙니다. `@ResponseBody`와 REST Controller는 일반적으로 `HttpMessageConverter`를 이용해 response body를 작성합니다.

# 참고 자료

- [Spring Framework — DispatcherServlet](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-servlet.html)
