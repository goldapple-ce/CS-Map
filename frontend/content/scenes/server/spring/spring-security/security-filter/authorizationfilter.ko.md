# 한눈에 보기

AuthorizationFilter는 Authentication과 HTTP 요청을 AuthorizationManager에 전달하여 `인가를 수행`합니다.
인가에 성공하면 다음 Filter로 진행하고, 실패하면 `AuthorizationDeniedException을 발생`시킵니다.
익명 사용자도 Authentication이 존재하지만, authenticated() 조건에서는 인증된 사용자로 인정되지 않아 접근이 거부될 수 있습니다.

---

# AuthorizationFilter

AuthorizationFilter는 Spring Security에서 HTTP 요청에 대한 `인가를 수행`하는 Filter입니다.
SecurityContextHolder에 저장된 `Authentication을 이용`하여 사용자가 요청한 리소스에 접근할 권한이 있는지 판단합니다.
실제 인가 판단은 `AuthorizationManager에 위임`하며, 인가에 실패하면 AccessDeniedException을 발생시킵니다.

---

# AuthorizationFilter의 동작

핵심 구현은 다음과 같습니다.

```java
public class AuthorizationFilter extends GenericFilterBean {

    private final AuthorizationManager<HttpServletRequest> authorizationManager;
    private SecurityContextHolderStrategy securityContextHolderStrategy = SecurityContextHolder.getContextHolderStrategy();

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain chain) throws IOException, ServletException {
        HttpServletRequest request = (HttpServletRequest) servletRequest;
        HttpServletResponse response = (HttpServletResponse) servletResponse;

        AuthorizationResult result = this.authorizationManager.authorize(this::getAuthentication, request);

        if (result != null && !result.isGranted()) {
            throw new AuthorizationDeniedException("Access Denied", result);
        }

        chain.doFilter(request, response);
    }

    private Authentication getAuthentication() {
        Authentication authentication = this.securityContextHolderStrategy.getContext().getAuthentication();

        if (authentication == null) {
            throw new AuthenticationCredentialsNotFoundException("An Authentication object was not found in the SecurityContext");
        }

        return authentication;
    }
}
```

1. `getAuthentication()`: SecurityContextHolder에서 Authentication을 조회합니다. 존재하지 않으면 AuthenticationCredentialsNotFoundException을 발생시킵니다.
2. `authorizationManager.authorize()`: Authentication과 HTTP 요청을 바탕으로 인가를 판단합니다.
3. `isGranted()`: 인가가 거부되었다면 AuthorizationDeniedException을 발생시킵니다.
4. `chain.doFilter()`: 인가에 성공하면 다음 Filter로 요청을 전달합니다.

여기서 AuthorizationDeniedException은 AccessDeniedException을 상속하므로, 앞서 실행된 ExceptionTranslationFilter에서 처리할 수 있습니다.

---

# AuthorizationManager

AuthorizationManager는 Authentication과 요청 정보를 이용하여 접근 허용 여부를 판단하는 인터페이스입니다.
AuthorizationFilter는 인가를 직접 판단하지 않고 AuthorizationManager에 위임하며, 반환된 AuthorizationResult를 통해 접근 허용 여부를 결정합니다.

```java
public interface AuthorizationManager<T> {
    AuthorizationResult authorize(Supplier<? extends Authentication> authentication, T object);
}
```

`authorize()`는 인가에 성공하면 허용 결과를, 실패하면 거부 결과를 반환합니다.

---

# RequestMatcherDelegatingAuthorizationManager

Spring Security는 `authorizeHttpRequests()`에 정의된 규칙을 RequestMatcherDelegatingAuthorizationManager를 통해 처리합니다.

```java
.authorizeHttpRequests(auth -> auth
    .requestMatchers("/api/public/").permitAll()
    .requestMatchers("/api/admin/").hasRole("ADMIN")
    .anyRequest().authenticated()
)
```

RequestMatcherDelegatingAuthorizationManager는 HTTP 요청에 일치하는 RequestMatcher를 찾은 뒤, 해당 규칙을 담당하는 AuthorizationManager에 인가 판단을 위임합니다.

대표적인 구현체는 다음과 같습니다.

- `SingleResultAuthorizationManager`: permitAll()처럼 항상 허용하거나 거부하는 규칙을 처리합니다.
- `AuthorityAuthorizationManager`: hasRole(), hasAuthority()처럼 사용자의 권한을 검사합니다.
- `AuthenticatedAuthorizationManager`: authenticated(), fullyAuthenticated(), anonymous()처럼 사용자의 인증 상태를 검사합니다.

---

# AuthenticatedAuthorizationManager

AuthenticatedAuthorizationManager는 Authentication의 인증 수준을 기준으로 접근 여부를 판단합니다.
특히 authenticated()는 Authentication의 isAuthenticated() 값만 검사하지 않고, `AuthenticationTrustResolver를 통해 익명 사용자인지도 확인`합니다.

AuthenticationTrustResolver의 핵심 판단 로직은 다음과 같습니다.

```java
default boolean isAuthenticated(Authentication authentication) {
    return authentication != null
            && authentication.isAuthenticated()
            && !isAnonymous(authentication);
}
```

여기서 AnonymousAuthenticationToken은 isAuthenticated()가 true이지만, isAnonymous() 역시 true이므로 최종적으로 인증된 사용자로 인정되지 않습니다.
따라서 authenticated()가 설정된 API에 익명 사용자가 접근하면 다음과 같이 처리됩니다.

1. AnonymousAuthenticationFilter가 AnonymousAuthenticationToken을 설정합니다.
2. RequestMatcherDelegatingAuthorizationManager가 요청에 해당하는 authenticated() 규칙을 선택합니다.
3. AuthenticatedAuthorizationManager가 AuthenticationTrustResolver를 통해 익명 사용자인지 검사합니다.
4. 인증된 사용자로 인정되지 않으므로 인가 거부 결과를 반환합니다.
5. AuthorizationFilter는 AuthorizationDeniedException을 발생시킵니다.

즉, 익명 사용자는 Authentication 객체가 없어서 인가에 실패하는 것이 아니라, AuthenticatedAuthorizationManager가 익명 Authentication을 실제 인증된 사용자로 인정하지 않기 때문에 인가에 실패하는 것입니다.
