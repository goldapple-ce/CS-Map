# 한눈에 보기

`SecurityFilterChain`은 특정 요청에 적용할 Spring Security Filter 목록입니다.

---

# 동작 방식

1. `FilterChainProxy`는 등록된 SecurityFilterChain을 순서대로 확인합니다.
2. 현재 요청과 처음 일치하는 Chain을 찾으면 그 Chain의 Security Filter 목록을 사용합니다.

---

# 개발자가 개입하는 지점

가장 기본적인 설정은 `HttpSecurity`를 구성한 뒤 `SecurityFilterChain` Bean으로 반환하는 방식입니다.

```java
@Configuration
public class SecurityConfig {

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/public/**").permitAll()
                .requestMatchers("/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .formLogin(Customizer.withDefaults())
            .logout(Customizer.withDefaults())
            .build();
    }
}
```

이 코드는 다음 내용을 설정합니다.

- `/public/**`: 로그인하지 않아도 접근할 수 있습니다.
- `/admin/**`: `ROLE_ADMIN` 권한이 필요합니다.
- 그 외 요청: 로그인한 사용자만 접근할 수 있습니다.
- `formLogin()`: username/password 기반 로그인을 사용합니다.
- `logout()`: Spring Security의 logout 처리를 사용합니다.
- `build()`: 지금까지의 설정으로 SecurityFilterChain을 만듭니다.

Spring Security는 이렇게 등록된 SecurityFilterChain Bean들을 모아 `FilterChainProxy`가 선택할 후보로 사용합니다.

custom Security Filter가 필요하면 기존 Filter를 기준으로 실행 위치를 지정할 수 있습니다.

```java
http.addFilterBefore(
    customAuthenticationFilter,
    UsernamePasswordAuthenticationFilter.class
);
```

이 설정은 custom Filter를 `UsernamePasswordAuthenticationFilter`보다 먼저 실행하도록 SecurityFilterChain에 추가합니다. custom Filter를 일반 Servlet Filter로도 등록하면 두 체인에서 중복 실행될 수 있으므로 한쪽에만 등록해야 합니다.

---

# 헷갈리기 쉬운 점

## 먼저 일치한 Chain 하나만 선택됩니다

여러 Chain의 Filter를 합쳐서 실행하지 않습니다. `/api/**`처럼 구체적인 조건은 `/**`처럼 넓은 조건보다 먼저 확인되도록 구성해야 합니다.

## SecurityFilterChain과 Security Filter는 다릅니다

SecurityFilterChain은 요청 조건과 Filter 목록을 가진 구성 객체이고, Security Filter는 인증이나 인가 같은 처리를 실제로 수행하는 Filter입니다.

## SecurityFilterChain은 Filter를 직접 호출하지 않습니다.

SecurityFilterChain은 요청에 맞는 조건과 Filter 목록을 제공하고, 실제 Filter 실행은 FilterChainProxy 내부에서 이루어집니다.

---

# 참고 자료

- [Spring Security — SecurityFilterChain API](https://docs.spring.io/spring-security/reference/api/java/org/springframework/security/web/SecurityFilterChain.html)
- [Spring Security — Multiple SecurityFilterChain Instances](https://docs.spring.io/spring-security/reference/servlet/configuration/java.html#_multiple_httpsecurity_instances)
