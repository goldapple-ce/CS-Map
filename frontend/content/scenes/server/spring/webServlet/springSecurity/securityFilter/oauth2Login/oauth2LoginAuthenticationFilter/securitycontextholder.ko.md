# 개요

현재 요청에서 인증된 사용자의 `SecurityContext`를 조회하고 설정하는 Spring Security의 접근점입니다.

---

# 로그인 성공 처리

`OAuth2LoginAuthenticationFilter`는 Provider가 반환한 인증 결과를 `OAuth2AuthenticationToken`으로 변환합니다. 이 토큰의 principal은 `OAuth2User`이며 사용자 속성과 authorities를 제공합니다.

필터는 새 `SecurityContext`에 이 Authentication을 넣고 `SecurityContextHolder`에 설정합니다. 이후 같은 요청의 인가 처리와 애플리케이션 코드는 현재 OAuth2 로그인 사용자를 조회할 수 있습니다.

기본 저장 전략은 서버 요청 스레드에 연결된 `ThreadLocal`입니다. 따라서 현재 실행 흐름에서 사용하기 위한 저장소이지, 다음 HTTP 요청까지 자동으로 유지하는 영속 저장소는 아닙니다.

---

# 참고 자료

- [Spring Security - SecurityContextHolder](https://docs.spring.io/spring-security/reference/servlet/authentication/architecture.html#servlet-authentication-securitycontextholder)
