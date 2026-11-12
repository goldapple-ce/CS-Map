# 한눈에 보기

AuthenticationManager는 인증 요청을 전달받고 인증 결과를 반환하는 인터페이스입니다.
Spring Security는 일반적인 구성에서 AuthenticationManagerBuilder를 통해 ProviderManager를 생성합니다.
ProviderManager는 AuthenticationProvider에 실제 인증을 위임하고, 인증 결과를 호출한 Filter에 반환합니다.

---

# AuthenticationManager

AuthenticationManager는 Spring Security에서 인증 요청을 전달받아 인증 결과를 반환하는 인터페이스입니다.
AbstractAuthenticationProcessingFilter는 실제 인증을 직접 수행하지 않고, AuthenticationManager에 인증을 위임합니다.
Spring Security에서는 일반적으로 ProviderManager가 AuthenticationManager의 구현체로 사용됩니다.

---

# AuthenticationManager의 구조

AuthenticationManager는 다음과 같이 정의되어 있습니다.

```java
public interface AuthenticationManager {
    Authentication authenticate(Authentication authentication) throws AuthenticationException;
}
```

- `authentication`: 인증에 필요한 사용자 정보나 자격 증명을 포함하는 Authentication 객체입니다.
- `authenticate()`: 인증에 성공하면 인증된 Authentication을 반환하고, 실패하면 AuthenticationException을 발생시킵니다.

AuthenticationManager는 인증 요청을 처리하는 공통 인터페이스일 뿐, 구체적인 인증 방식은 정의하지 않습니다.
