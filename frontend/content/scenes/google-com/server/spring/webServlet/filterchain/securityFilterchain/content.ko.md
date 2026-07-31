# 개요

Spring Security는 여러 Security Filter가 연결된 SecurityFilterChain을 기반으로 동작합니다.  
현재 요청에 적용할 조건과 `Filter들을 보관`하며, 실제 선택과 실행은 `FilterChainProxy`가 담당합니다.

---

# 인증과 인가

- 인증(Authentication) : 본인이 누구인지 확인 (로그인)
- 인가(Authorization) : 특정 리소스에 권한이 있는지 확인 (등급 권한)

---

# 주요 Filter 흐름

> 이해를 위해 약간의 단순화가 있습니다.

설정에 따라 실제 Filter 구성은 달라집니다. 각 인증 Filter는 자신이 처리할 요청이 아니면 인증을 시도하지 않고 다음 Filter로 요청을 전달합니다.

## SecurityContext 관리

- SecurityContextHolderFilter:
  - `이미 로그인한 사용자인지 확인`하고, 현재 요청의 SecurityContextHolder에 설정합니다.
  - 세션 기반 인증에서는 SecurityContext가 주로 HTTP 세션에 저장됩니다.

## 인증 필터(Authentication Filter)

인증에 성공하면 인증된 Authentication이 들어 있는 SecurityContext를 SecurityContextHolder에 설정합니다.

- OAuth2LoginAuthenticationFilter :
  - 구글 등의 인증 서버가 Callback URL로 전달한 `인가 코드를 처리`하고 사용자를 인증합니다.
- UsernamePasswordAuthenticationFilter :
  - `기본 Form Login` 요청의 아이디와 비밀번호를 처리합니다.
- AnonymousAuthenticationFilter :
  - 앞선 Filter가 `인증하지 않았다면 익명 Authentication`을 설정합니다.

## 인가 필터(Authorization Filter)

- AuthorizationFilter :
  - 현재 요청에 적용되는 AuthorizationManager에게 `인가 판단`을 위임합니다.
  - 필요하면 SecurityContextHolder에서 Authentication을 가져와 인증 여부나 권한을 검사합니다.

## 기타 필터

- OAuth2AuthorizationRequestRedirectFilter :
  - OAuth2 로그인을 시작하는 요청을 처리하고, 브라우저가 Authorization Server로 이동할 URL을 `Location` 헤더에 담아 리다이렉트 응답을 반환합니다.
- ExceptionTranslationFilter :
  - 뒤쪽에서 발생한 `AuthenticationException과 AccessDeniedException을 처리`합니다.
  - 인증을 시작하거나 로그인 화면으로 리다이렉트하고, 접근 거부 응답 등을 생성하도록 관련 Handler에 위임합니다.

---

# 참고 자료

- [Spring Security — Servlet Architecture](https://docs.spring.io/spring-security/reference/servlet/architecture.html)
- [Spring Security — Authentication Persistence](https://docs.spring.io/spring-security/reference/servlet/authentication/persistence.html)
- [Spring Security — Authorize HttpServletRequests](https://docs.spring.io/spring-security/reference/servlet/authorization/authorize-http-requests.html)
- [Inpa Dev - Authentication vs Authorization](https://inpa.tistory.com/entry/CS-👨‍💻-Authentication-vs-Authorization-차이-엄청-쉽게-설명)
