# 개요

Spring Security은 여러 Security Filter가 연결된 `SecurityFilterChain`을 기반으로 동작합니다.
`SecurityFilterChain` 자체는 Filter를 실행하지 않습니다. 현재 요청에 적용할 조건과 `List<Filter>`를 보관하며, 실제 선택과 실행은 `FilterChainProxy`가 담당합니다.

# 주요 Filter 흐름

설정에 따라 실제 Filter 구성은 달라지지만, 주로 많이 사용하는 Filter는 다음과 같은 것들이 있습니다.

- SecurityContextHolderFilter
  - 기존 SecurityContext를 불러올 수 있도록 준비하고, 현재 요청의 SecurityContextHolder에 연결합니다.
- OAuth2AuthorizationRequestRedirectFilter
  - OAuth2 로그인을 시작하는 요청을 처리하고 사용자를 Authorization Server로 리다이렉트합니다.
- OAuth2LoginAuthenticationFilter
  - Authorization Server가 callback URL로 전달한 Authorization Code를 처리한다.
- UsernamePasswordAuthenticationFilter
  - 기본 Form Login 요청을 처리합니다.
- AnonymousAuthenticationFilter : 앞선 인증 Filter가 `Authentication`을 설정하지 않았다면 익명 인증을 설정한다.
- ExceptionTranslationFilter : 뒤쪽 Filter에서 발생한 보안 예외를 401 / 403 처리로 변환
- AuthorizationFilter : 현재 요청의 인가 진입점입니다.

모든 요청이 각 Filter에서 인증되는 것은 아니다. 각 인증 Filter는 자신이 처리할 요청과 일치하지 않으면 다음 Filter로 요청을 전달한다.

# 참고 자료

- [Spring Security — Servlet Architecture](https://docs.spring.io/spring-security/reference/servlet/architecture.html)
- [Spring Security — Authentication Persistence](https://docs.spring.io/spring-security/reference/servlet/authentication/persistence.html)
- [Spring Security — Authorize HttpServletRequests](https://docs.spring.io/spring-security/reference/servlet/authorization/authorize-http-requests.html)
