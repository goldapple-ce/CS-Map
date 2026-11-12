# 한눈에 보기

AuthenticationProvider는 Spring Security에서 `실제 인증 처리`를 담당하는 인터페이스입니다.
`supports()`는 Authentication 타입의 지원 여부를 판단하고, `authenticate()`는 실제 인증을 수행합니다.
인증 성공 시 Authentication을 반환하고, 처리할 수 없는 요청은 null을 반환하여 다른 Provider에 위임할 수 있습니다.

---

# AuthenticationProvider란?

AuthenticationProvider는 Spring Security에서 `실제 인증 처리`를 담당하는 인터페이스입니다.
AuthenticationManager가 인증 요청을 전달하면, AuthenticationProvider는 해당 `요청을 처리할 수 있는지 확인`하고 사용자 인증을 수행합니다.
Spring Security는 인증 방식마다 서로 다른 AuthenticationProvider 구현체를 제공하며, ProviderManager가 적절한 구현체에 인증을 위임합니다.

---

# AuthenticationProvider의 구조

AuthenticationProvider는 다음 두 메서드로 구성됩니다.

```java
public interface AuthenticationProvider {
    Authentication authenticate(Authentication authentication) throws AuthenticationException;
    boolean supports(Class<?> authentication);
}
```

- `supports()`: 전달받은 Authentication 타입을 처리할 수 있는지 판단합니다.
- `authenticate()`: 실제 인증을 수행하고 인증 결과를 반환합니다.

---

## supports()

`supports()`는 Authentication의 타입을 기준으로 해당 Provider가 인증 요청을 처리할 수 있는지 확인합니다.

예를 들어 OAuth2LoginAuthenticationProvider와 OidcAuthorizationCodeAuthenticationProvider는 모두 다음과 같이 구현되어 있습니다.

```java
@Override
public boolean supports(Class<?> authentication) {
    return OAuth2LoginAuthenticationToken.class.isAssignableFrom(authentication);
}
```

따라서 두 Provider 모두 OAuth2LoginAuthenticationToken을 지원하므로 `supports()`만으로는 일반 OAuth2 로그인과 OIDC 로그인을 구분할 수 없습니다.

---

## authenticate()

`authenticate()`는 실제 인증을 수행하는 메서드이며, 처리 결과에 따라 다음과 같이 동작합니다.

1. `인증 성공`: 인증된 Authentication 객체를 반환합니다.
2. `처리 대상이 아님`: null을 반환하여 다른 AuthenticationProvider가 처리하도록 합니다.
3. `인증 실패`: AuthenticationException을 발생시킵니다.

여기서 중요한 점은 supports()가 true를 반환하더라도 authenticate()가 반드시 인증을 수행하는 것은 아니라는 것입니다.
`supports()`는 `Authentication 타입의 지원 여부`만 판단하며,` 실제 인증 처리 여부`는 `authenticate()` 내부에서 결정할 수 있습니다.
