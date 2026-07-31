# 개요

Servlet Container는 web application, Servlet, Filter와 listener의 lifecycle을 관리하고 요청을 알맞은 Servlet로 전달하는 실행 환경입니다. 이 Scene에서는 Tomcat의 Catalina 영역이 해당 역할을 담당합니다.

요청 URI와 Servlet mapping을 이용해 대상 Servlet을 결정하고, 적용할 Filter들로 `FilterChain`을 구성합니다. Spring MVC 애플리케이션의 대상 Servlet은 일반적으로 `DispatcherServlet`입니다.

Spring Container와 Servlet Container는 다릅니다. Spring Container는 Bean을 관리하고, Servlet Container는 HTTP 요청과 Servlet lifecycle을 관리합니다. 두 Container는 `DelegatingFilterProxy`와 DispatcherServlet 같은 접점에서 함께 동작합니다.

# 참고 자료

- [Jakarta Servlet Specification](https://jakarta.ee/specifications/servlet/)
- [Spring Security — DelegatingFilterProxy](https://docs.spring.io/spring-security/reference/servlet/architecture.html#servlet-delegatingfilterproxy)
