# 개요

사용자 이름과 비밀번호 인증을 담당하는 `AuthenticationProvider` 구현체입니다. `UserDetailsService`로 사용자를 조회하고 `PasswordEncoder`로 제출된 비밀번호를 검증합니다.

---

# 인증 흐름

1. 인증 전 `UsernamePasswordAuthenticationToken`에서 사용자 이름을 읽습니다.
2. `UserDetailsService`를 호출해 `UserDetails`를 조회합니다.
3. 계정 잠김, 비활성화, 만료 같은 계정 상태를 확인합니다.
4. `PasswordEncoder`로 제출된 비밀번호와 저장된 비밀번호 표현을 비교합니다.
5. 성공하면 `UserDetails`와 권한을 담은 인증된 `UsernamePasswordAuthenticationToken`을 반환합니다.

```text
UsernamePasswordAuthenticationToken
  → UserDetailsService로 사용자 조회
  → PasswordEncoder로 비밀번호 검증
  → 인증된 UsernamePasswordAuthenticationToken 반환
```

---

# 책임의 경계

- 데이터베이스를 직접 조회하지 않고 `UserDetailsService`에 사용자 조회를 위임합니다.
- 원문 비밀번호를 직접 비교하지 않고 `PasswordEncoder`를 사용합니다.
- 인증 성공 결과는 반환하지만, 현재 요청의 `SecurityContextHolder`에 저장하는 일은 인증을 시작한 필터가 담당합니다.

---

# 참고 자료

- [Spring Security - DaoAuthenticationProvider](https://docs.spring.io/spring-security/reference/servlet/authentication/passwords/dao-authentication-provider.html)
- [Spring Security - DaoAuthenticationProvider API](https://docs.spring.io/spring-security/reference/api/java/org/springframework/security/authentication/dao/DaoAuthenticationProvider.html)
