# 한눈에 보기

Spring MVC의 `Model`은 View가 화면을 만들 때 사용할 데이터를 담습니다.

Controller는 사용자 이름, 상품 목록처럼 View에 보여줄 값을 이름과 함께 Model에 추가합니다.

---

# 동작 방식

```java
@GetMapping("/users/{id}")
String getUser(@PathVariable Long id, Model model) {
    model.addAttribute("user", userService.getUser(id));
    return "users/detail";
}
```

Controller가 반환한 `users/detail`은 논리적인 View 이름이고, Model의 `user`는 선택된 View가 렌더링할 때 사용하는 데이터입니다.

---

# 개발자가 개입하는 지점

개발자는 Controller에서 View에 필요한 attribute를 Model에 추가합니다.

민감한 정보나 View에서 사용하지 않는 큰 객체를 그대로 넣으면 의도하지 않은 정보 노출이나 성능 문제로 이어질 수 있으므로 필요한 데이터만 제공하는 것이 좋습니다.

---

# 헷갈리기 쉬운 점

Model은 HTML도 아니고 HTTP response body도 아닙니다. View가 결과를 만들 때 사용할 데이터 묶음입니다.

REST Controller가 객체를 response body로 바로 반환하는 흐름에서는 이 View Model을 사용하지 않을 수 있습니다.

---

# 참고 자료

- [Spring Framework — Model API](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/ui/Model.html)
