# 한눈에 보기

Controller는 HTTP 요청을 애플리케이션 기능에 연결하는 웹 계층 구성 요소입니다.

요청 값을 받은 뒤 Service 같은 객체에 작업을 맡기고, Spring MVC가 응답으로 처리할 결과를 반환합니다.

---

# 동작 방식

annotation 기반 Controller method는 요청 경로, HTTP method와 parameter 조건에 따라 HandlerMapping에 등록됩니다.

HandlerAdapter가 method parameter를 준비하고 Controller를 호출합니다. Controller는 다음과 같은 결과를 반환할 수 있습니다.

- View 이름과 Model
- `@ResponseBody`로 변환할 객체
- `ResponseEntity`
- redirect 결과

---

# 개발자가 개입하는 지점

Controller는 개발자가 직접 작성하는 핵심 지점입니다.

```java
@RestController
@RequestMapping("/users")
class UserController {

    @GetMapping("/{id}")
    UserResponse getUser(@PathVariable Long id) {
        return userService.getUser(id);
    }
}
```

Controller에는 HTTP 요청과 응답을 애플리케이션 기능으로 연결하는 책임을 두고, 복잡한 비즈니스 로직은 Service 등에 분리하는 것이 좋습니다.

---

# 헷갈리기 쉬운 점

Spring MVC 내부에서는 Controller method를 `Handler` 또는 `HandlerMethod`라고 부를 수 있습니다. 뷰포트에서는 이해하기 쉬운 Controller 표현을 사용합니다.

---

# 참고 자료

- [Spring Framework — Annotated Controllers](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller.html)
