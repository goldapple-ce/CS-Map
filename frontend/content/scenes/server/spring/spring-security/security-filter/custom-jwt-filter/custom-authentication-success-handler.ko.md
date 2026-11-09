# 한눈에 보기

CustomAuthenticationSuccessHandler는 AuthenticationSuccessHandler를 직접 구현하여 인증 성공 이후 JWT를 발급하는 클래스입니다.
UsernamePassword와 OAuth2 로그인에 공통으로 적용하여 인증 방식과 관계없이 `Access Token과 Refresh Token을 발급`할 수 있습니다.
발급한 토큰은 HttpOnly `쿠키를 통해 클라이언트에 전달`하며, JWT 발급 로직을 하나의 구현체에서 관리할 수 있습니다.

---

# CustomAuthenticationSuccessHandler

CustomAuthenticationSuccessHandler는 AuthenticationSuccessHandler를 직접 구현하여 로그인 성공 이후 JWT를 발급하는 클래스입니다.
이 구조에서는 인증된 Authentication을 이용해 `Access Token과 Refresh Token을 생성`하고, 각각 HttpOnly `쿠키로 클라이언트에 전달`합니다.
Access Token은 API 인증에 사용하고, Refresh Token은 Access Token이 만료되었을 때 새로운 토큰을 발급받는 데 사용합니다.

---

# 구현

```java
public class CustomAuthenticationSuccessHandler
        implements AuthenticationSuccessHandler {

    private final JwtProvider jwtProvider;

    public CustomAuthenticationSuccessHandler(JwtProvider jwtProvider) {
        this.jwtProvider = jwtProvider;
    }

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException {

        String accessToken = jwtProvider.createAccessToken(authentication);
        String refreshToken = jwtProvider.createRefreshToken(authentication);

        ResponseCookie accessCookie = ResponseCookie.from("access_token", accessToken)
                .httpOnly(true)
                .secure(true)
                .sameSite("Lax")
                .path("/")
                .maxAge(Duration.ofMinutes(15))
                .build();

        ResponseCookie refreshCookie = ResponseCookie.from("refresh_token", refreshToken)
                .httpOnly(true)
                .secure(true)
                .sameSite("Lax")
                .path("/api/auth/refresh")
                .maxAge(Duration.ofDays(7))
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, accessCookie.toString());
        response.addHeader(HttpHeaders.SET_COOKIE, refreshCookie.toString());
        response.setStatus(HttpServletResponse.SC_OK);
    }
}
```

- `createAccessToken()`: API 인증에 사용할 Access Token을 발급합니다.
- `createRefreshToken()`: Access Token 재발급에 사용할 Refresh Token을 발급합니다.
- `HttpOnly`: JavaScript에서 쿠키 값을 직접 읽을 수 없도록 설정합니다.
- `Secure`: HTTPS 연결에서만 쿠키를 전송하도록 설정합니다.
- `SameSite`: 다른 Site에서 발생하는 요청에 대한 쿠키 전송을 제한합니다.
- `Path`: Access Token은 일반 API 요청에, Refresh Token은 재발급 API에만 전송되도록 구분합니다.
- `MaxAge`: Access Token은 15분, Refresh Token은 7일로 쿠키 유효 기간을 설정합니다.

위 코드는 JwtProvider가 두 토큰의 만료 시간과 용도를 구분하여 생성한다고 가정합니다.
Refresh Token은 발급 이후 서버에서 해시값 등을 저장하여 회전 및 폐기할 수 있도록 관리하는 것이 좋습니다. 재발급 시에도 Refresh Token의 서명, 만료 시간, 토큰 용도와 서버 측 상태를 검증해야 합니다.

이렇게 구성하면 UsernamePassword 로그인과 OAuth2 로그인이 동일한 CustomAuthenticationSuccessHandler를 통해 두 토큰을 발급할 수 있습니다.
