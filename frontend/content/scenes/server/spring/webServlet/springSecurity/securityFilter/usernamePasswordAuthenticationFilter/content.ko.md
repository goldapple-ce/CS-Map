# 한눈에 보기

`UsernamePasswordAuthenticationFilter`는 로그인 요청에서 username과 password를 읽어 Spring Security 인증을 시작하는 Filter입니다.

---

# 구성 요소

- `UsernamePasswordAuthenticationFilter`: 로그인 요청을 읽고 인증 흐름을 시작합니다.
- `UsernamePasswordAuthenticationToken`: username과 password를 담아 인증 요청과 결과를 표현합니다.
- `AuthenticationManager`: Filter가 인증을 요청하는 진입점입니다.
- `ProviderManager`: 요청을 처리할 AuthenticationProvider를 찾습니다.
- `DaoAuthenticationProvider`: username/password 인증을 실제로 처리합니다.
- `UserDetailsService`: username으로 사용자 정보를 조회합니다.
- `UserDetailsServiceImpl`: 애플리케이션 저장소에 맞게 개발자가 작성한 사용자 조회 구현입니다.
- `SecurityContextHolder`: 현재 요청에서 인증 결과를 사용할 수 있게 합니다.
- `SecurityContextRepository`: 인증 결과를 다음 요청에서도 사용할 수 있게 저장합니다.

---

# 전체 흐름

1. Filter가 로그인 요청에서 username과 password를 읽습니다.
2. 인증 전 `UsernamePasswordAuthenticationToken`을 만들어 AuthenticationManager에 전달합니다.
3. 대표 구현인 ProviderManager가 Token을 지원하는 Provider를 찾습니다.
4. DaoAuthenticationProvider가 UserDetailsService로 사용자를 조회합니다.
5. 저장된 password와 제출된 password를 PasswordEncoder로 비교합니다.
6. 성공하면 인증된 Authentication이 Filter로 돌아옵니다.
7. Filter가 인증 결과를 SecurityContextHolder에 설정합니다.
8. 세션 기반 로그인이라면 SecurityContextRepository에도 저장해 다음 요청에서 복원합니다.

---

# 개발자가 개입하는 지점

개발자는 Form Login 설정과 사용자 조회 부분에 주로 개입합니다.

```java
http.formLogin(form -> form
    .loginPage("/login")
    .loginProcessingUrl("/login")
    .usernameParameter("username")
    .passwordParameter("password")
);
```

- 로그인 화면과 처리 URL 설정
- username, password parameter 이름 변경
- 로그인 성공·실패 Handler 설정
- `UserDetailsService` 구현
- 안전한 `PasswordEncoder` Bean 구성
- 필요하면 custom AuthenticationProvider 또는 Filter 추가

---

# 꼭 알아둘 점

## Filter는 사용자 저장소를 직접 조회하지 않습니다

사용자 조회는 UserDetailsService, 비밀번호 검증은 DaoAuthenticationProvider와 PasswordEncoder가 담당합니다.

## 기본 요청은 POST /login입니다

Form Login 기본 설정에서 Filter는 모든 요청을 처리하지 않고 자신에게 설정된 로그인 요청만 인증합니다.

---

# 참고 자료

- [Spring Security — UsernamePasswordAuthenticationFilter](https://docs.spring.io/spring-security/reference/api/java/org/springframework/security/web/authentication/UsernamePasswordAuthenticationFilter.html)
- [Spring Security — Username/Password Authentication](https://docs.spring.io/spring-security/reference/servlet/authentication/passwords/index.html)
