# 한눈에 보기

`ViewResolver`는 Controller가 반환한 논리적인 View 이름을 실제 `View` 객체로 찾습니다.

예를 들어 `users/detail`이라는 이름을 Thymeleaf template이나 JSP를 렌더링할 View로 연결할 수 있습니다.

---

# 동작 방식

1. Controller가 논리적인 View 이름을 반환합니다.
2. DispatcherServlet이 ViewResolver에 View 이름을 전달합니다.
3. ViewResolver가 이름을 처리할 실제 View를 반환합니다.
4. View가 Model을 사용해 결과를 렌더링합니다.

ViewResolver가 HTML을 직접 만드는 것은 아닙니다. 실제 렌더링은 선택된 View가 담당합니다.

---

# 개발자가 개입하는 지점

Spring Boot가 template engine에 맞는 ViewResolver를 자동 구성하는 경우가 많아 직접 구현할 지점은 많지 않습니다.

개발자는 template 위치, prefix·suffix와 ViewResolver 순서 등을 설정할 수 있습니다. 특별한 View 이름 해석 규칙이 필요하면 custom ViewResolver를 구현할 수도 있습니다.

다만 이 구조를 알면 View 이름은 반환됐지만 template을 찾지 못하는 문제를 추적하는 데 도움이 됩니다.

---

# 헷갈리기 쉬운 점

`@RestController`와 `@ResponseBody`는 일반적으로 ViewResolver를 사용하지 않고 HttpMessageConverter가 response body를 작성합니다.

---

# 참고 자료

- [Spring Framework — View Resolution](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-servlet/viewresolver.html)
