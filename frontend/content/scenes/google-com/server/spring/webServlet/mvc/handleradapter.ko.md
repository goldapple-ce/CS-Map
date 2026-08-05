# 한눈에 보기

`HandlerAdapter`는 HandlerMapping이 선택한 Handler를 실제로 실행할 수 있게 하는 adapter입니다.

뷰포트에서는 대표적인 Handler인 Controller를 호출하는 구성 요소로 표시합니다.

---

# 동작 방식

DispatcherServlet은 HandlerExecutionChain에서 Handler를 꺼낸 뒤, 등록된 HandlerAdapter 중 해당 Handler type을 지원하는 Adapter를 찾습니다.

annotation 기반 Controller에서는 보통 `RequestMappingHandlerAdapter`가 다음 작업을 조정합니다.

- Controller method parameter 값 해석
- type 변환과 validation
- Controller method 호출
- 반환값을 ModelAndView나 response body 처리로 연결

HandlerAdapter가 받는 것은 HandlerExecutionChain 전체가 아니라 Chain에서 꺼낸 Handler입니다. Interceptor 호출은 DispatcherServlet이 HandlerExecutionChain을 통해 별도로 조정합니다.

---

# 개발자가 개입하는 지점

일반적인 annotation 기반 MVC에서 개발자가 HandlerAdapter를 직접 구현하거나 호출할 지점은 없습니다.

특별한 method parameter나 반환값 처리가 필요하면 전체 Adapter를 바꾸기보다 `HandlerMethodArgumentResolver`, return value handler 또는 HttpMessageConverter를 확장하는 경우가 많습니다.

다만 이 구조를 알면 Controller method는 찾았지만 parameter 변환이나 반환값 처리에서 실패하는 문제를 추적하는 데 도움이 됩니다.

---

# 헷갈리기 쉬운 점

Tomcat의 CoyoteAdapter와 이름만 비슷할 뿐 관계없는 Spring MVC 구성 요소입니다.

---

# 참고 자료

- [Spring Framework — HandlerAdapter API](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/web/servlet/HandlerAdapter.html)
