# 한눈에 보기

`HandlerInterceptor`는 Spring MVC가 선택한 Controller를 실행하기 전후에 공통 처리를 적용하는 구성 요소입니다.

로그 기록, 요청별 공통 검사와 실행 시간 측정처럼 여러 Controller에 반복되는 웹 계층 처리를 한곳에 모을 수 있습니다.

---

# 동작 방식

- `preHandle()`: Controller 실행 전에 호출됩니다. `false`를 반환하면 뒤쪽 Interceptor와 Controller를 실행하지 않습니다.
- `postHandle()`: Controller 실행 후, View 렌더링 전에 호출됩니다.
- `afterCompletion()`: View 렌더링과 예외 처리를 포함한 요청 처리가 끝난 후 호출됩니다.

HandlerMapping은 선택된 Controller와 적용할 Interceptor들을 `HandlerExecutionChain`으로 묶어 반환합니다. DispatcherServlet이 이 Chain에 lifecycle 실행을 요청하고, Chain이 등록된 Interceptor들을 순서대로 호출합니다.

---

# 개발자가 개입하는 지점

개발자는 HandlerInterceptor를 구현하고 적용할 요청 경로를 등록할 수 있습니다.

```java
@Configuration
class WebConfig implements WebMvcConfigurer {

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new LoggingInterceptor())
            .addPathPatterns("/api/**")
            .excludePathPatterns("/api/public/**");
    }
}
```

- `addPathPatterns()`: Interceptor를 적용할 경로를 정합니다.
- `excludePathPatterns()`: 적용에서 제외할 경로를 정합니다.
- 여러 Interceptor가 있으면 등록 순서가 preHandle 실행 순서에 영향을 줍니다.

---

# 헷갈리기 쉬운 점

## Servlet Filter와 다릅니다

Servlet Filter는 DispatcherServlet보다 앞에서 동작합니다. HandlerInterceptor는 HandlerMapping이 Controller를 선택한 뒤 Spring MVC 안에서 동작하므로 선택된 Controller 정보를 사용할 수 있습니다.

## 보안 계층으로 사용하기에는 적합하지 않습니다

인증과 인가는 Controller mapping보다 앞에서 일관되게 적용되는 Spring Security와 Servlet FilterChain을 사용하는 것이 좋습니다.

## Spring AOP가 아닙니다

HandlerInterceptor는 DispatcherServlet과 HandlerExecutionChain이 호출하는 Spring MVC 확장 지점입니다. Spring AOP는 Proxy를 통해 Spring Bean method 호출을 가로챕니다.

---

# 참고 자료

- [Spring Framework — Interception](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-servlet/handlermapping-interceptor.html)
- [Spring Framework — HandlerInterceptor API](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/web/servlet/HandlerInterceptor.html)
- [Spring Framework — HandlerExecutionChain API](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/web/servlet/HandlerExecutionChain.html)
