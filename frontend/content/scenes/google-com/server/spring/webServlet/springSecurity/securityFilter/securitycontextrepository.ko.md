# 개요

현재 로그인 정보를 다음 요청에서도 이어서 쓰기 위한 저장소입니다. SecurityContext를 저장하고 관리합니다.

---

# 종류

- `HttpSessionSecurityContextRepository` : HttpSession에 저장
- `RequestAttributeSecurityContextRepository` : 현재 요청의 attribute에만 저장
- `NullSecurityContextRepository` : 아무것도 저장하지 않음

---

# SecurityContestHolder와 비교

- `SecurityContextRepository` : 다음 요청에서도 사용할 수 있게 사용하는 SecurityContext 저장소
- `SecurityContextHolder` : 현재 요청에서만 사용하는 SecurityContext 저장소

---

# 참고 자료

- [Spring Security - Persisting Authentication](https://docs.spring.io/spring-security/reference/servlet/authentication/persistence.html)
