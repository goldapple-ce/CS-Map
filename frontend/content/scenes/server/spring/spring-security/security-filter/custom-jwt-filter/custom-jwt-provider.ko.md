# 한눈에 보기

JwtProvider는 Access Token과 Refresh `Token을 생성하고 검증`하는 역할을 수행합니다.
Access Token에는 사용자 식별자와 권한 정보를 포함하여 CustomJWTFilter가 별도의 사용자 조회 없이 Authentication을 생성할 수 있도록 합니다.
Refresh Token은 토큰 재발급에 필요한 최소한의 정보를 포함하며, 재발급 시 현재 사용자 상태와 권한을 다시 확인하여 새로운 Access Token을 발급하도록 구성할 수 있습니다.

---

# JwtProvider란?

JwtProvider는 `JWT의 생성과 검증`을 담당하는 클래스입니다.
로그인에 성공하면 Authentication을 이용하여 Access Token과 Refresh Token을 생성하고, 이후 API 요청에서는 전달받은 JWT의 Signature와 만료 시간 등을 검증합니다.
이 구조에서는 Access Token에 사용자 식별자와 권한 정보를 포함하여, 별도의 UserDetailsService 조회 없이 Authentication을 구성할 수 있도록 합니다.

---

# JwtProvider 구현

다음은 JJWT 0.13.x와 HS256을 이용한 구현입니다.
Access Token에는 사용자 식별자와 권한을 포함하고, Refresh Token에는 사용자 식별자와 토큰 용도만 포함합니다.

---

## JWT 생성

JWT 생성에는 JJWT 라이브러리와 HS256 알고리즘을 사용합니다.
HS256은 하나의 비밀키로 Signature를 생성하고 검증하는 대칭키 기반 알고리즘이므로, JwtProvider는 동일한 SecretKey를 사용합니다.

```java
@Component
public class JwtProvider {

    private final SecretKey secretKey;

    private static final Duration ACCESS_EXPIRATION = Duration.ofMinutes(15);
    private static final Duration REFRESH_EXPIRATION = Duration.ofDays(7);

    public JwtProvider(@Value("${jwt.secret}") String secret) {
        this.secretKey = Keys.hmacShaKeyFor(
                Decoders.BASE64.decode(secret)
        );
    }

    public String createAccessToken(Authentication authentication) {
        Instant now = Instant.now();

        List<String> roles = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .toList();

        return Jwts.builder()
                .subject(authentication.getName())
                .claim("type", "access")
                .claim("roles", roles)
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plus(ACCESS_EXPIRATION)))
                .signWith(secretKey, Jwts.SIG.HS256)
                .compact();
    }

    public String createRefreshToken(Authentication authentication) {
        Instant now = Instant.now();

        return Jwts.builder()
                .subject(authentication.getName())
                .claim("type", "refresh")
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plus(REFRESH_EXPIRATION)))
                .signWith(secretKey, Jwts.SIG.HS256)
                .compact();
    }
}
```

- `SecretKey`: HS256의 Signature 생성에 사용할 비밀키입니다. Base64로 인코딩된 설정값을 디코딩하여 생성합니다.
- `createAccessToken()`: Authentication에서 사용자 식별자와 권한을 추출하여 Access Token을 생성합니다.
- `createRefreshToken()`: 사용자 식별자만 포함하여 Refresh Token을 생성합니다.
- `subject()`: JWT의 Subject에 사용자 식별자를 저장합니다.
- `claim()`: 토큰의 용도와 사용자 권한 정보를 Claims에 저장합니다.
- `expiration()`: Access Token은 15분, Refresh Token은 7일로 만료 시간을 설정합니다.
- `signWith()`: HS256과 SecretKey를 이용하여 Signature를 생성합니다.

Access Token은 API 인증에 사용하므로 사용자 권한을 포함하지만, Refresh Token은 새로운 Access Token을 발급하기 위한 용도로 사용하므로 권한을 포함하지 않습니다.
따라서 Refresh Token을 이용하여 새로운 Access Token을 발급할 때는 현재 사용자의 권한을 다시 조회하도록 구성할 수 있습니다.

---

## JWT 검증

JWT 검증에서는 Signature와 만료 시간을 확인하고, 전달받은 토큰이 Access Token인지 Refresh Token인지 구분해야 합니다.
특히 Refresh Token을 API 인증에 사용하는 것을 방지하기 위해 토큰의 용도를 확인합니다.

다음 메서드들을 앞서 작성한 JwtProvider 클래스에 추가합니다.

```java
public Claims validateAccessToken(String token) {
    return validateToken(token, "access");
}

public Claims validateRefreshToken(String token) {
    return validateToken(token, "refresh");
}

private Claims validateToken(String token, String expectedType) {
    Claims claims = Jwts.parser()
            .verifyWith(secretKey)
            .build()
            .parseSignedClaims(token)
            .getPayload();

    if (!expectedType.equals(claims.get("type", String.class))) {
        throw new JwtException("Invalid token type");
    }

    return claims;
}
```

- `verifyWith()`: JWT의 Signature를 검증할 SecretKey를 지정합니다.
- `parseSignedClaims()`: JWT를 파싱하고 Signature 및 만료 시간을 검증합니다.
- `getPayload()`: 검증된 JWT의 Claims를 반환합니다.
- `validateToken()`: 토큰의 type Claim을 확인하여 Access Token과 Refresh Token을 구분합니다.
- `validateAccessToken()`: Access Token 검증 후 Claims를 반환합니다.
- `validateRefreshToken()`: Refresh Token 검증 후 Claims를 반환합니다.

Signature가 일치하지 않거나 만료된 JWT라면 JJWT에서 예외가 발생하므로, 검증에 실패한 토큰을 인증에 사용해서는 안 됩니다.
검증에 성공한 Access Token의 Subject와 roles Claim은 CustomJWTFilter에서 Authentication을 생성하는 데 사용할 수 있습니다.
다만 이 검증은 토큰의 유효성을 확인하는 과정이며, 계정 정지나 권한 변경 또는 Refresh Token의 폐기 여부까지 확인하는 것은 아닙니다.
