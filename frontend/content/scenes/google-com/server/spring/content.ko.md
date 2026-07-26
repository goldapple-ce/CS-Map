## 개요

이 Scene은 Tomcat이 HTTP 요청을 Servlet 요청으로 처리하고 Servlet FilterChain을 거쳐 최종 Servlet인 `DispatcherServlet`로 전달하는 일반적인 구성을 보여줍니다. Servlet FilterChain을 선택하면 Spring Security가 FilterChain 안에서 연결되는 방식을, DispatcherServlet을 선택하면 Spring MVC의 내부 요청 처리를 자세히 볼 수 있습니다.

## 필요한 이유

Tomcat은 네트워크와 Servlet 실행 환경을 제공하고 설정된 Filter와 대상 Servlet을 하나의 FilterChain으로 호출합니다. Spring Security는 이 FilterChain에 연결되어 보안 검사를 수행하고, Spring MVC의 `DispatcherServlet`은 FilterChain 뒤에서 애플리케이션 요청 분배를 시작합니다. Spring Container는 이 처리에 참여할 Bean을 애플리케이션 시작 시 생성하고 연결합니다.

## 동작 과정

1. Tomcat이 HTTP 연결과 protocol 처리를 수행합니다.
2. Servlet Container가 요청에 적용할 Filter와 대상 Servlet로 Servlet FilterChain을 구성하고 호출합니다.
3. FilterChain 안의 `DelegatingFilterProxy`가 Spring Security의 `FilterChainProxy`와 `SecurityFilterChain`으로 보안 처리를 위임할 수 있습니다.
4. FilterChain이 계속 진행되면 대상 Servlet인 Spring MVC의 `DispatcherServlet`을 호출합니다.
5. DispatcherServlet이 Controller와 Service까지 요청을 전달합니다.
6. 서버 측 View를 반환하는 Controller라면 논리적인 View 이름을 실제 View로 해석하고 Model을 이용해 HTML을 렌더링합니다.

## 내부 구조

Tomcat은 Spring Framework의 구성 요소가 아니며 독립적인 Servlet Container입니다. Spring Boot 애플리케이션에서 내장 Tomcat으로 함께 사용될 수 있지만 모든 Spring 애플리케이션이 Tomcat이나 Servlet stack을 사용하는 것은 아닙니다.

Spring Security는 Spring 생태계의 별도 프로젝트이고 Servlet FilterChain 안의 `DelegatingFilterProxy`를 통해 Spring Bean인 `FilterChainProxy`로 연결됩니다. Spring MVC와 Spring Container는 Spring Framework가 제공하는 영역이며, `DispatcherServlet`은 Spring MVC 요청 처리의 진입점입니다.

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
