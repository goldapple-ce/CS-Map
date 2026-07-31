# 개요

View는 Model data를 특정 표현 기술에 적용해 response content를 만드는 역할입니다. JSP, Thymeleaf 같은 server-side template을 사용하면 결과로 HTML이 생성될 수 있습니다.

Scene의 `View / HTML 렌더링`은 server가 HTML text를 만드는 지점까지를 뜻합니다. 이 HTML을 network로 전송하는 일은 Servlet Container가 담당하고, 받은 HTML을 parsing해 화면에 그리는 일은 browser가 담당합니다.

redirect View처럼 HTML body를 rendering하지 않는 View도 있으므로 모든 View 결과가 HTML 문서인 것은 아닙니다.

# 참고 자료

- [Spring Framework — View Technologies](https://docs.spring.io/spring-framework/reference/web/webmvc-view.html)
