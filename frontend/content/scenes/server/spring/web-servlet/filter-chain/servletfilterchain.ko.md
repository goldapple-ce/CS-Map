# 한눈에 보기

Servlet FilterChain은 요청이 최종 목적지인 Servlet에 도착하기 전에 거칠 Filter들을 순서대로 연결한 실행 체인입니다.  
각 Filter가 다음 단계를 호출해야 요청이 계속 진행되며, 마지막 Filter까지 통과하면 Spring MVC의 `DispatcherServlet` 같은 대상 Servlet이 호출됩니다.

---

# 동작 방식

1. Tomcat 같은 Servlet Container는 요청 경로와 Filter mapping을 확인해 현재 요청에 적용할 FilterChain을 구성합니다.
2. 각 Filter는 `doFilter()` 호출을 받습니다.
3. Filter가 `chain.doFilter(request, response)`를 호출하면 남아 있는 다음 Filter로 요청이 넘어갑니다.
4. 현재 Filter가 마지막이라면 대상 Servlet이 실행됩니다.

---

# 개발자가 개입하는 지점

개발자가 Servlet FilterChain을 직접 생성하거나 실행 순서를 조작하는 지점은 없습니다.

다만 이 구조를 알면 요청이 Controller에 도달하지 않을 때 어떤 Filter가 다음 체인을 호출하지 않았는지 찾거나, Filter가 실행되지 않거나 두 번 실행되는 문제를 추적하는 데 도움이 됩니다.

---

# 헷갈리기 쉬운 점

## FilterChain은 Filter가 아닙니다

Filter는 요청을 처리하는 각각의 단계이고, FilterChain은 이 단계들을 순서대로 실행하도록 연결하는 역할입니다.

## 다음 체인을 호출하지 않을 수도 있습니다

Filter가 직접 오류 응답이나 리다이렉트 응답을 만들고 `chain.doFilter()`를 호출하지 않으면 요청은 그 자리에서 끝납니다.

---

# 참고 자료

- [Jakarta Servlet — FilterChain API](https://jakarta.ee/specifications/servlet/6.1/apidocs/jakarta.servlet/jakarta/servlet/filterchain)
