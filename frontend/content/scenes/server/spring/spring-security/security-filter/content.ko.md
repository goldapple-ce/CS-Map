# 한눈에 보기

Security Filter는 Spring Security가 요청에 인증, 인가와 여러 보안 처리를 적용할 때 사용하는 Servlet Filter입니다.

하나의 Filter가 모든 보안 처리를 하는 것은 아닙니다. 역할이 다른 Filter들이 `SecurityFilterChain`에 등록되고, 현재 요청과 관련 있는 Filter가 정해진 순서대로 실행됩니다.

---

# 구성 요소

- `SecurityContextHolderFilter`: 저장된 SecurityContext를 현재 요청에서 사용할 수 있게 준비합니다.
- `OAuth2AuthorizationRequestRedirectFilter`: OAuth2 로그인을 시작하고 브라우저에 Authorization Server로 이동할 주소를 전달합니다.
- `OAuth2LoginAuthenticationFilter`: Authorization Server에서 돌아온 Callback을 처리합니다.
- `UsernamePasswordAuthenticationFilter`: Form Login의 username과 password를 처리합니다.
- `Custom JWT Filter`: Bearer 방식으로 전달된 JWT를 직접 검증해 Authentication을 만드는 사용자 정의 Filter 예시입니다.
- `AnonymousAuthenticationFilter`: 앞선 Filter에서 인증되지 않았다면 익명 Authentication을 설정합니다.
- `ExceptionTranslationFilter`: 뒤에서 발생한 인증·인가 예외를 로그인 시작이나 접근 거부 응답으로 바꿉니다.
- `AuthorizationFilter`: 현재 사용자가 요청을 수행할 수 있는지 확인합니다.

`SecurityContextHolder`와 `SecurityContextRepository`는 Filter가 아니며, Filter들이 인증 정보를 사용하고 유지할 때 이용하는 구성 요소입니다.

---

# 전체 흐름

1. FilterChainProxy가 선택한 SecurityFilterChain의 Filter 실행을 시작합니다.
2. SecurityContextHolderFilter가 이전 요청에서 저장된 SecurityContext를 불러옵니다.
3. 로그인 요청과 일치하는 Authentication Filter가 있거나 JWT가 전달되면 해당 Filter가 인증을 시도합니다.
4. 아무 Filter도 사용자를 인증하지 않았다면 AnonymousAuthenticationFilter가 익명 Authentication을 설정합니다.
5. AuthorizationFilter가 현재 Authentication과 접근 규칙을 이용해 요청을 허용할지 판단합니다.
6. 인증·인가 예외가 발생하면 ExceptionTranslationFilter가 적절한 후속 처리를 시작합니다.
7. 요청이 허용되면 원래 Servlet FilterChain으로 돌아가 DispatcherServlet까지 진행할 수 있습니다.

모든 요청이 화면의 인증 Filter를 전부 실행하는 것은 아닙니다. 각 Filter는 자신이 담당하는 요청이 아니면 인증을 시도하지 않고 다음 Filter로 넘깁니다.

Custom JWT Filter는 Spring Security 기본 제공 Filter가 아닙니다. 개발자가 직접 등록한 Filter가 실행 흐름의 어디에 놓이는지 보여주기 위한 예시입니다.

---

# 개발자가 개입하는 지점

개발자는 `SecurityFilterChain` 설정에서 어떤 Security Filter와 보안 기능을 사용할지 결정할 수 있습니다.

- Form Login, OAuth2 Login과 Bearer Token 인증 활성화
- URL별 인가 규칙 설정
- CSRF, CORS, session과 logout 정책 설정
- custom Security Filter 구현 및 기존 Filter 앞뒤에 추가
- 인증 성공/실패 Handler와 접근 거부 Handler 변경

Spring Security 기본 Filter의 순서는 보안 동작이 서로 연결되도록 정해져 있습니다. 특별한 이유 없이 순서를 바꾸기보다 custom Filter가 어느 기존 Filter 앞이나 뒤에서 동작해야 하는지 명확히 정하는 것이 좋습니다.

---

# 꼭 알아둘 점

## 인증과 인가는 다릅니다

Authentication Filter는 사용자가 누구인지 확인하고, AuthorizationFilter는 확인된 사용자가 현재 요청을 수행할 수 있는지 판단합니다.

---

# 참고 자료

- [Spring Security — Security Filters](https://docs.spring.io/spring-security/reference/servlet/architecture.html#servlet-security-filters)
- [Spring Security — Authentication Architecture](https://docs.spring.io/spring-security/reference/servlet/authentication/architecture.html)
- [Spring Security — Authorize HttpServletRequests](https://docs.spring.io/spring-security/reference/servlet/authorization/authorize-http-requests.html)
