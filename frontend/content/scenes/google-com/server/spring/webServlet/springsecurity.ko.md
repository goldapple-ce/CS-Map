# 개요

Spring 기반 애플리케이션에 인증, 인가와 일반적인 공격에 대한 보호 기능을 제공하는 별도 보안 프레임워크입니다.

---

# Servlet 애플리케이션에서의 위치

Spring Security의 Servlet 지원은 `FilterChainProxy`를 중심으로 동작합니다. Servlet 컨테이너의 원래 `FilterChain` 안에 `DelegatingFilterProxy`가 등록되고, 이를 통해 Spring Bean인 `FilterChainProxy`와 내부 `SecurityFilterChain`이 호출됩니다.

```text
Servlet FilterChain
→ DelegatingFilterProxy
→ FilterChainProxy
→ SecurityFilterChain
→ 인증·인가 Security Filter들
```

보안 필터들은 Controller에 요청이 도착하기 전에 현재 사용자의 인증 정보를 준비하고, 요청에 필요한 권한을 확인하며, CSRF와 보안 헤더 같은 보호 기능을 적용할 수 있습니다.

---

# Spring Container와의 관계

Spring Security는 Spring Container가 관리하는 Bean과 설정을 사용합니다. `SecurityFilterChain`, `AuthenticationManager`, `AuthenticationProvider`, 사용자 조회 서비스 등이 Bean으로 구성될 수 있습니다.

Spring Framework 자체와는 별도 프로젝트이므로 Spring MVC를 사용한다고 자동으로 모든 보안 정책이 활성화되는 것은 아닙니다. 의존성과 보안 구성을 명시해야 합니다.

---

# 참고 자료

- [Spring Security 공식 문서](https://docs.spring.io/spring-security/reference/)
- [Spring Security - Servlet Architecture](https://docs.spring.io/spring-security/reference/servlet/architecture.html)
