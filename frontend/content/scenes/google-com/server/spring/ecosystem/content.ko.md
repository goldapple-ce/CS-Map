# Spring 생태계의 요청 처리

## 개요

Servlet 요청은 Spring Security가 구성된 애플리케이션에서 보안 FilterChain을 거친 뒤 Spring MVC의 `DispatcherServlet`로 전달될 수 있습니다. Spring Container는 이 요청보다 먼저 필요한 Bean을 생성하고 의존성을 연결합니다.

## 필요한 이유

요청 순서와 객체 생명주기를 같은 흐름으로 보면 Container가 매 요청마다 모든 객체를 만드는 것처럼 오해할 수 있습니다. 화면의 실선은 요청 전달, 점선은 애플리케이션 시작 시 준비된 Bean의 지원 관계를 뜻합니다.

## 동작 과정

1. Spring Container가 설정 정보를 바탕으로 Security와 MVC Bean을 준비합니다.
2. Servlet FilterChain에 들어온 요청을 Spring Security가 검사합니다.
3. 허용된 요청이 Spring MVC의 `DispatcherServlet`로 전달됩니다.
4. Spring MVC가 요청에 맞는 Controller와 Service를 호출합니다.
5. 서버 측 View 경로라면 Controller가 반환한 View 이름을 해석하고 Model을 이용해 HTML을 렌더링합니다.

## 내부 구조

Spring Security는 Spring 생태계의 별도 프로젝트입니다. Spring MVC와 IoC Container는 Spring Framework의 일부입니다. 세 영역은 같은 애플리케이션에서 함께 사용될 수 있지만 역할과 실행 시점이 다릅니다.

## 범위

요청 전달의 상세와 서버 측 View의 ViewResolver·HTML 렌더링은 Spring MVC 하위 Scene에서 다룹니다. REST의 HttpMessageConverter, HTTP 전송과 브라우저 렌더링은 제외합니다.

## 출처

- Spring Security, _Servlet Architecture_
- Spring Framework, _DispatcherServlet_
- Spring Framework, _Container Overview_

## 참고 자료

- [Spring Security — Servlet Architecture](https://docs.spring.io/spring-security/reference/servlet/architecture.html)
- [Spring Framework — DispatcherServlet](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-servlet.html)
- [Spring Framework — Container Overview](https://docs.spring.io/spring-framework/reference/core/beans/basics.html)
