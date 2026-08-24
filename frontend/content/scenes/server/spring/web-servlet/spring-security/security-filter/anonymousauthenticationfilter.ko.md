# 한눈에 보기

`AnonymousAuthenticationFilter`는 앞선 Filter들이 사용자를 인증하지 않았다면 익명 사용자를 나타내는 Authentication을 설정합니다.

로그인하지 않은 사용자를 `null`로 남겨두는 대신 하나의 Authentication 모델로 표현하면 뒤쪽 보안 처리가 인증 사용자와 익명 사용자를 같은 방식으로 다룰 수 있습니다.

---

# 동작 방식

1. SecurityContextHolder에 Authentication이 있는지 확인합니다.
2. Authentication이 없으면 `AnonymousAuthenticationToken`을 만듭니다.
3. 익명 Token을 담은 SecurityContext를 Holder에 설정합니다.
4. 뒤쪽 AuthorizationFilter와 ExceptionTranslationFilter가 익명 사용자 상태를 확인할 수 있습니다.

---

# 개발자가 개입하는 지점

일반적인 Spring Security 구성에서 개발자가 AnonymousAuthenticationFilter를 직접 생성하거나 호출할 지점은 없습니다.

필요하면 anonymous 지원을 끄거나 principal과 authority 값을 변경할 수 있지만, 대부분 기본 구성을 사용합니다.

다만 이 구조를 알면 로그인하지 않은 사용자의 Authentication이 왜 `null`이 아니며 `authenticated=true`일 수 있는지 이해하는 데 도움이 됩니다.

---

# 헷갈리기 쉬운 점

AnonymousAuthenticationToken의 `authenticated=true`는 실제 로그인이 완료됐다는 뜻이 아닙니다. Spring Security가 정상적으로 만든 익명 Authentication 객체라는 의미입니다.

---

# 참고 자료

- [Spring Security — Anonymous Authentication](https://docs.spring.io/spring-security/reference/servlet/authentication/anonymous.html)
