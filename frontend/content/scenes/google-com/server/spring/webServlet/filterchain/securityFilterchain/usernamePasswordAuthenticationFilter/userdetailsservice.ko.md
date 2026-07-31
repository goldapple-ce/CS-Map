# 개요

사용자 이름으로 인증에 필요한 사용자 정보를 조회하는 인터페이스입니다. `DaoAuthenticationProvider`는 이 인터페이스를 통해 사용자 이름, 저장된 비밀번호, 계정 상태, 권한이 담긴 `UserDetails`를 얻습니다.

```java
UserDetails loadUserByUsername(String username)
```

---

# 하는 일과 하지 않는 일

`UserDetailsService`의 책임은 사용자를 조회해 Spring Security가 이해하는 `UserDetails`로 반환하는 것입니다. 비밀번호가 맞는지 최종 판단하는 책임은 없습니다. 비밀번호 비교는 조회 결과를 받은 `DaoAuthenticationProvider`와 `PasswordEncoder`가 수행합니다.

사용자를 찾지 못하면 일반적으로 `UsernameNotFoundException`을 던집니다. 실제 인증 과정에서는 사용자 존재 여부가 공격자에게 노출되지 않도록 예외가 다른 인증 실패와 동일하게 처리될 수 있습니다.

---

# 구현 방법

Spring Security는 메모리, JDBC, 캐시 기반 구현을 제공하며, 애플리케이션의 사용자 저장소에 맞춘 사용자 정의 구현도 사용할 수 있습니다. 어떤 저장소를 사용하더라도 `DaoAuthenticationProvider`는 `UserDetailsService` 인터페이스만 바라봅니다.

---

# 참고 자료

- [Spring Security - UserDetailsService](https://docs.spring.io/spring-security/reference/servlet/authentication/passwords/user-details-service.html)
- [Spring Security - UserDetails](https://docs.spring.io/spring-security/reference/servlet/authentication/passwords/user-details.html)
