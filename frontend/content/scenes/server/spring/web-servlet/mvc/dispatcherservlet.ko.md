# 한눈에 보기

`DispatcherServlet`은 Spring MVC 요청 처리의 시작점이며 전체 순서를 조정하는 Front Controller입니다.

요청에 맞는 Controller를 직접 찾거나 실행하지 않고 HandlerMapping, HandlerExecutionChain, HandlerAdapter와 ViewResolver에 역할을 나누어 맡깁니다.

---

# 동작 방식

1. HandlerMapping에서 Controller와 Interceptor가 담긴 HandlerExecutionChain을 받습니다.
2. Chain에서 Controller를 꺼내 이를 지원하는 HandlerAdapter를 찾습니다.
3. Chain을 통해 Interceptor의 preHandle을 실행합니다.
4. HandlerAdapter에 Controller를 전달해 실행합니다.
5. 실행 후 Interceptor의 postHandle을 호출합니다.
6. View 응답이면 ViewResolver로 실제 View를 찾고 렌더링합니다.
7. 처리가 끝나면 Interceptor의 afterCompletion을 호출합니다.

---

# 개발자가 개입하는 지점

일반적인 Spring Boot 애플리케이션에서 개발자가 DispatcherServlet을 직접 생성하거나 호출할 지점은 없습니다.

개발자는 Controller, Interceptor, ViewResolver, message converter와 예외 처리처럼 DispatcherServlet이 사용하는 구성 요소를 작성하거나 설정합니다.

다만 이 흐름을 알면 요청이 Controller에 도달하지 않거나, Controller 결과가 예상한 응답으로 변환되지 않는 문제를 어느 단계에서 확인해야 하는지 판단하는 데 도움이 됩니다.

---

# 헷갈리기 쉬운 점

DispatcherServlet은 비즈니스 로직을 실행하지 않습니다. MVC 구성 요소의 호출 순서를 조정합니다.

`@RestController`와 `@ResponseBody` 응답은 일반적으로 ViewResolver 대신 HttpMessageConverter를 통해 response body로 작성됩니다.

---

# 참고 자료

- [Spring Framework — DispatcherServlet](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-servlet.html)
