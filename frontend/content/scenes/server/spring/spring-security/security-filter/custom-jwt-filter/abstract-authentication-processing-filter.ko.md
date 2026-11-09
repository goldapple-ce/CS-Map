# 한눈에 보기

AbstractAuthenticationProcessingFilter는 Spring Security에서 `로그인 인증`을 처리하는 기반 Filter입니다.
UsernamePasswordAuthenticationFilter와 OAuth2LoginAuthenticationFilter 등이 상속하며, 각 인증 방식에 따른 인증 처리를 수행합니다.
`인증에 성공`하면 successfulAuthentication()을 통해 Authentication을 SecurityContext에 등록하고, `AuthenticationSuccessHandler를 호출`하여 인증 성공 이후의 작업을 처리합니다.

---

# AbstractAuthenticationProcessingFilter란?

AbstractAuthenticationProcessingFilter는 Spring Security에서 `로그인 인증`을 처리하기 위한 기반 Filter입니다.
대표적으로 `UsernamePasswordAuthenticationFilter`와 `OAuth2LoginAuthenticationFilter`가 이를 상속하며, 서로 다른 인증 방식을 사용하더라도 공통된 인증 처리 흐름을 제공합니다.
여기서 중요한 점은 인증을 수행하는 과정과 인증 성공 이후의 처리가 분리되어 있다는 것입니다.
각 Filter는 자신의 방식으로 인증을 수행하지만, `인증에 성공`하면 AbstractAuthenticationProcessingFilter가 `AuthenticationSuccessHandler를 호출`합니다.

---

# 인증 처리 과정

AbstractAuthenticationProcessingFilter는 인증 요청을 처리하고, 인증 결과에 따라 성공 또는 실패 처리를 수행합니다.
실제 인증 방식은 하위 Filter마다 다르지만, 인증 성공 이후의 처리는 `successfulAuthentication()`을 통해 공통으로 수행됩니다.
특히 `successfulAuthentication()`에서는 인증된 Authentication을 기반으로 SecurityContext를 설정한 뒤, AuthenticationSuccessHandler를 호출합니다.

```java
public abstract class AbstractAuthenticationProcessingFilter
        extends GenericFilterBean {

    private AuthenticationSuccessHandler successHandler = new SavedRequestAwareAuthenticationSuccessHandler();

    private void doFilter(HttpServletRequest request, HttpServletResponse response, FilterChain chain) throws IOException, ServletException {

        try {
            // ...
            successfulAuthentication(request, response, chain, authentication);
        } catch (AuthenticationException ex) {
            unsuccessfulAuthentication(request, response, ex);
        }
    }

    protected void successfulAuthentication(HttpServletRequest request, HttpServletResponse response, FilterChain chain, Authentication authentication
    ) throws IOException, ServletException {
        // ...
        this.successHandler.onAuthenticationSuccess(request, response, authentication);
    }
}
```

코드에서 확인할 수 있듯이 AbstractAuthenticationProcessingFilter는 기본적으로 SavedRequestAwareAuthenticationSuccessHandler를 사용합니다.
이 구현체는 로그인 성공 후 인증 이전에 저장된 요청으로 리다이렉트하는 기능을 제공하며, 별도로 SuccessHandler를 설정하면 해당 구현체로 교체됩니다.

- `doFilter()`: 인증을 시도한 결과에 따라 successfulAuthentication() 또는 unsuccessfulAuthentication()을 호출합니다.
- `successfulAuthentication()`: 인증 성공 처리를 수행한 뒤 `AuthenticationSuccessHandler.onAuthenticationSuccess()`를 호출합니다.
- `setAuthenticationSuccessHandler()`: 기본 SuccessHandler를 개발자가 구현한 CustomAuthenticationSuccessHandler로 교체합니다.

따라서 UsernamePasswordAuthenticationFilter와 OAuth2LoginAuthenticationFilter는 서로 다른 인증 과정을 거치더라도, 인증에 성공하면 부모 클래스의 `successfulAuthentication()`을 통해 설정된 AuthenticationSuccessHandler를 호출합니다.
이를 활용하면 여러 로그인 방식에 동일한 CustomAuthenticationSuccessHandler를 등록하여 JWT 발급 로직을 공통으로 처리할 수 있습니다.
