# 개요

로그인 요청이 들어오면 아이디와 비밀번호를 꺼내 인증을 시도하는 필터입니다.  
기본 설정에서는 `/login`으로 들어오는 POST 요청을 처리합니다.

---

# 구조

- `AuthenticationManager`: 인증 요청을 받는 인터페이스
  - `ProviderManager`: 여러 AuthenticationProvider 중 인증을 처리할 Provider를 찾는 대표 구현체
- `AuthenticationProvider`: 특정 인증 방식을 처리하는 인터페이스
  - `DaoAuthenticationProvider`: 아이디와 비밀번호 인증을 처리하는 구현체
- `UserDetailsService`: username으로 사용자를 조회하고 `UserDetails`를 반환하는 인터페이스
- `SecurityContextHolder`: 현재 실행 흐름에서 `SecurityContext`에 접근할 수 있게 하는 holder
- `SecurityContextRepository`: 요청 사이에 `SecurityContext`를 유지하고 복원하는 저장소
- `UsernamePasswordAuthenticationToken`: username/password 인증에 사용하는 `Authentication` 구현체

---

# 흐름

1. 요청에서 username과 password를 꺼내 `인증 전 상태의 UsernamePasswordAuthenticationToken을 생성`합니다.
2. `AuthenticationManager에게 인증을 요청`합니다.
   - 일반적으로 AuthenticationManager의 구현체인 `ProviderManager`가 요청을 받습니다.
3. ProviderManager는 현재 Authentication을 처리할 수 있는 `AuthenticationProvider를 찾습니다.`
   - 아이디와 비밀번호 인증이라면 보통 `DaoAuthenticationProvider`가 처리합니다.
4. DaoAuthenticationProvider는 `UserDetailsService를 호출`합니다.
5. UserDetailsService는 `UserDetails를 조회`합니다.
6. DaoAuthenticationProvider가 저장된 password와 제출된 password를 `PasswordEncoder`로 비교하고, 성공하면 인증된 `Authentication`을 반환합니다.
7. ProviderManager가 인증된 `Authentication`을 필터에 반환합니다.
8. 필터의 성공 처리 과정이 인증된 `Authentication`을 담은 `SecurityContext`를 만듭니다.
9. SecurityContext를 `SecurityContextHolder`에 설정합니다.
10. 구성된 `SecurityContextRepository`에 SecurityContext를 저장해 이후 요청에서 복원할 수 있게 합니다.

이렇게 역할을 나누는 이유는 인증 방식마다 처리 과정이 다르기 때문입니다.  
ProviderManager는 여러 AuthenticationProvider를 관리하며, 전달받은 Authentication을 처리할 수 있는 Provider를 찾아 인증을 맡깁니다.  
예를 들어 아이디와 비밀번호 인증은 DaoAuthenticationProvider가 처리하고, 다른 인증 방식은 각각 다른 AuthenticationProvider가 처리할 수 있습니다.

---

# 참고 자료

- [SpringDocs - UsernamePasswordAuthenticationFilter](https://docs.spring.io/spring-security/reference/api/java/org/springframework/security/web/authentication/UsernamePasswordAuthenticationFilter.html)
