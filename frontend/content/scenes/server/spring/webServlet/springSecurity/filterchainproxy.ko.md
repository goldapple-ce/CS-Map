# 한눈에 보기

`FilterChainProxy`는 Spring Security의 중심 Servlet Filter입니다. 현재 요청에 적용할 `SecurityFilterChain`을 선택하고, 선택된 Chain의 Security Filter들을 순서대로 실행합니다.

DelegatingFilterProxy가 Servlet Container와 Spring Bean을 연결한다면, FilterChainProxy부터 실제 Spring Security 처리가 시작됩니다.

---

# 동작 방식

FilterChainProxy는 여러 SecurityFilterChain을 등록 순서대로 확인하고 현재 요청과 처음 일치하는 Chain 하나를 선택합니다.

```text
FilterChainProxy
├─ /api/** 요청에 적용할 SecurityFilterChain
├─ /admin/** 요청에 적용할 SecurityFilterChain
└─ 나머지 요청에 적용할 SecurityFilterChain
```

Chain을 선택하면 그 안의 Security Filter들을 정해진 순서대로 실행합니다. 모든 보안 Filter가 다음 체인을 계속 호출하면 원래 Servlet FilterChain으로 돌아가 남은 Filter와 DispatcherServlet을 실행합니다.

---

# 개발자가 개입하는 지점

일반적인 Spring Boot 애플리케이션에서 개발자가 FilterChainProxy를 직접 생성하거나 호출할 지점은 없습니다. 개발자는 `SecurityFilterChain` Bean을 추가하거나 순서를 설정해 FilterChainProxy가 선택할 후보를 구성합니다.

다만 이 구조를 알면 특정 URL에 예상과 다른 보안 정책이 적용되거나, 요청이 Spring Security를 통과하지 않는 문제를 추적하는 데 도움이 됩니다.

---

# 헷갈리기 쉬운 점

## 여러 Chain의 Filter를 모두 실행하지 않습니다

현재 요청과 일치하는 첫 번째 SecurityFilterChain 하나를 사용합니다. 넓은 요청 조건이 앞에 있으면 뒤쪽의 구체적인 Chain이 선택되지 않을 수 있습니다.

## Servlet FilterChain과 다릅니다

FilterChainProxy는 Servlet FilterChain 안에서 호출되는 하나의 Servlet Filter입니다. 내부에서는 별도의 SecurityFilterChain을 선택해 Spring Security Filter들을 실행합니다.

---

# 참고 자료

- [Spring Security — FilterChainProxy](https://docs.spring.io/spring-security/reference/servlet/architecture.html#servlet-filterchainproxy)
- [Spring Security — FilterChainProxy API](https://docs.spring.io/spring-security/reference/api/java/org/springframework/security/web/FilterChainProxy.html)
