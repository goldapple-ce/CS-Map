# 개요

Spring Security는 Spring 기반 애플리케이션에 인증/인가에 대한 보안 Framework입니다.

- 인증(Authentication): 요청한 사용자가 누구인지 확인
- 인가(Authorization): 인증된 사용자가 해당 요청을 수행할 수 있는지 판단

---

# Servlet 웹 애플리케이션에서의 위치

Spring Security는 Servlet 기반 애플리케이션에서는 요청이 `DispatcherServlet`과 Controller에 도달하기 전 Servlet Filter 계층에서 보안 처리를 수행합니다.

이를 통해 Controller마다 로그인 여부와 권한을 반복해서 검사하지 않고, 공통 요청 경계에서 다음 작업을 처리할 수 있습니다.

- 이전 요청에서 저장한 인증 정보 복원
- Form Login, OAuth 2.0 Login과 Bearer Token 같은 인증 방식 실행
- 인증 / 인가 실패를 적절한 HTTP 응답이나 로그인 시작 동작으로 변환
- URL과 HTTP method 등에 적용된 접근 규칙 확인
- CSRF와 security header 같은 보호 기능 적용

Spring Security는 Spring Framework와 함께 사용되지만 별도의 프로젝트입니다. Spring MVC를 사용한다고 자동으로 모든 인증/인가 정책이 구성되는 것은 아니며, 필요한 의존성과 `SecurityFilterChain` 설정을 제공해야 합니다.

---

# 이 Scene이 보여주는 것

이 Scene은 Servlet Container의 Filter 호출이 Spring Security로 연결되고, 현재 요청에 적용할 Security Filter들이 선택되는 중심 구조를 보여줍니다.

```text
DelegatingFilterProxy
-> FilterChainProxy
-> SecurityFilterChain(s)
-> SecurityFilter(s)
   - SecurityContextHolder
   - SecurityContextRepository
```

가운데의 가로 흐름은 요청이 Spring Security에 진입해 Filter 목록이 결정되는 구조입니다. 오른쪽의 두 지원선은 Security Filter가 인증 정보를 처리할 때 `SecurityContextHolder`와 `SecurityContextRepository`를 사용한다는 관계입니다.

---

# 뷰포트의 흐름

## 1. DelegatingFilterProxy → FilterChainProxy

Spring Container의 Servlet FilterChain에 등록된 `DelegatingFilterProxy`가 요청을 받은 뒤 Spring Bean인 `FilterChainProxy`에 처리를 위임합니다.  
DelegatingFilterProxy는 인증이나 인가를 직접 수행하지 않습니다. Servlet Container와 Spring Container의 관리 경계를 연결하는 adapter입니다.

## 2. FilterChainProxy → SecurityFilterChain(s)

`FilterChainProxy`는 등록된 여러 `SecurityFilterChain`을 순서대로 확인하고, 현재 요청과 처음 일치하는 Chain 하나를 선택합니다.  
각 SecurityFilterChain은 다음 두 정보를 가집니다.

- 현재 요청에 적용할지 판단하는 요청 조건
- 적용할 Security Filter 목록과 순서

## 3. SecurityFilterChain(s) ↔ SecurityFilter(s)

`SecurityFilterChain`은 Security Filter 목록을 보관하는 구성 객체입니다. Scene의 `Filter 등록` 관계는 여러 Security Filter가 Chain의 목록을 구성한다는 뜻이며, 요청이 화살표 방향으로 전달된다는 의미는 아닙니다.

선택된 Filter들을 실제로 차례대로 호출하는 일은 `FilterChainProxy` 내부의 가상 FilterChain이 담당합니다. `SecurityFilter(s)`를 클릭하면 SecurityContext 복원, 인증 Filter, 예외 처리와 인가 Filter가 실행되는 자식 Scene으로 들어갑니다.

---

# SecurityContext 지원 관계

`SecurityContextHolder`는 현재 실행 흐름에서 `SecurityContext`에 접근하게 합니다. Context 안의 `Authentication`은 현재 사용자의 principal, 권한과 인증 상태를 나타냅니다.

`SecurityContextRepository`는 요청 사이에서 SecurityContext를 불러오고 저장하는 전략입니다. 세션 기반 인증에서는 다음 요청에서도 로그인 상태를 복원하는 데 사용할 수 있고, stateless 구성에서는 session에 Context를 저장하지 않을 수 있습니다.

뷰포트의 두 점선은 호출 순서가 아니라 지원 관계입니다. 실제로는 `SecurityContextHolderFilter`나 인증 Filter 같은 Security Filter가 Repository에서 Context를 조회하거나 저장하고, Holder에 현재 요청의 Context를 설정합니다. Holder나 Repository가 Security Filter를 직접 호출하는 것은 아닙니다.

---

# 참고 자료

- [Spring Security — Servlet Architecture](https://docs.spring.io/spring-security/reference/servlet/architecture.html)
- [Spring Security — SecurityContextHolder](https://docs.spring.io/spring-security/reference/servlet/authentication/architecture.html#servlet-authentication-securitycontextholder)
- [Spring Security — Authentication Persistence](https://docs.spring.io/spring-security/reference/servlet/authentication/persistence.html)
