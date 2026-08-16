# 한눈에 보기

`SecurityContextRepository`는 사용자의 `SecurityContext`를 불러오고 저장하는 역할을 합니다.

세션 기반 로그인에서는 한 요청에서 인증한 사용자를 다음 요청에서도 기억하는 데 사용합니다. 반대로 stateless API에서는 로그인 상태를 session에 저장하지 않고 요청마다 Token을 다시 확인할 수 있습니다.

---

# 종류

- `HttpSessionSecurityContextRepository`: SecurityContext를 HTTP session에 저장합니다.
- `RequestAttributeSecurityContextRepository`: 현재 request attribute에 저장합니다.
- `NullSecurityContextRepository`: SecurityContext를 저장하지 않습니다.

---

# 개발자가 개입하는 지점

개발자는 애플리케이션이 로그인 상태를 유지하는 방식에 따라 SecurityContextRepository를 선택하거나 구성할 수 있습니다.

- session 기반 웹 로그인: HTTP session에 Context 저장
- stateless API: session 저장 없이 요청마다 Token 인증
- custom 인증 Filter: 인증 성공 후 필요한 Repository에 Context 저장

다만 기본 Form Login 같은 일반적인 구성에서는 Spring Security가 적절한 Repository와 저장 흐름을 처리하므로 직접 호출할 일이 많지 않습니다.

---

# 헷갈리기 쉬운 점

## SecurityContextHolder와 역할이 다릅니다

- `SecurityContextHolder`: 현재 요청 처리 중 Context에 접근
- `SecurityContextRepository`: 요청 사이에서 Context를 불러오고 저장

Repository가 Holder를 직접 변경하는 것은 아닙니다. Security Filter가 Repository에서 Context를 읽어 Holder에 설정하거나, Holder의 Context를 Repository에 저장합니다.

## 사용자 데이터베이스가 아닙니다

SecurityContextRepository는 회원 정보나 비밀번호를 저장하는 Repository가 아닙니다. 인증이 끝난 뒤 만들어진 SecurityContext를 유지하기 위한 저장소입니다.

---

# 참고 자료

- [Spring Security — Authentication Persistence](https://docs.spring.io/spring-security/reference/servlet/authentication/persistence.html)
- [Spring Security — SecurityContextRepository API](https://docs.spring.io/spring-security/reference/api/java/org/springframework/security/web/context/SecurityContextRepository.html)
