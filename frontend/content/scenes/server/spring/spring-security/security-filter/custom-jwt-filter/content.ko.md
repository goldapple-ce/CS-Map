# JWT Filter란?

JWT Filter는 클라이언트가 전달한 JWT를 검증하고, 인증된 사용자의 정보를 Spring Security에 등록하는 역할을 수행하는 필터입니다.
JWT 기반 인증에서는 사용자가 로그인한 후 발급받은 Access Token을 이후 API 요청에 포함하여 전달합니다.
서버는 해당 토큰을 검증하여 사용자를 식별하고, 인증 정보를 바탕으로 요청한 리소스에 대한 접근 권한을 판단합니다.

---

# JWT 기반 인증의 특징

JWT 기반 인증의 대표적인 특징은 `토큰 자체에 사용자 식별 정보와 같은 데이터를 포함`할 수 있다는 점입니다.
모든 토큰이 이러한 정보를 직접 가지고 있는 것은 아닙니다. 토큰은 단순히 서버에 저장된 정보를 조회하기 위한 식별자일 수도 있습니다.
이 차이는 세션 기반 인증과 비교하면 쉽게 이해할 수 있습니다.
`세션 기반 인증`에서는 `서버가 사용자의 인증 상태를 저장`하고, 클라이언트에게 세션 ID를 전달합니다.
이후 요청에서는 세션 ID를 이용해 서버에 저장된 사용자 인증 정보를 조회합니다.
반면 `JWT 기반 인증`에서는 토큰 자체에 사용자 식별 정보를 포함할 수 있으므로, 서버가 `별도의 세션 저장소를 조회하지 않고도` 토큰을 검증하여 사용자를 식별할 수 있습니다.
이러한 특성을 활용하면 서버가 사용자별 세션 상태를 관리하지 않는 `Stateless 인증 구조`를 구현할 수 있습니다.
다만 JWT를 사용한다고 모든 인증 시스템이 반드시 Stateless가 되는 것은 아닙니다. 토큰 폐기 목록이나 Refresh Token 등의 상태를 별도로 관리할 수도 있기 때문입니다.

## JWT는 수평 확장에 유리할까?

JWT는 세션 기반 인증보다 `수평 확장에 유리하다`는 설명을 자주 볼 수 있습니다.
일반적으로 세션 정보를 보유한 서버만 사용자 인증을 처리할 수 있다는 점을 이유로 제시합니다.
하지만 이 설명만으로는 충분하지 않습니다.
세션 정보를 Redis와 같은 공통 저장소에서 관리한다면 여러 서버가 동일한 세션 정보를 조회할 수 있으므로, `세션 기반 인증 역시 수평 확장이 가능`합니다.
따라서 두 방식의 차이는 수평 확장이 가능한지 여부보다는 인증 상태를 관리하는 방식에 있습니다.
세션 기반 인증은 공통 세션 저장소를 사용할 경우 인증 과정에서 해당 저장소에 의존하지만, JWT 기반 Stateless 인증은 각 서버가 필요한 검증 키만 가지고 있다면 독립적으로 토큰을 검증할 수 있습니다.
즉, JWT의 장점은 수평 확장 자체보다는 `서버 간 인증 상태 공유에 대한 의존성을 줄일 수 있다는 `점에 있습니다.

---

# JWT Filter의 구조

Spring Security는 OAuth2 Resource Server를 통해 JWT 인증을 지원하지만, 애플리케이션의 인증 구조에 맞춰 JWT Filter를 직접 구현할 수도 있습니다.
이 글에서는 로그인 성공 시 JWT를 발급하고, 이후 API 요청에서 JWT를 검증하는 커스텀 구조를 사용합니다.
따라서 아래 구조는 Spring Security에서 반드시 따라야 하는 정형화된 구조가 아니라, 여러 로그인 방식을 하나의 JWT 발급 과정으로 통합하기 위한 구현 방식입니다.
전체 구조는 로그인 과정과 API 인증 과정으로 나눌 수 있습니다.

## 로그인 Filter 구조

JWT는 반드시 Filter에서 발급해야 하는 것은 아닙니다. Controller에서 사용자 인증을 처리하고 토큰을 발급하는 방식도 가능합니다.
하지만 이 구조에서는 `AuthenticationSuccessHandler를 커스터마이징`하여 로그인 성공 이후 JWT를 발급하도록 구성했습니다.
그 이유는 UsernamePassword 로그인과 OAuth2 로그인처럼 `서로 다른 인증 방식`을 하나의 토큰 발급 과정으로 `통합`하기 위해서입니다.
Spring Security에서는 각 인증 Filter가 사용자 인증을 처리하고, 인증에 성공하면 AuthenticationSuccessHandler를 호출할 수 있습니다.

