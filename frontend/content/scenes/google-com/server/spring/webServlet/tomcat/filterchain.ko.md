# 개요

Tomcat이 구성하는 Servlet `FilterChain`은 현재 요청에 적용할 Filter들을 순서대로 호출하고, 마지막에 대상 Servlet을 호출합니다.

각 Filter는 `chain.doFilter(request, response)`를 호출해야 다음 Filter로 진행됩니다. 호출 전에는 요청을 검사하거나 감쌀 수 있고, 호출이 반환된 뒤에는 응답을 후처리할 수 있습니다. Filter가 응답을 완성하고 다음 chain을 호출하지 않으면 DispatcherServlet에는 요청이 도달하지 않습니다.

이 Servlet FilterChain은 Spring Security 내부의 `SecurityFilterChain`과 다른 계층입니다. 자세한 위임 관계는 연결된 FilterChain Scene에서 설명합니다.

# 참고 자료

- [Jakarta Servlet — FilterChain API](https://jakarta.ee/specifications/servlet/6.1/apidocs/jakarta.servlet/jakarta/servlet/filterchain)
