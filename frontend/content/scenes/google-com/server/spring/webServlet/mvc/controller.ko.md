# 개요

Controller는 HTTP 요청을 애플리케이션의 use case에 연결하는 웹 계층 구성 요소입니다. 요청 값을 받고 Service 같은 애플리케이션 객체에 작업을 위임한 뒤 MVC가 처리할 결과를 반환합니다.

서버 측 View 방식에서는 Model data와 논리적인 View 이름을 반환할 수 있습니다. REST 방식에서는 `@ResponseBody` 또는 `@RestController`를 이용해 객체를 response body로 변환할 수 있습니다.

Controller가 connection, Servlet Filter나 View rendering을 직접 관리할 필요는 없습니다. 해당 책임은 Tomcat, FilterChain과 Spring MVC infrastructure가 담당합니다.

# 참고 자료

- [Spring Framework — Annotated Controllers](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller.html)
