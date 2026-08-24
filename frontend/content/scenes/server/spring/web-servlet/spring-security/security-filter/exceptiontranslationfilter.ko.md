# 한눈에 보기

`ExceptionTranslationFilter`는 뒤쪽 Security Filter에서 발생한 인증,인가 예외를 웹 응답 처리로 연결합니다.

---

# 동작 방식

- `AuthenticationException`: `AuthenticationEntryPoint`를 호출해 인증을 시작합니다.
- `AccessDeniedException` + 익명 사용자: 아직 로그인하지 않은 것으로 보고 AuthenticationEntryPoint를 호출합니다.
- `AccessDeniedException` + 인증 사용자: `AccessDeniedHandler`를 호출해 접근 거부를 처리합니다.

API에서는 보통 401 또는 403 응답을 만들고, 웹 로그인에서는 로그인 화면으로 리다이렉트할 수도 있습니다. 실제 응답은 설정된 EntryPoint와 Handler에 따라 달라집니다.

---

# 개발자가 개입하는 지점

개발자는 인증이 필요하거나 권한이 부족할 때 어떤 응답을 보낼지 설정할 수 있습니다.

- custom `AuthenticationEntryPoint`로 401 응답 형식 변경
- custom `AccessDeniedHandler`로 403 응답 형식 변경
- 웹 로그인에서는 로그인 화면이나 OAuth2 로그인 시작 지점으로 이동

---

# 헷갈리기 쉬운 점

## 일반 Exception이 아닙니다.

이 Filter가 예외를 일반 Java 예외로 번역하는 것은 아닙니다. Spring Security 예외를 HTTP 응답이나 인증 시작 동작으로 연결한다는 의미의 Translation입니다.

## AuthorizationFilter에서 실패했다고, 꼭 인가 실패를 뜻하는것은 아닙니다.

AuthorizationFilter는 AccessDeniedException만 던집니다. 이는 익멱 사용자도 마찬가지 입니다.  
이를 해결하기 위해 ExceptionTranslationFilter는 accessDeniedHandler를 호출하기 전에 `isAnonymous(익명 사용자)인지 확인을 하고, AuthenticationException으로 변경`한 뒤, authenticationEntryPoint를 호출하게 됩니다.

---

# 참고 자료

- [Spring Security — ExceptionTranslationFilter API](https://docs.spring.io/spring-security/reference/api/java/org/springframework/security/web/access/ExceptionTranslationFilter.html)
