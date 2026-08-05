# 한눈에 보기

Servlet 컨테이너의 요청을 Spring Security가 관리하는 보안 필터들로 전달하는 진입점입니다. 여러 `SecurityFilterChain` 중 현재 요청과 일치하는 첫 번째 체인을 고르고, 그 체인에 등록된 필터를 정해진 순서로 실행합니다.

---

# 이 흐름에서 하는 일

`UsernamePasswordAuthenticationFilter`가 선택된 `SecurityFilterChain`에 포함되어 있다면 `FilterChainProxy`가 해당 필터를 호출합니다. 다만 필터가 호출되었다고 해서 모든 요청에서 로그인 인증을 시도하는 것은 아닙니다. `UsernamePasswordAuthenticationFilter`가 자신의 요청 조건과 일치하는지 다시 판단합니다.

```text
Servlet 요청
  → FilterChainProxy
  → 요청과 일치하는 SecurityFilterChain
  → UsernamePasswordAuthenticationFilter를 포함한 보안 필터들
```

---

# 헷갈리기 쉬운 점

- 요청과 일치하는 `SecurityFilterChain`을 선택하는 책임과 실제 인증을 수행하는 책임은 분리되어 있습니다.
- 보안 필터의 실행 순서는 인증 정보의 로드, 인증, 예외 처리, 인가의 흐름에 영향을 줍니다.
- `FilterChainProxy`는 요청 처리가 끝난 뒤 현재 실행 스레드의 `SecurityContext`가 정리되도록 보장하는 역할도 합니다.

---

# 개발자가 개입하는 지점

개발자가 FilterChainProxy를 직접 생성하거나 UsernamePasswordAuthenticationFilter를 직접 호출할 지점은 없습니다.

개발자는 SecurityFilterChain 설정에서 Form Login을 활성화하고, Filter가 처리할 로그인 URL과 관련 설정을 변경합니다.

다만 이 구조를 알면 Form Login을 설정했는데 Filter가 실행되지 않을 때 요청에 맞는 SecurityFilterChain이 선택됐는지 확인하는 데 도움이 됩니다.

---

# 참고 자료

- [Spring Security - FilterChainProxy API](https://docs.spring.io/spring-security/reference/api/java/org/springframework/security/web/FilterChainProxy.html)
- [Spring Security - Servlet Authentication Architecture](https://docs.spring.io/spring-security/reference/servlet/authentication/architecture.html)
