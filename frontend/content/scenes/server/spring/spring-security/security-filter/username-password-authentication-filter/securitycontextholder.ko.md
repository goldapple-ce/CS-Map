# 한눈에 보기

현재 실행 흐름에서 인증된 사용자의 `SecurityContext`를 조회하고 설정하는 접근점입니다. `SecurityContext` 안에는 현재 사용자를 나타내는 `Authentication`이 들어 있습니다.

```text
SecurityContextHolder
  → SecurityContext
  → Authentication
```

---

# 이 흐름에서 하는 일

로그인에 성공하면 `UsernamePasswordAuthenticationFilter`가 인증 결과를 담은 새 `SecurityContext`를 만들고 `SecurityContextHolder`에 설정합니다. 이후 같은 요청에서 실행되는 인가 로직과 애플리케이션 코드는 여기서 현재 사용자와 권한을 확인할 수 있습니다.

기본 전략은 `ThreadLocal` 기반이므로 같은 요청 처리 스레드에서는 인증 정보를 명시적으로 인자로 전달하지 않아도 접근할 수 있습니다. 요청이 끝나면 다음 요청에 인증 정보가 섞이지 않도록 반드시 정리되어야 하며, Spring Security의 `FilterChainProxy`가 이 정리를 보장합니다.

---

# SecurityContextRepository와 차이

- `SecurityContextHolder`: 현재 실행 흐름에서 사용할 인증 정보를 보관합니다.
- `SecurityContextRepository`: 인증 정보를 다음 요청에서 다시 불러올 수 있도록 요청 사이에 저장합니다.

`SecurityContextHolder`에만 설정하면 현재 요청에서는 인증된 상태로 보이지만, 저장 정책에 따라 다음 요청에서는 인증이 복원되지 않을 수 있습니다.

---

# 개발자가 개입하는 지점

기본 Form Login에서는 Filter가 인증 결과를 Holder에 설정하므로 개발자가 직접 조작할 지점은 없습니다.

custom Authentication Filter를 만들 때는 인증된 Authentication을 새 SecurityContext에 담아 설정할 수 있습니다.

다만 이 구조를 알면 로그인 성공 후에도 현재 사용자가 익명으로 보이는 문제를 추적하는 데 도움이 됩니다.

---

# 참고 자료

- [Spring Security - Servlet Authentication Architecture](https://docs.spring.io/spring-security/reference/servlet/authentication/architecture.html#servlet-authentication-securitycontextholder)
- [Spring Security - SecurityContextHolder API](https://docs.spring.io/spring-security/reference/api/java/org/springframework/security/core/context/SecurityContextHolder.html)
