# 개요

`SecurityContext`를 요청 사이에 저장하고 다시 불러오는 전략 인터페이스입니다. 로그인 성공 결과를 다음 요청에서도 사용해야 할 때 현재 요청의 컨텍스트를 영속화하는 경계를 제공합니다.

---

# 핵심 동작

- `loadDeferredContext`: 현재 요청에 연결된 `SecurityContext`를 필요할 때 불러옵니다.
- `saveContext`: 현재 `SecurityContext`를 저장합니다.
- `containsContext`: 현재 요청과 연결된 저장 컨텍스트가 있는지 확인합니다.

세션 기반 구성에서는 보통 `HttpSessionSecurityContextRepository`가 `HttpSession`을 사용합니다. 요청 내부에서만 유지할 때는 `RequestAttributeSecurityContextRepository`, 서버에 저장하지 않는 구성에서는 `NullSecurityContextRepository`를 사용할 수 있습니다.

---

# 이 흐름에서 하는 일

`UsernamePasswordAuthenticationFilter`가 인증 성공 결과를 `SecurityContextHolder`에 설정한 뒤, 구성된 저장 정책에 따라 `SecurityContextRepository`에도 저장합니다. 그래야 이후 요청에서 보안 필터가 같은 사용자의 인증 정보를 복원할 수 있습니다.

```text
현재 요청: SecurityContextHolder에서 사용
요청 사이: SecurityContextRepository에 저장하고 복원
```

세션을 사용하지 않는 무상태 인증에서는 저장소 구현과 보안 설정이 달라질 수 있으므로, 모든 인증 방식이 서버 세션에 컨텍스트를 저장한다고 가정하면 안 됩니다.

---

# 참고 자료

- [Spring Security - SecurityContextRepository API](https://docs.spring.io/spring-security/reference/api/java/org/springframework/security/web/context/SecurityContextRepository.html)
- [Spring Security - Authentication Persistence and Session Management](https://docs.spring.io/spring-security/reference/servlet/authentication/session-management.html)
