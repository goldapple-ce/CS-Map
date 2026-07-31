## 개요

Spring MVC는 `DispatcherServlet`을 front controller로 사용합니다. `DispatcherServlet`이 handler 조회, Controller 실행과 View 선택을 직접 수행하는 대신 `HandlerMapping`, `HandlerAdapter`, `ViewResolver`에 각 역할을 위임하고 전체 순서를 조정합니다.

## 필요한 이유

요청 경로 선택, 여러 종류의 handler 실행과 View 기술 선택을 각각의 전략 인터페이스로 분리하면 Controller가 Servlet infrastructure나 JSP, Thymeleaf 같은 특정 View 기술에 직접 결합되는 것을 줄일 수 있습니다.

## 동작 과정

1. `DispatcherServlet`이 Servlet 요청을 받은 상태에서 흐름을 시작합니다.
2. `DispatcherServlet`이 `HandlerMapping`에 현재 요청을 처리할 handler를 조회합니다.
3. `HandlerMapping`이 선택한 handler와 interceptor chain을 반환합니다. 화면의 점선은 선택 결과와 Controller의 대응 관계를 축약해 표시합니다.
4. `DispatcherServlet`이 handler 형태를 실행할 수 있는 `HandlerAdapter`를 선택합니다.
5. `HandlerAdapter`가 Controller를 호출합니다.
6. Controller가 애플리케이션 작업을 수행한 뒤 Model과 논리적인 View 이름을 처리 결과로 반환합니다. 화면에서는 DispatcherServlet로 되돌아오는 중간 왕복선을 생략하고 ViewResolver 방향의 점선으로 축약합니다.
7. `DispatcherServlet`이 View 이름을 `ViewResolver`에 전달합니다.
8. `ViewResolver`가 실제 `View`를 선택하고, DispatcherServlet 아래의 View가 Model을 적용해 HTML을 렌더링합니다.

## 화면의 선 구분

- 실선은 요청 조회, handler 실행과 View 선택처럼 다음 처리를 호출하는 방향입니다.
- 점선 return edge는 선택된 Handler, View 이름과 Model 같은 호출 결과입니다. 선 겹침을 줄이기 위해 DispatcherServlet로 되돌아오는 일부 중간 구간은 목적지 관계로 축약합니다.
- Model에서 View로 향하는 점선은 선택된 View가 렌더링에 사용할 데이터를 제공하는 지원 관계입니다.
- ViewResolver와 Model에서 View로 향하는 두 점선은 서로 다른 접속면을 사용해 겹침을 줄입니다.

## 내부 구조

`HandlerMapping`은 요청과 handler 사이의 매핑을 찾고, `HandlerAdapter`는 선택된 handler를 실제로 호출할 수 있게 합니다. `ViewResolver`는 논리적인 View 이름을 실제 `View`로 해석하며, `View`는 Model 데이터를 구체적인 View 기술에 적용합니다.

화면은 전통적인 서버 측 View Controller 경로를 단순화한 것입니다. 모든 Controller가 View 이름을 반환하는 것은 아닙니다. `@ResponseBody`나 REST Controller는 일반적으로 HttpMessageConverter 경로를 사용하므로 이 ViewResolver 흐름과 구분해야 합니다.

## 실패 상황

- 요청에 맞는 handler를 찾지 못할 수 있습니다.
- 선택된 handler를 실행할 HandlerAdapter가 없을 수 있습니다.
- Controller의 입력 변환, validation 또는 애플리케이션 처리에서 예외가 발생할 수 있습니다.
- ViewResolver가 논리적인 View 이름에 맞는 View를 찾지 못할 수 있습니다.
- template이나 Model 데이터 문제로 View 렌더링이 실패할 수 있습니다.

## 범위

이 Scene은 서버가 HTML을 렌더링하는 지점까지 다룹니다. 렌더링 결과의 HTTP 전송과 브라우저의 HTML parsing·화면 렌더링은 포함하지 않습니다.

## 출처

- Spring Framework, _DispatcherServlet_
- Spring Framework, _DispatcherServlet Processing_
- Spring Framework, _View Resolution_
- Spring Framework, _View Technologies_

## 참고 자료

- [Spring Framework — DispatcherServlet](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-servlet.html)
- [Spring Framework — DispatcherServlet Processing](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-servlet/sequence.html)
- [Spring Framework — View Resolution](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-servlet/viewresolver.html)
- [Spring Framework — View Technologies](https://docs.spring.io/spring-framework/reference/web/webmvc-view.html)
