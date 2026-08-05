# 한눈에 보기

사용자 이름과 비밀번호 인증에 사용하는 `Authentication` 구현체입니다. 같은 타입의 객체가 인증 요청과 인증 결과를 모두 표현하지만, 두 상태에 담긴 값과 의미는 다릅니다.

---

# 인증 전 토큰

`UsernamePasswordAuthenticationFilter`는 로그인 요청에서 사용자 이름과 비밀번호를 읽어 인증 전 토큰을 만듭니다.

```text
principal: 입력한 username
credentials: 입력한 password
authorities: 비어 있음
authenticated: false
```

이 객체는 아직 신뢰할 수 있는 사용자를 뜻하지 않습니다. `AuthenticationManager`에 전달할 인증 요청입니다.

---

# 인증 후 토큰

`DaoAuthenticationProvider`가 사용자 조회와 비밀번호 검증에 성공하면 인증된 토큰을 반환합니다.

```text
principal: 조회한 UserDetails
credentials: 일반적으로 인증 완료 후 제거됨
authorities: 사용자에게 부여된 권한
authenticated: true
```

인증 필터는 이 결과를 `SecurityContext`에 넣어 현재 요청의 인증 정보로 사용합니다. `ProviderManager`는 기본적으로 인증이 끝난 뒤 비밀번호 같은 민감한 자격 증명을 제거하려고 합니다.

---

# 핵심 구분

- 인증 전 토큰은 사용자가 제출한 값을 운반하는 요청입니다.
- 인증 후 토큰은 검증을 통과한 사용자와 권한을 나타내는 결과입니다.
- `authenticated`를 애플리케이션 코드에서 임의로 `true`로 바꾸는 방식으로 인증을 우회해서는 안 됩니다.

---

# 개발자가 개입하는 지점

기본 Form Login에서는 Filter와 Provider가 Token을 만들기 때문에 개발자가 직접 생성할 지점은 없습니다.

custom Authentication Filter나 Provider를 구현할 때는 인증 전 Token과 인증 후 Token을 구분해 만들 수 있습니다.

다만 두 상태의 차이를 알면 검증되지 않은 사용자 입력을 인증 완료 결과처럼 다루는 보안 문제를 피하는 데 도움이 됩니다.

---

# 참고 자료

- [Spring Security - Servlet Authentication Architecture](https://docs.spring.io/spring-security/reference/servlet/authentication/architecture.html)
- [Spring Security - DaoAuthenticationProvider](https://docs.spring.io/spring-security/reference/servlet/authentication/passwords/dao-authentication-provider.html)
