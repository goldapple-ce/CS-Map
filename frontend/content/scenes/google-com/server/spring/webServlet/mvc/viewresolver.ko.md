# 개요

`ViewResolver`는 Controller가 반환한 논리적인 View 이름을 실제 `View` 구현으로 해석하는 전략 interface입니다.

예를 들어 논리 이름 `users/detail`을 template file이나 View 객체에 연결할 수 있습니다. 여러 ViewResolver를 등록하면 order와 지원 조건에 따라 적절한 View를 찾습니다.

ViewResolver는 Model data로 HTML을 직접 만드는 주체가 아닙니다. 실제 rendering은 선택된 View가 수행합니다. REST Controller처럼 response body를 직접 작성하는 흐름에서는 일반적으로 ViewResolver를 사용하지 않습니다.

# 참고 자료

- [Spring Framework — View Resolution](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-servlet/viewresolver.html)
