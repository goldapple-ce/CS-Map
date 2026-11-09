# 한눈에 보기

AuthenticationSuccessHandler는 사용자 인증에 `성공한 이후 수행할 작업을 정의`하는 인터페이스입니다.
AbstractAuthenticationProcessingFilter의 `successfulAuthentication()에서 호출`되며, 기본적으로 로그인 성공 후 리다이렉트를 처리합니다.
커스텀 구현을 통해 JWT 발급 등 인증 성공 이후의 작업을 공통으로 처리할 수 있습니다.

---

# AuthenticationSuccessHandler란?

AuthenticationSuccessHandler는 Spring Security에서 사용자 인증에 `성공한 이후 수행할 작업을 정의`하는 인터페이스입니다.
인증에 성공한 사용자의 Authentication을 전달받으며, 이를 이용해 로그인 성공 이후의 응답을 처리할 수 있습니다.
대표적으로 로그인 성공 후 특정 URL로 리다이렉트하거나, JWT를 발급하여 클라이언트에 전달하는 작업을 수행합니다.

---

# 주요 메서드

```java
public interface AuthenticationSuccessHandler {
    void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException;
}
```

- `request`: 인증 요청에 대한 HttpServletRequest입니다.
- `response`: 로그인 성공 이후 클라이언트에 반환할 HTTP 응답입니다.
- `authentication`: 인증에 성공한 사용자의 정보와 권한을 포함하는 Authentication 객체입니다.

---

# 주요 구현체

Spring Security는 로그인 성공 이후의 처리 방식에 따라 여러 AuthenticationSuccessHandler 구현체를 제공합니다.

- `SimpleUrlAuthenticationSuccessHandler`: 인증 성공 후 지정된 URL로 리다이렉트합니다.
- `SavedRequestAwareAuthenticationSuccessHandler`: 인증 이전에 저장된 요청이 있다면 해당 URL로 리다이렉트합니다.
- `ForwardAuthenticationSuccessHandler`: 인증 성공 후 지정된 URL로 서버 내부 Forward를 수행합니다.

기본 구현체들은 주로 로그인 성공 이후 페이지 이동을 처리하는 데 사용됩니다.
반면 REST API 기반 인증에서는 리다이렉트 대신 JSON 응답이나 JWT를 반환해야 할 수 있으므로, AuthenticationSuccessHandler를 직접 구현하여 사용할 수도 있습니다.

즉, AuthenticationSuccessHandler는 인증 자체를 수행하는 것이 아니라, 인증 성공 이후의 동작을 분리하여 관리하기 위한 인터페이스입니다.
