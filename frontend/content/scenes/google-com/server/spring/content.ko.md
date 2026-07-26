## 개요

이 Scene은 Tomcat이 HTTP 요청을 Servlet 요청으로 처리한 뒤 Spring 기반 애플리케이션으로 전달하는 일반적인 구성을 보여줍니다. Tomcat과 Spring 생태계를 각각 선택하면 요청이 내부에서 어디로 이어지는지 더 자세히 볼 수 있습니다.

## 필요한 이유

Tomcat은 네트워크와 Servlet 실행 환경을 제공하고, Spring Security와 Spring MVC는 그 위에서 보안 검사와 애플리케이션 요청 분배를 담당할 수 있습니다. Spring Container는 이 처리에 참여할 객체를 애플리케이션 시작 시 생성하고 연결합니다.

## 동작 과정

1. Tomcat이 HTTP 연결과 protocol 처리를 수행합니다.
2. HTTP 정보를 Servlet API의 request 객체로 연결합니다.
3. Servlet FilterChain이 Spring Security filter와 Spring MVC의 `DispatcherServlet`로 요청을 전달할 수 있습니다.
4. Spring MVC가 Controller와 Service까지 요청을 전달합니다.
5. 서버 측 View를 반환하는 Controller라면 논리적인 View 이름을 실제 View로 해석하고 Model을 이용해 HTML을 렌더링합니다.

## 내부 구조

Tomcat은 Spring Framework의 구성 요소가 아니며 독립적인 Servlet Container입니다. Spring Boot 애플리케이션에서 내장 Tomcat으로 함께 사용될 수 있지만 모든 Spring 애플리케이션이 Tomcat이나 Servlet stack을 사용하는 것은 아닙니다.

Spring Security는 Spring 생태계의 별도 프로젝트이고, Spring MVC와 Spring Container는 Spring Framework가 제공하는 영역입니다. 이 지도는 이 차이를 유지하면서 하나의 Servlet 기반 요청 맥락에서 연결합니다.

## 범위

Spring MVC 하위 Scene은 서버 측 View를 반환하는 경로의 ViewResolver와 HTML 렌더링까지 설명합니다. REST의 `@ResponseBody`와 HttpMessageConverter, HTTP 전송 이후의 브라우저 렌더링은 다루지 않습니다.

## 출처

- Apache Tomcat, _Request Process Flow_
- Spring Security, _Servlet Architecture_
- Spring Framework, _DispatcherServlet_

## 지도 참고

- Tomcat과 Servlet 기반 Spring 구성을 연결한 일반적인 학습 예시이며 모든 Spring 애플리케이션이 Tomcat을 사용하는 것은 아닙니다.

## 참고 자료

- [Apache Tomcat — Request Process Flow](https://tomcat.apache.org/tomcat-11.0-doc/architecture/requestProcess.html)
- [Spring Security — Servlet Architecture](https://docs.spring.io/spring-security/reference/servlet/architecture.html)
- [Spring Framework — DispatcherServlet](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-servlet.html)
