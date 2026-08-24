# 한눈에 보기

Spring Security는 웹 요청이 Controller에 도착하기 전에 사용자가 누구인지 확인하고, 해당 요청을 수행할 권한이 있는지 검사하는 보안 Framework입니다.

- 인증(Authentication): 요청한 사용자가 누구인지 확인합니다.
- 인가(Authorization): 확인된 사용자가 해당 요청을 수행할 수 있는지 판단합니다.

Servlet 기반 애플리케이션에서는 여러 Security Filter가 요청을 순서대로 처리합니다. 로그인뿐 아니라 logout, CSRF 방어, 보안 header와 인증·인가 실패 처리도 이 Filter들에서 이루어질 수 있습니다.

---

# 구성 요소

- `DelegatingFilterProxy`: Servlet Container가 받은 요청을 Spring Security Bean에 전달합니다.
- `FilterChainProxy`: 현재 요청에 적용할 SecurityFilterChain을 선택하고 그 안의 Filter들을 실행합니다.
- `SecurityFilterChain(s)`: 요청 조건과 해당 요청에 적용할 Security Filter 목록을 가집니다.
- `SecurityFilter(s)`: 인증, 인가와 여러 보안 처리를 실제로 수행합니다.
- `SecurityContextHolder`: 현재 요청에서 사용자의 인증 정보에 접근하게 합니다.
- `SecurityContextRepository`: 인증 정보를 다음 요청에서도 사용할 수 있도록 불러오고 저장합니다.

---

# 전체 흐름

1. Servlet FilterChain이 `DelegatingFilterProxy`를 호출합니다.
2. DelegatingFilterProxy가 Spring Bean인 `FilterChainProxy`에 처리를 위임합니다.
3. FilterChainProxy가 현재 요청과 처음 일치하는 `SecurityFilterChain`을 선택합니다.
4. 선택된 Chain에 등록된 Security Filter들이 정해진 순서대로 실행됩니다.
5. Filter들은 필요에 따라 `SecurityContextHolder`와 `SecurityContextRepository`를 사용해 인증 정보를 조회하거나 저장합니다.
6. 인증과 인가를 통과하고 다음 체인이 계속되면 요청은 남은 Servlet Filter와 DispatcherServlet로 진행합니다.

`SecurityFilter(s) → SecurityFilterChain(s)`의 `Filter 등록` 선은 요청 방향이 아닙니다. 여러 Security Filter가 SecurityFilterChain의 목록을 구성한다는 관계입니다.

---

# 개발자가 개입하는 지점

개발자는 보통 `SecurityFilterChain` Bean을 구성하면서 Spring Security의 동작을 정합니다.

- 공개할 요청과 인증이 필요한 요청 설정
- Form Login, OAuth 2.0 Login과 Bearer Token 같은 인증 방식 선택
- URL과 권한에 따른 인가 규칙 설정
- CSRF, CORS, session과 logout 정책 설정
- 필요한 경우 custom Security Filter를 기존 Filter의 앞이나 뒤에 추가

---

# 꼭 알아둘 점

## Servlet FilterChain과 SecurityFilterChain은 다릅니다

Servlet FilterChain은 Servlet Container가 관리하는 전체 요청 체인입니다. SecurityFilterChain은 그 안의 `FilterChainProxy`가 선택하는 Spring Security Filter 목록입니다.

## 모든 요청이 같은 Security Filter를 사용하는 것은 아닙니다

애플리케이션에 여러 SecurityFilterChain이 있으면 요청 경로에 따라 서로 다른 인증 방식과 보안 정책이 적용될 수 있습니다.

---

# 참고 자료

- [Spring Security — Servlet Architecture](https://docs.spring.io/spring-security/reference/servlet/architecture.html)
- [Spring Security — Authentication Architecture](https://docs.spring.io/spring-security/reference/servlet/authentication/architecture.html)
- [Spring Security — Authentication Persistence](https://docs.spring.io/spring-security/reference/servlet/authentication/persistence.html)
