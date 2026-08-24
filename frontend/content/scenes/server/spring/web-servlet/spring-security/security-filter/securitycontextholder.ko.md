# 한눈에 보기

`SecurityContextHolder`는 현재 요청을 처리하는 동안 사용자의 인증 정보에 접근할 수 있게 합니다.

```text
SecurityContextHolder -> SecurityContext -> Authentication
```

- `SecurityContext`: 현재 실행 흐름의 보안 정보를 담습니다.
- `Authentication`: 사용자 정보, 인증 여부와 권한을 나타냅니다.

---

# 동작 방식

- SecurityContextHolderFilter가 저장된 Context를 Holder에 설정합니다.
- Authentication Filter가 인증에 성공하면 인증된 Authentication을 담은 Context를 설정합니다.
- AnonymousAuthenticationFilter는 인증 정보가 없을 때 익명 Authentication을 설정합니다.
- AuthorizationFilter는 현재 Authentication을 읽어 인가 판단에 사용합니다.

기본적으로 현재 thread를 기준으로 Context를 보관하며 요청이 끝나면 정리되어야 합니다.

---

# 개발자가 개입하는 지점

일반적인 인증 흐름에서는 개발자가 SecurityContextHolder를 직접 조작할 지점이 많지 않습니다.

custom Authentication Filter를 만들거나 현재 로그인 사용자를 직접 조회할 때 사용할 수 있습니다.

다만 이 구조를 알면 인증에 성공했는데도 사용자가 익명으로 보이거나, 비동기 작업에서 인증 정보가 전달되지 않는 문제를 추적하는 데 도움이 됩니다.

---

# 헷갈리기 쉬운 점

- SecurityContextHolder는 다음 요청까지 로그인 상태를 저장하는 저장소가 아닙니다.
- 다음 요청을 위한 Context 저장과 복원은 SecurityContextRepository가 담당합니다.
- 익명 Authentication도 `authenticated=true`일 수 있으므로 이 값만으로 실제 로그인을 판단하면 안 됩니다.

# 참고 자료

- [Spring Security — SecurityContextHolder](https://docs.spring.io/spring-security/reference/servlet/authentication/architecture.html#servlet-authentication-securitycontextholder)
