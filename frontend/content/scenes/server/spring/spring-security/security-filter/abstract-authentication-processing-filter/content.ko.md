# 한눈에 보기

AbstractAuthenticationProcessingFilter는 `로그인 요청을 판별`하고 `인증 성공 및 실패를 공통으로 처리`하는 추상 Filter입니다.
실제 인증은 하위 클래스의 attemptAuthentication()에서 `AuthenticationManager에 위임`합니다.
인증 성공 시 SecurityContext와 AuthenticationSuccessHandler를 처리하고, 실패 시 AuthenticationFailureHandler를 실행합니다.

---

# AbstractAuthenticationProcessingFilter란?

AbstractAuthenticationProcessingFilter는 Spring Security에서 `로그인 요청을 처리`하고, 인증 결과에 따라 성공 또는 실패 처리를 수행하는 추상 Filter입니다.
실제 인증 방식은 하위 클래스에서 구현하며, AbstractAuthenticationProcessingFilter는 `인증 요청을 판별하고 인증 결과를 처리`하는 공통 로직을 제공합니다.
대표적인 구현체로 UsernamePasswordAuthenticationFilter와 OAuth2LoginAuthenticationFilter가 있습니다.

---

# AbstractAuthenticationProcessingFilter의 동작

핵심 필드와 메서드는 다음과 같습니다.

```java
public abstract class AbstractAuthenticationProcessingFilter extends GenericFilterBean {

    private AuthenticationManager authenticationManager;

    private SecurityContextHolderStrategy securityContextHolderStrategy = SecurityContextHolder.getContextHolderStrategy();
    private SecurityContextRepository securityContextRepository = new RequestAttributeSecurityContextRepository();

    private AuthenticationSuccessHandler successHandler = new SavedRequestAwareAuthenticationSuccessHandler();
    private AuthenticationFailureHandler failureHandler = new SimpleUrlAuthenticationFailureHandler();

    private void doFilter(HttpServletRequest request, HttpServletResponse response, FilterChain chain) throws IOException, ServletException {
        if (!requiresAuthentication(request, response)) {
            chain.doFilter(request, response);
            return;
        }

        try {
            Authentication authResult = attemptAuthentication(request, response);

            successfulAuthentication(request, response, chain, authResult);
        } catch (AuthenticationException ex) {
            unsuccessfulAuthentication(request, response, ex);
        }
    }

    public abstract Authentication attemptAuthentication(HttpServletRequest request, HttpServletResponse response) throws AuthenticationException, IOException, ServletException;
}
```

위 코드는 주요 필드와 인증 처리 흐름만 남긴 축약 코드입니다.

1. `requiresAuthentication()`: 현재 요청이 해당 Filter에서 처리할 로그인 요청인지 확인합니다.
2. `attemptAuthentication()`: 하위 클래스에서 구현한 인증 로직을 실행합니다.
3. `successfulAuthentication()`: SecurityContext를 설정하고 AuthenticationSuccessHandler를 호출합니다.
4. `unsuccessfulAuthentication()`: 인증 실패 시 AuthenticationFailureHandler를 호출합니다.

`attemptAuthentication()`은 인증 성공 시 Authentication을 반환하고, 인증 실패 시에는 AuthenticationException을 발생시킵니다.

---

# successfulAuthentication()

인증에 성공하면 AbstractAuthenticationProcessingFilter의 `successfulAuthentication()`이 호출됩니다.

```java
protected void successfulAuthentication(HttpServletRequest request, HttpServletResponse response, FilterChain chain, Authentication authResult) throws IOException, ServletException {
    SecurityContext context = this.securityContextHolderStrategy.createEmptyContext();
    context.setAuthentication(authResult);
    this.securityContextHolderStrategy.setContext(context);

    this.securityContextRepository.saveContext(context, request, response);
    this.successHandler.onAuthenticationSuccess(request, response, authResult);
}
```

1. `setAuthentication()`: 인증된 Authentication을 SecurityContext에 설정합니다.
2. `setContext()`: SecurityContextHolder에 현재 인증 정보를 저장합니다.
3. `saveContext()`: SecurityContextRepository에 인증 정보의 저장을 위임합니다.
4. `onAuthenticationSuccess()`: AuthenticationSuccessHandler를 호출합니다.

여기서 SecurityContextRepository는 인증 정보를 어떤 방식으로 저장할지 결정합니다.
필드의 기본값은 RequestAttributeSecurityContextRepository이며, 실제 저장 방식은 Spring Security 설정에 따라 변경될 수 있습니다.

기본 AuthenticationSuccessHandler는 SavedRequestAwareAuthenticationSuccessHandler로, 인증 전에 접근하려던 URL이 저장되어 있다면 해당 주소로 리다이렉트합니다.

---

# unsuccessfulAuthentication()

인증에 실패하면 `unsuccessfulAuthentication()`이 실행됩니다.

```java
protected void unsuccessfulAuthentication(HttpServletRequest request, HttpServletResponse response, AuthenticationException failed) throws IOException, ServletException {
    this.securityContextHolderStrategy.clearContext();
    this.failureHandler.onAuthenticationFailure(request, response, failed);
}
```

1. `clearContext()`: 현재 SecurityContextHolder의 인증 정보를 제거합니다.
2. `onAuthenticationFailure()`: AuthenticationFailureHandler에 실패 처리를 위임합니다.

기본 AuthenticationFailureHandler는 SimpleUrlAuthenticationFailureHandler이며, 실패 URL이 설정되지 않았다면 일반적으로 401 응답을 반환합니다.
