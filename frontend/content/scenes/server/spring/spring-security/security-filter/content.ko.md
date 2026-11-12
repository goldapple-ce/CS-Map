# 한눈에 보기

Security Filter들은 SecurityContextHolder를 통해 현재 요청의 인증 정보를 공유하며 인증과 인가를 처리합니다.
SecurityContextRepository는 인증 정보를 저장하고 이후 HTTP 요청에서 다시 조회할 수 있도록 합니다.
모든 요청이 모든 Filter를 거치는 것은 아니며, 로그인 성공처럼 중간 Filter에서 응답을 처리하면 Filter Chain이 종료될 수 있습니다.

---

# Security Filter 실행 흐름

Spring Security는 여러 Security Filter를 순서대로 실행하여 HTTP 요청의 인증과 인가를 처리합니다.
각 Filter는 서로 다른 역할을 담당하지만, `SecurityContextHolder`를 통해 현재 요청의 `인증 정보를 공유`하며 연계하여 동작합니다.
또한 모든 HTTP 요청이 모든 Filter를 거치는 것은 아니며, 요청의 목적과 처리 결과에 따라 Filter Chain이 `중간에 종료`될 수 있습니다.

---

# 주요 Security Filter

- `SecurityContextHolderFilter`: SecurityContextRepository에서 기존 SecurityContext를 조회할 수 있도록 준비하고, 요청 종료 시 정리합니다.
- `AbstractAuthenticationProcessingFilter`: 로그인 요청에 대한 인증을 수행하고 성공 또는 실패에 따른 후속 처리를 담당합니다.
- `AnonymousAuthenticationFilter`: SecurityContext에 Authentication이 없다면 익명 Authentication을 설정합니다.
- `ExceptionTranslationFilter`: 이후 Filter에서 발생한 인증 및 인가 예외를 처리합니다.
- `AuthorizationFilter`: SecurityContext의 Authentication을 이용하여 요청한 리소스에 접근할 권한이 있는지 판단합니다.

---

# Filter들은 어떻게 인증 정보를 공유할까?

각 Security Filter는 독립적으로 실행되지만, `SecurityContextHolder`를 통해 동일한 요청의 인증 정보를 확인할 수 있습니다.
예를 들어 인증 Filter가 SecurityContextHolder에 Authentication을 설정하면, 이후 AnonymousAuthenticationFilter와 AuthorizationFilter는 해당 인증 정보를 조회하여 처리할 수 있습니다.

반면 SecurityContextHolder는 기본적으로 ThreadLocal을 사용하므로, HTTP 요청이 종료되면 인증 정보가 정리됩니다.
서로 다른 HTTP 요청에서도 인증 정보를 유지하려면 `SecurityContextRepository`를 통해 SecurityContext를 저장하고, 이후 요청에서 다시 조회해야 합니다.

---

# SecurityContext와 Authentication

`SecurityContext`는 현재 사용자의 인증 정보를 보관하는 객체이며, 내부에 `Authentication을 저장`합니다.
`Authentication`은 사용자의 `식별 정보`와 인증 상태, 권한 정보를 표현하는 인터페이스입니다.

```java
public interface SecurityContext extends Serializable {
    Authentication getAuthentication();
    void setAuthentication(Authentication authentication);
}
```

Authentication은 다음과 같은 주요 메서드를 제공합니다.

```java
public interface Authentication extends Principal, Serializable {
    Object getPrincipal();
    Object getCredentials();
    Object getDetails();
    Collection<? extends GrantedAuthority> getAuthorities();
    boolean isAuthenticated();
    void setAuthenticated(boolean isAuthenticated);
}
```

- `principal`: 인증 대상 사용자의 식별 정보입니다.
- `credentials`: 비밀번호 등 인증에 사용되는 자격 증명입니다.
- `details`: 요청 IP 등 인증 과정의 부가 정보입니다.
- `authorities`: 사용자가 가진 권한 목록입니다.
- `authenticated`: 인증이 완료되었는지 나타내는 상태입니다.

인증 Filter는 `인증에 성공하면 Authentication을 SecurityContext에 저장`합니다.
이후 다른 Filter들은 SecurityContextHolder를 통해 해당 SecurityContext에 접근하여 Authentication을 조회할 수 있습니다.
예를 들어 AnonymousAuthenticationFilter는 Authentication이 존재하는지 확인하고, AuthorizationFilter는 Authentication의 인증 상태와 GrantedAuthority를 이용하여 접근 권한을 판단합니다.

---

# 모든 요청이 모든 Filter를 거칠까?

Security Filter는 `chain.doFilter()`를 호출하여 다음 Filter로 요청을 전달합니다.
따라서 Filter가 다음 Filter를 호출하지 않고 응답을 처리하면, 해당 요청의 Filter Chain은 그 지점에서 종료됩니다.

대표적인 예시가 로그인 요청입니다.
인증에 성공하면 기본적으로 다음 Filter를 호출하지 않으므로, 로그인 요청은 AbstractAuthenticationProcessingFilter에서 처리가 종료됩니다.
따라서 해당 요청에서 AnonymousAuthenticationFilter와 AuthorizationFilter까지 실행되는 것은 아닙니다.
