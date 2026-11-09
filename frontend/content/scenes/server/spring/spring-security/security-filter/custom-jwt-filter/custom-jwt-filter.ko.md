# 한눈에 보기

CustomJWTFilter는 쿠키에서 `Access Token을 추출`하고, JwtProvider를 통해 `유효성을 검증`합니다.
검증된 Claims에서 사용자 식별자와 권한을 추출하여 Authentication을 생성하고, 이를 `SecurityContextHolder에 등록`합니다.
JWT 검증에 `실패한 경우`에는 인증 정보를 등록하지 않고 `다음 Filter로 요청을 전달`하며, 최종적인 접근 허용 여부는 AuthorizationFilter와 Spring Security의 예외 처리 구조에 맡깁니다.

---

# CustomJWTFilter

CustomJWTFilter는 클라이언트가 전달한 `JWT를 검증`하고, 인증 정보를 `SecurityContextHolder에 등록`하는 Filter입니다.
앞서 CustomAuthenticationSuccessHandler에서 Access Token을 HttpOnly 쿠키로 전달했으므로, CustomJWTFilter에서는 쿠키에서 Access Token을 추출하여 검증합니다.
JWT에는 사용자 식별자와 권한 정보가 포함되어 있으므로, 별도의 UserDetailsService 조회 없이 Authentication을 생성할 수 있습니다.

---

# CustomJWTFilter 구현

CustomJWTFilter는 `OncePerRequestFilter를 상속`하여 구현합니다.
OncePerRequestFilter는 하나의 요청 디스패치에서 동일한 Filter가 중복 실행되지 않도록 제어하는 기반 클래스입니다.

```java
public class CustomJWTFilter extends OncePerRequestFilter {

    private final JwtProvider jwtProvider;

    public CustomJWTFilter(JwtProvider jwtProvider) {
        this.jwtProvider = jwtProvider;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        Cookie cookie = WebUtils.getCookie(request, "access_token");

        if (cookie != null) {
            try {
                Claims claims = jwtProvider.validateAccessToken(cookie.getValue());

                List<String> roles = claims.get("roles", List.class);

                List<GrantedAuthority> authorities = roles.stream()
                        .map(SimpleGrantedAuthority::new)
                        .map(GrantedAuthority.class::cast)
                        .toList();

                Authentication authentication =
                        UsernamePasswordAuthenticationToken.authenticated(
                                claims.getSubject(),
                                null,
                                authorities
                        );

                SecurityContext context = SecurityContextHolder.createEmptyContext();
                context.setAuthentication(authentication);
                SecurityContextHolder.setContext(context);

            } catch (JwtException | IllegalArgumentException ex) {
                SecurityContextHolder.clearContext();
            }
        }

        filterChain.doFilter(request, response);
    }
}
```

- `OncePerRequestFilter`: 하나의 요청 디스패치에서 Filter가 중복 실행되지 않도록 제어합니다.
- `WebUtils.getCookie()`: 요청의 쿠키에서 Access Token을 추출합니다.
- `validateAccessToken()`: JwtProvider를 통해 Signature, 만료 시간, 토큰 용도를 검증합니다.
- `getSubject()`: 검증된 JWT에서 사용자 식별자를 추출합니다.
- `get("roles")`: 검증된 JWT에서 사용자 권한 목록을 추출합니다.
- `UsernamePasswordAuthenticationToken.authenticated()`: 사용자 식별자와 권한을 이용하여 인증된 Authentication을 생성합니다.
- `SecurityContextHolder`: Authentication을 현재 요청의 SecurityContext에 등록합니다.
- `filterChain.doFilter()`: 다음 Filter로 요청을 전달합니다.

---

# Authentication과 SecurityContextHolder

JWT의 Signature 검증에 성공했다고 해서 Spring Security가 `자동으로 인증된 사용자를 인식하는 것은 아닙니다.`
Spring Security는 Authentication을 통해 현재 사용자의 인증 정보를 관리하므로, 검증된 JWT의 Claims를 이용하여 `Authentication을 생성`해야 합니다.

```java
Authentication authentication =
        UsernamePasswordAuthenticationToken.authenticated(
                claims.getSubject(),
                null,
                authorities
        );

SecurityContext context = SecurityContextHolder.createEmptyContext();
context.setAuthentication(authentication);
SecurityContextHolder.setContext(context);
```

Authentication에는 사용자 식별자인 Principal과 권한 목록인 GrantedAuthority가 포함됩니다.
이 정보를 SecurityContextHolder에 등록하면 이후 AuthorizationFilter가 해당 인증 정보를 이용하여 접근 권한을 판단할 수 있습니다.

---

# JWT 검증 실패 처리

JWT 검증에 실패하더라도 CustomJWTFilter에서는 직접 HTTP 응답을 반환하지 않고, `SecurityContextHolder를 초기화한 뒤 다음 Filter로 요청을 전달`합니다.
인증이 필요한 요청에서 접근이 거부되면 ExceptionTranslationFilter가 예외를 처리하고, 인증되지 않은 사용자라면 AuthenticationEntryPoint를 호출하여 인증 실패 응답을 반환합니다.
다만 `permitAll()`로 허용된 API에서는 유효하지 않은 JWT가 전달되더라도 요청이 계속 진행될 수 있습니다. 이는 JWT 검증 실패를 인증 정보가 없는 상태로 취급하도록 선택했기 때문입니다.
