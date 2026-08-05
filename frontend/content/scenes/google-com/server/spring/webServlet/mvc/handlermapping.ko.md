# 한눈에 보기

`HandlerMapping`은 현재 요청을 처리할 Controller와 함께 적용할 HandlerInterceptor들을 찾습니다.

Spring MVC 내부에서는 Controller를 포함한 실행 대상을 `Handler`라고 부릅니다. annotation 기반 애플리케이션에서는 보통 Controller method를 나타내는 `HandlerMethod`가 선택됩니다.

---

# 동작 방식

애플리케이션 시작 시 `RequestMappingHandlerMapping`이 `@RequestMapping`, `@GetMapping` 같은 정보를 읽어 요청과 Controller method의 mapping을 등록합니다.

요청이 들어오면 다음 작업을 수행합니다.

1. 요청 경로와 HTTP method에 맞는 HandlerMethod를 찾습니다.
2. 현재 요청 경로에 적용할 HandlerInterceptor들을 고릅니다.
3. Handler와 Interceptor 목록을 `HandlerExecutionChain`으로 묶습니다.
4. HandlerExecutionChain을 DispatcherServlet에 반환합니다.

DispatcherServlet은 Chain에서 Handler를 꺼내 HandlerAdapter에 전달하고, Interceptor lifecycle은 Chain을 통해 별도로 실행합니다.

---

# 개발자가 개입하는 지점

개발자는 Controller method에 mapping annotation을 작성해 HandlerMapping이 찾을 정보를 등록합니다.

```java
@GetMapping("/users/{id}")
UserResponse getUser(@PathVariable Long id) {
    return userService.getUser(id);
}
```

custom HandlerMapping을 만들 수도 있지만 일반적인 annotation 기반 애플리케이션에서는 직접 구현할 일이 거의 없습니다.

다만 이 구조를 알면 mapping 충돌, 잘못된 HTTP method와 요청에 맞는 Controller를 찾지 못하는 문제를 추적하는 데 도움이 됩니다.

---

# 헷갈리기 쉬운 점

HandlerMapping은 Controller를 실행하지 않습니다. 실행할 대상과 Interceptor를 찾아 반환하고, 실제 Controller 호출은 HandlerAdapter가 담당합니다.

---

# 참고 자료

- [Spring Framework — HandlerMapping API](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/web/servlet/HandlerMapping.html)
- [Spring Framework — Request Mapping](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-requestmapping.html)