- `AbstractAuthenticationProcessingFilter`: 로그인 요청을 처리하는 인증 Filter의 기반 클래스입니다. 대표적으로 UsernamePasswordAuthenticationFilter와 OAuth2LoginAuthenticationFilter가 이를 상속합니다.
- `AuthenticationSuccessHandler`: 인증 성공 이후 수행할 작업을 정의하는 인터페이스입니다.
- `CustomAuthenticationSuccessHandler`: 개발자가 구현한 성공 핸들러로, 인증 성공 시 JWT를 발급하는 역할을 수행합니다.
- `JWT Provider`: 실제로 JWT를 생성하는 역할을 수행합니다.

두 로그인 방식은 인증 과정에서 차이가 있지만, 인증이 완료되면 공통된 AuthenticationSuccessHandler를 통해 JWT를 발급할 수 있습니다.

## API 인증 구조

로그인 성공 이후 클라이언트는 발급받은 Access Token을 API 요청에 포함하여 전달합니다.
커스텀 JWT Filter는 전달받은 토큰을 검증하고, 인증된 사용자 정보를 Spring Security에서 사용할 수 있도록 등록합니다.

- `CustomJWTFilter`: JWT를 추출해 JwtProvider에 검증을 요청하고, 반환된 Authentication을 SecurityContextHolder에 등록합니다.
- `JwtProvider`: JWT의 Signature, 만료 시간 등 필요한 유효성 조건을 검증하고 Authentication을 반환합니다.
- `SecurityContextHolder`: 현재 실행 흐름의 SecurityContext를 관리합니다.
- `AuthorizationFilter`: Authentication과 접근 정책을 바탕으로 요청한 리소스에 대한 접근을 허용하거나 거부합니다.

여기서 중요한 점은 JWT Filter가 인증과 인가를 모두 수행하는 것은 아니라는 것입니다.
JWT Filter는 토큰을 검증하여 Authentication을 구성하고, AuthorizationFilter는 해당 인증 정보를 이용하여 접근 권한을 판단합니다.

---

# Security Filter Chain에 등록

작성한 로그인 Filter와 JWT Filter를 Security Filter Chain에 등록하고, 인증 성공 시 공통 AuthenticationSuccessHandler를 사용하도록 설정합니다.
이 구조에서는 기본 Form Login을 비활성화하고 UsernamePasswordAuthenticationFilter를 직접 등록하여 일반 로그인을 처리합니다.
또한 UsernamePassword와 OAuth2 로그인에 동일한 CustomAuthenticationSuccessHandler를 연결하여 JWT 발급 로직을 공통으로 사용합니다.

```java
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final AuthenticationConfiguration authenticationConfiguration;
    private final JwtProvider jwtProvider;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        var successHandler = new CustomAuthenticationSuccessHandler(jwtProvider);

        return http
                .httpBasic(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)
                .oauth2Login(oauth2 -> oauth2
                        .successHandler(successHandler)
                )
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/login").permitAll()
                        .anyRequest().authenticated()
                )
                .addFilter(createLoginFilter(successHandler))
                .addFilterBefore(
                        new CustomJWTFilter(jwtProvider),
                        UsernamePasswordAuthenticationFilter.class
                )
                .build();
    }

    private UsernamePasswordAuthenticationFilter createLoginFilter(
            AuthenticationSuccessHandler successHandler
    ) throws Exception {
        var filter = new UsernamePasswordAuthenticationFilter(
                authenticationConfiguration.getAuthenticationManager()
        );

        filter.setFilterProcessesUrl("/api/auth/login");
        filter.setAuthenticationSuccessHandler(successHandler);
        return filter;
    }
}
```

- `formLogin()`: 기본 Form Login을 비활성화합니다. UsernamePasswordAuthenticationFilter는 직접 생성하여 등록하므로 계속 사용할 수 있습니다.
- `AuthenticationConfiguration`: 기존 AuthenticationManager를 가져와 로그인 Filter에 연결합니다. DaoAuthenticationProvider가 구성되어 있다면 UserDetailsService 기반 인증을 사용할 수 있습니다.
- `CustomAuthenticationSuccessHandler`: UsernamePassword와 OAuth2 로그인에 공통으로 등록하여 인증 성공 후 JWT를 발급합니다.
- `addFilter()`: 직접 생성한 UsernamePasswordAuthenticationFilter를 Security Filter Chain에 등록합니다.
- `addFilterBefore()`: CustomJWTFilter를 UsernamePasswordAuthenticationFilter보다 앞에 배치합니다. 두 번째 인자는 실제 필터 인스턴스가 아니라 실행 순서를 지정하는 기준입니다.

이렇게 구성하면 로그인 방식별 인증 처리는 각각의 Filter가 담당하고, JWT 발급은 공통 AuthenticationSuccessHandler가 담당합니다.
이후 API 요청에서는 CustomJWTFilter가 JwtProvider에 JWT 검증을 요청하고, 반환된 Authentication을 SecurityContextHolder에 등록합니다. AuthorizationFilter는 이 인증 정보로 접근 권한을 판단합니다.
