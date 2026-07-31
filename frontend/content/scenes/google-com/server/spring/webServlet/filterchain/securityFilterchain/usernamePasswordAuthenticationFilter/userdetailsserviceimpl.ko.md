# 개요

애플리케이션이 자신의 사용자 저장소에 맞춰 작성한 `UserDetailsService` 구현체를 나타냅니다. `UserDetailsServiceImpl`은 Spring Security가 정해 둔 필수 클래스 이름이 아니라, 이 Scene에서 사용자 정의 구현을 설명하기 위해 사용한 예시 이름입니다.

---

# 일반적인 역할

1. 전달받은 사용자 이름으로 데이터베이스나 외부 저장소에서 사용자를 찾습니다.
2. 저장된 비밀번호 표현, 계정 상태, 역할과 권한을 읽습니다.
3. 애플리케이션의 사용자 모델을 Spring Security의 `UserDetails`로 변환합니다.
4. 사용자가 없으면 `UsernameNotFoundException`을 던집니다.

```java
@Service
class CustomUserDetailsService implements UserDetailsService {
    @Override
    public UserDetails loadUserByUsername(String username) {
        // 애플리케이션 저장소에서 조회한 사용자를 UserDetails로 변환
    }
}
```

---

# 설계할 때 주의할 점

- 이 구현체에서 원문 비밀번호를 비교하지 않습니다. 검증은 `DaoAuthenticationProvider`와 `PasswordEncoder`가 담당합니다.
- 저장소의 권한 표현을 `GrantedAuthority`로 일관되게 변환해야 합니다.
- 사용자 없음과 데이터 접근 장애를 구분하되, 로그인 응답으로 민감한 사용자 존재 정보가 드러나지 않게 해야 합니다.

---

# 참고 자료

- [Spring Security - UserDetailsService](https://docs.spring.io/spring-security/reference/servlet/authentication/passwords/user-details-service.html)
