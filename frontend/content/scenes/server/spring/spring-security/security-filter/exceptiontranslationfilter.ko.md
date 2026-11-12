# 한눈에 보기

ExceptionTranslationFilter는 `이후 Filter에서 발생한` `AuthenticationException과 AccessDeniedException을 처리`합니다.
인증이 필요하면 AuthenticationEntryPoint를 호출하고, 충분히 인증된 사용자의 권한이 부족하면 AccessDeniedHandler를 호출합니다.
직접 인증이나 인가를 수행하지 않으며, 일반적인 로그인 Filter의 인증 실패는 해당 Filter의 AuthenticationFailureHandler에서 처리합니다.

---

# ExceptionTranslationFilter

ExceptionTranslationFilter는 Spring Security에서 `인증 및 인가 과정에서 발생한 예외`를 `HTTP 응답으로 처리`하는 Filter입니다.
직접 인증이나 인가를 수행하지 않고, `이후 Filter에서 발생한` AuthenticationException과 AccessDeniedException을 감지하여 AuthenticationEntryPoint 또는 AccessDeniedHandler에 처리를 위임합니다.

---

# Filter Chain에서의 역할

ExceptionTranslationFilter는 일반적으로 `AuthorizationFilter보다 먼저 실행`됩니다.
따라서 AuthorizationFilter가 발생시킨 AccessDeniedException이 앞선 ExceptionTranslationFilter로 전파되어 처리될 수 있습니다.

예를 들어 익명 사용자가 `/api/admin`에 접근하면 다음과 같이 동작합니다.

1. AnonymousAuthenticationFilter가 AnonymousAuthenticationToken을 설정합니다.
2. ExceptionTranslationFilter가 다음 Filter를 실행합니다.
3. AuthorizationFilter가 접근 권한을 검사하고 AccessDeniedException을 발생시킵니다.
4. ExceptionTranslationFilter가 현재 사용자를 익명 사용자로 판단합니다.
5. AuthenticationEntryPoint가 인증을 요구하는 응답을 처리합니다.

여기서 중요한 점은 ExceptionTranslationFilter가 `자신보다 앞에서 발생해 이미 처리된 예외까지 모두 처리하는 것은 아니라는 것`입니다.
예를 들어 UsernamePasswordAuthenticationFilter에서 발생한 인증 실패는 일반적으로 AbstractAuthenticationProcessingFilter의 AuthenticationFailureHandler가 직접 처리합니다.
따라서 ExceptionTranslationFilter는 자신보다 뒤쪽 Filter Chain에서 전파된 인증 및 인가 예외를 HTTP 응답 처리로 연결하는 역할을 수행합니다.

---

# ExceptionTranslationFilter의 동작

ExceptionTranslationFilter는 다음 Filter를 실행한 뒤, 예외가 발생하면 예외 종류와 현재 사용자의 인증 상태에 따라 처리 방법을 결정합니다.
핵심 구현은 다음과 같습니다.

```java
public class ExceptionTranslationFilter extends GenericFilterBean {

    private AuthenticationEntryPoint authenticationEntryPoint;
    private AccessDeniedHandler accessDeniedHandler = new AccessDeniedHandlerImpl();
    private AuthenticationTrustResolver authenticationTrustResolver = new AuthenticationTrustResolverImpl();
    private final RequestCache requestCache;

    private void doFilter(HttpServletRequest request, HttpServletResponse response, FilterChain chain) throws IOException, ServletException {
        try {
            chain.doFilter(request, response);
        } catch (AuthenticationException ex) {
            handleAuthenticationException(request, response, chain, ex);
        } catch (AccessDeniedException ex) {
            handleAccessDeniedException(request, response, chain, ex);
        }
    }

    private void handleAuthenticationException(HttpServletRequest request, HttpServletResponse response, FilterChain chain, AuthenticationException exception) throws IOException, ServletException {
        sendStartAuthentication(request, response, chain, exception);
    }

    private void handleAccessDeniedException(HttpServletRequest request, HttpServletResponse response, FilterChain chain, AccessDeniedException exception) throws IOException, ServletException {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (this.authenticationTrustResolver.isAnonymous(authentication) || this.authenticationTrustResolver.isRememberMe(authentication)) {
            sendStartAuthentication(request, response, chain, new InsufficientAuthenticationException("Full authentication is required"));
        } else {
            this.accessDeniedHandler.handle(request, response, exception);
        }
    }
}
```

1. `chain.doFilter()`: 다음 Filter를 실행하며 인증 또는 인가 관련 예외가 발생하는지 확인합니다.
2. `handleAuthenticationException()`: AuthenticationException이 발생하면 AuthenticationEntryPoint로 연결합니다.
3. `handleAccessDeniedException()`: AccessDeniedException이 발생하면 현재 Authentication을 확인합니다.
4. `AuthenticationTrustResolver`: 익명 사용자 또는 RememberMe 사용자라면 추가 인증이 필요한 것으로 판단합니다.
5. `AccessDeniedHandler`: 충분히 인증된 사용자에게 권한이 없는 경우 접근 거부를 처리합니다.

---

# AuthenticationException과 AccessDeniedException

- `AuthenticationException`: 인증에 실패했거나 유효한 인증 정보를 확보하지 못한 경우 발생합니다.
- `AccessDeniedException`: 요청한 리소스에 접근할 권한이 없을 때 발생합니다.

예를 들어 AuthorizationFilter에서 인증되지 않은 사용자가 보호된 API에 접근하면 AccessDeniedException이 발생할 수 있습니다.
ExceptionTranslationFilter는 이때 AuthenticationTrustResolver를 통해 익명 사용자임을 확인하고 AuthenticationEntryPoint로 전달합니다.

---

# AccessDeniedException인데 왜 익명 사용자인지 확인할까?

AnonymousAuthenticationFilter는 인증 정보가 없는 요청에도 AnonymousAuthenticationToken을 설정합니다.
따라서 익명 사용자 역시 Authentication 객체를 가지고 있지만, 실제 로그인을 완료한 사용자는 아닙니다.

AuthorizationFilter는 익명 사용자가 보호된 리소스에 접근하면 AccessDeniedException을 발생시킵니다.
이때 ExceptionTranslationFilter는 `isAnonymous()`를 통해 인증이 필요한 상황인지, 권한이 부족한 상황인지 구분합니다.

- 익명 사용자: 인증이 필요하므로 AuthenticationEntryPoint를 호출합니다. 일반적으로 401 응답을 반환합니다.
- 인증된 사용자: 권한이 부족하므로 AccessDeniedHandler를 호출합니다. 일반적으로 403 응답을 반환합니다.

즉, AccessDeniedException은 인가 실패를 의미하지만, 익명 사용자에게는 인증을 요구하고 인증된 사용자에게는 접근을 거부하기 위해 인증 상태를 다시 확인하는 것입니다.
