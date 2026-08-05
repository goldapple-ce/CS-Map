# 한눈에 보기

`SecurityContextRepository`는 SecurityContext를 불러오고 저장해 요청 사이에서 인증 상태를 유지하는 역할을 합니다.

세션 기반 로그인에서는 이전 요청의 로그인 정보를 다음 요청에서 다시 사용할 수 있게 합니다. stateless API에서는 Context를 session에 저장하지 않을 수도 있습니다.

---

# 종류

- `HttpSessionSecurityContextRepository`: HTTP session에 Context를 저장합니다.
- `RequestAttributeSecurityContextRepository`: 현재 request attribute에 Context를 저장합니다.
- `NullSecurityContextRepository`: Context를 저장하지 않습니다.

---

# 개발자가 개입하는 지점

개발자는 session 기반인지 stateless 방식인지에 따라 사용할 Repository와 저장 정책을 구성할 수 있습니다.

custom Authentication Filter를 만들었다면 인증 성공 후 SecurityContext를 Repository에 저장해야 다음 요청에서 복원할 수 있습니다.

다만 일반적인 Form Login에서는 Spring Security가 저장 흐름을 처리하므로 Repository를 직접 호출할 일이 많지 않습니다.

---

# 헷갈리기 쉬운 점

- SecurityContextHolder는 현재 요청에서 Context에 접근하게 합니다.
- SecurityContextRepository는 요청 사이에서 Context를 불러오고 저장합니다.
- 사용자 계정이나 비밀번호를 저장하는 Repository가 아닙니다.

# 참고 자료

- [Spring Security — Authentication Persistence](https://docs.spring.io/spring-security/reference/servlet/authentication/persistence.html)
