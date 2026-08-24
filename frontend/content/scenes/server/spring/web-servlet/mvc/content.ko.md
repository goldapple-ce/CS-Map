# 한눈에 보기

Spring MVC는 요청에 맞는 Controller를 찾아 실행하고, Controller의 결과를 HTTP 응답으로 만드는 Web Framework입니다.

`DispatcherServlet`이 중심에서 요청 흐름을 조정하지만 모든 작업을 직접 하지는 않습니다. Controller 조회, 실행, 실행 전후 처리와 View 선택을 역할별 구성 요소에 맡깁니다.

---

# 구성 요소

- `DispatcherServlet`: Spring MVC 요청 처리의 시작점이며 전체 순서를 조정합니다.
- `HandlerMapping`: 현재 요청을 처리할 Controller와 적용할 HandlerInterceptor를 찾습니다.
- `HandlerInterceptor`: Controller 실행 전후에 공통 처리를 적용합니다.
- `HandlerAdapter`: 선택된 Controller를 실제로 호출할 수 있게 합니다.
- `Controller`: 요청에 맞는 애플리케이션 기능을 실행합니다.
- `Model`: View가 화면을 만들 때 사용할 데이터를 담습니다.
- `ViewResolver`: 논리적인 View 이름을 실제 View로 찾습니다.
- `View / HTML 렌더링`: 선택된 View가 Model을 이용해 응답 HTML을 만듭니다.

Spring MVC 내부에서는 Controller를 포함해 실행할 대상을 더 일반적인 이름인 `Handler`라고 부릅니다. 뷰포트에서는 초보자가 이해하기 쉽도록 대표적인 Handler인 Controller로 표시했습니다.

---

# 전체 흐름

1. DispatcherServlet이 HandlerMapping에 현재 요청을 처리할 Controller를 조회합니다.
2. HandlerMapping이 Controller와 적용할 HandlerInterceptor들을 `HandlerExecutionChain`으로 묶어 DispatcherServlet에 반환합니다.
3. DispatcherServlet이 HandlerExecutionChain에서 Controller를 꺼내고, 이를 실행할 HandlerAdapter를 찾습니다.
4. DispatcherServlet이 `HandlerExecutionChain`을 통해 Interceptor가 실행합니다.
5. 모든 요청을 허용하면 DispatcherServlet이 HandlerExecutionChain에서 꺼낸 Controller만 HandlerAdapter에 전달합니다.
6. Controller가 반환한 View 이름을 ViewResolver가 실제 View로 찾습니다.
7. View가 Model을 사용해 HTML을 렌더링합니다.

---

# 개발자가 개입하는 지점

개발자는 Spring MVC에서 다음 부분을 주로 작성하거나 설정합니다.

- `@Controller`, `@RestController`와 요청 처리 method 작성
- `HandlerInterceptor` 구현과 적용 URL 등록
- argument resolver, return value handler와 message converter 확장
- ViewResolver와 template engine 설정
- 예외 처리를 위한 `@ControllerAdvice` 작성

---

# 꼭 알아둘 점

## Handler는 Controller보다 넓은 표현입니다

Spring MVC 내부의 Handler는 DispatcherServlet이 실행할 수 있는 대상 전체를 뜻합니다. annotation 기반 애플리케이션에서는 대부분 Controller method이므로 뷰포트에서는 Controller로 표현합니다.

## Interceptor는 Handler를 직접 호출하지 않습니다

DispatcherServlet이 HandlerExecutionChain을 통해 Interceptor lifecycle을 실행하고, HandlerAdapter를 통해 Controller를 호출합니다. 뷰포트의 지원선은 이 실행 전후 관계를 단순화한 것입니다.

HandlerAdapter도 HandlerExecutionChain 전체를 받지 않습니다. DispatcherServlet이 Chain에서 꺼낸 Controller를 HandlerAdapter의 Handler 인자로 전달합니다.

## REST 응답은 ViewResolver를 거치지 않을 수 있습니다

`@ResponseBody`와 `@RestController`는 일반적으로 HttpMessageConverter가 response body를 작성합니다. 현재 뷰포트는 서버 측 View를 반환하는 흐름을 보여줍니다.

---

# 참고 자료

- [Spring Framework — DispatcherServlet](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-servlet.html)
- [Spring Framework — DispatcherServlet Processing](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-servlet/sequence.html)
- [Spring Framework — Interception](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-servlet/handlermapping-interceptor.html)
