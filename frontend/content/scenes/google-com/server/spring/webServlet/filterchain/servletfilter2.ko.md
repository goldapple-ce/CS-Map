# 개요

Spring Security 처리가 끝난 뒤 원래 Servlet FilterChain에서 계속 실행되는 일반 `Filter`의 구체적 사용 위치입니다.

---

# 실행 조건

`FilterChainProxy` 내부의 Security Filter가 요청을 허용하고 원래 체인의 `doFilter()`를 호출해야 이 Filter까지 요청이 도달합니다. 인증 또는 인가 단계에서 응답이 끝났다면 뒤쪽 Filter와 `DispatcherServlet`은 호출되지 않을 수 있습니다.

이 Filter 역시 앞쪽 Filter와 같은 `jakarta.servlet.Filter`이며 특별히 다른 타입은 아닙니다. Scene에서 두 번 표현한 이유는 `DelegatingFilterProxy` 전후에 다른 일반 Filter가 존재할 수 있음을 보여주기 위해서입니다.

```text
앞쪽 일반 Filter
→ DelegatingFilterProxy
  → Spring Security 내부 체인
→ 뒤쪽 일반 Filter
→ DispatcherServlet
```

응답은 `DispatcherServlet`에서 돌아와 이 Filter의 후처리를 거친 뒤 Spring Security와 앞쪽 Filter 방향으로 되돌아갑니다.

---

# 참고 자료

- [Jakarta Servlet Specification - Filtering](https://jakarta.ee/specifications/servlet/6.0/jakarta-servlet-spec-6.0#filtering)
