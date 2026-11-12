# 한눈에 보기

AnonymousAuthenticationFilter는 SecurityContext에 Authentication이 없다면 AnonymousAuthenticationToken을 설정합니다.
AnonymousAuthenticationToken의 `isAuthenticated()는 true`이지만, Spring Security는 이를 실제 인증된 사용자와 구분하여 인가를 처리합니다.

---

# AnonymousAuthenticationFilter

AnonymousAuthenticationFilter는 Spring Security에서 `인증 정보가 없는 요청`에 `익명 Authentication을 설정`하는 Filter입니다.
앞선 인증 Filter에서 Authentication이 설정되지 않았다면 AnonymousAuthenticationToken을 생성하여 SecurityContext에 저장합니다.
이를 통해 인증되지 않은 요청도 공통된 Authentication 구조를 이용하여 후속 보안 처리를 수행할 수 있습니다.

---

# 익명 Authentication이 존재하는데 왜 인증되지 않은 사용자일까?

Spring Security는 Authentication 객체의 존재 여부나 isAuthenticated()만으로 사용자의 로그인 여부를 판단하지 않습니다.
AuthenticationTrustResolver를 통해 AnonymousAuthenticationToken인지 구분합니다.

---

# AnonymousAuthenticationFilter의 동작

핵심 구현은 다음과 같습니다.

```java
public class AnonymousAuthenticationFilter extends GenericFilterBean implements InitializingBean {

    private SecurityContextHolderStrategy securityContextHolderStrategy = SecurityContextHolder.getContextHolderStrategy();
    private Object principal;
    private List<GrantedAuthority> authorities;
    private String key;

    public AnonymousAuthenticationFilter(String key) {
        this(key, "anonymousUser", AuthorityUtils.createAuthorityList("ROLE_ANONYMOUS"));
    }

    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain) throws IOException, ServletException {
        Supplier<SecurityContext> deferredContext = this.securityContextHolderStrategy.getDeferredContext();
        this.securityContextHolderStrategy.setDeferredContext(defaultWithAnonymous((HttpServletRequest) req, deferredContext));
        chain.doFilter(req, res);
    }

    private SecurityContext defaultWithAnonymous(HttpServletRequest request, SecurityContext currentContext) {
        Authentication currentAuthentication = currentContext.getAuthentication();

        if (currentAuthentication == null) {
            Authentication anonymous = createAuthentication(request);
            SecurityContext anonymousContext = this.securityContextHolderStrategy.createEmptyContext();
            anonymousContext.setAuthentication(anonymous);
            return anonymousContext;
        }

        return currentContext;
    }

    protected Authentication createAuthentication(HttpServletRequest request) {
        AnonymousAuthenticationToken token = new AnonymousAuthenticationToken(this.key, this.principal, this.authorities);
        token.setDetails(this.authenticationDetailsSource.buildDetails(request));
        return token;
    }
}
```

1. `getDeferredContext()`: 현재 요청의 SecurityContext를 지연 조회할 수 있는 객체를 가져옵니다.
2. `defaultWithAnonymous()`: Authentication이 존재하는지 확인하고, 없다면 익명 Authentication을 생성합니다.
3. `createAuthentication()`: AnonymousAuthenticationToken을 생성합니다.
4. `setDeferredContext()`: 익명 Authentication이 필요한 경우 이를 포함한 SecurityContext를 사용할 수 있도록 설정합니다.
5. `chain.doFilter()`: 다음 Filter로 요청을 전달합니다.

기존 Authentication이 존재한다면 익명 Authentication으로 덮어쓰지 않습니다.

---

# AnonymousAuthenticationToken

AnonymousAuthenticationFilter는 기본적으로 다음과 같은 정보를 가진 AnonymousAuthenticationToken을 생성합니다.

- `principal`: `anonymousUser`
- `authorities`: `ROLE_ANONYMOUS`
- `authenticated`: `true`

여기서 주의할 점은 AnonymousAuthenticationToken의 `isAuthenticated()가 true`를 반환한다는 것입니다.
이는 AnonymousAuthenticationToken 객체 자체가 유효한 Authentication으로 생성되었다는 의미이지, 실제 사용자가 로그인을 완료했다는 의미는 아닙니다.
