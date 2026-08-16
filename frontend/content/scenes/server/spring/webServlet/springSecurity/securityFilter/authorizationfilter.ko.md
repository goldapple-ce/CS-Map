# 한눈에 보기

`AuthorizationFilter`는 현재 사용자가 이 요청을 수행할 수 있는지 확인하는 인가 Filter입니다.

---

# 동작 방식

1. SecurityContextHolder에서 현재 Authentication을 가져옵니다.
2. 현재 요청과 Authentication을 AuthorizationManager에 전달합니다.
3. 접근이 허용되면 다음 Filter로 진행합니다.
4. 접근이 거부되면 `AccessDeniedException`이 발생합니다.
5. 앞에 있는 ExceptionTranslationFilter가 예외를 인증 시작이나 접근 거부 응답으로 처리합니다.

---

# 개발자가 개입하는 지점

개발자는 `SecurityFilterChain` Bean에서 요청별 인가 규칙을 설정합니다.

```java
http.authorizeHttpRequests(auth -> auth
    .requestMatchers("/public/**").permitAll()
    .requestMatchers("/admin/**").hasRole("ADMIN")
    .anyRequest().authenticated()
);
```

- `permitAll()`: 누구나 접근할 수 있습니다.
- `hasRole("ADMIN")`: ADMIN role이 필요합니다.
- `authenticated()`: 로그인한 사용자만 접근할 수 있습니다.

복잡한 정책이 필요하면 custom AuthorizationManager를 구현해 연결할 수도 있습니다.

---

# 헷갈리기 쉬운 점

## 인증과 인가는 다릅니다

사용자가 로그인했더라도 현재 요청에 필요한 권한이 없으면 접근이 거부될 수 있습니다.

## 규칙 순서가 중요합니다

넓은 요청 조건을 먼저 배치하면 뒤쪽의 구체적인 규칙이 적용되지 않을 수 있습니다. 일반적으로 `anyRequest()`는 마지막에 둡니다.

---

# 참고 자료

- [Spring Security — Authorize HttpServletRequests](https://docs.spring.io/spring-security/reference/servlet/authorization/authorize-http-requests.html)
- [Spring Security — Authorization Architecture](https://docs.spring.io/spring-security/reference/servlet/authorization/architecture.html)
