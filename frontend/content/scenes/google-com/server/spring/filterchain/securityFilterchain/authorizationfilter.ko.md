# 개요

> SpringSecurity 6 이전에는 FilterSecurityInterceptor가 해당 역할을 담당했지만, 이후에는 AuthorizationFilter로 바꼈습니다.

사용자의 요청을 최종적으로 통과시킬지 결정하는 인가(Authorization) 담당 필터입니다.  
좀 더 정확히는 AuthorizationFilter는 직접 권한을 판단하지 않고, `권한 판단은 AuthorizationManager에게 위임`합니다.

---

# [AuthorizationManager](https://docs.spring.io/spring-security/reference/servlet/authorization/architecture.html#_the_authorizationmanager)

AuthorizationManager는 `인가를 시도`하고, 권한이 없으면 `AccessDeniedException`을 던지는 역할을 합니다.  
AuthorizationManager의 종류는 크게 4개로 볼수 있습니다.

- RequestMatcherDelegatingAuthorizationManager
  - AuthenticatedAuthorizationManager
  - AuthoritiesAuthorizationManager
  - SingleResultAuthorizationManager

## [RequestMatcherDelegatiAuthorizationManager](https://docs.spring.io/spring-security/reference/api/java/org/springframework/security/web/access/intercept/RequestMatcherDelegatingAuthorizationManager.html)

리스트 형식을 보면, RequestMatcherDelegatingAuthorizationManager 아래 모든 AuthorizationManager가 있죠?  
굳이 이렇게 표한이유는 RequestMatcherDelegatiAuthorizationManager은 `RequestMatcher로 요청 URL과 매칭되는 Authorization Manager에게 인가를 위임`하기 때문입니다.  
그럼 요청 URL에 맞는 Authorization Manager는 어떻게 찾을까요?

### AuthorizeHttpRequestsConfigurer

답은 AuthorizeHttpRequestsConfigurer에 있습니다. 다음 코드를 예시로 봅시다.

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(auth -> auth
                .anyRequest()
                .authenticated()

                .requestMatchers("/admin/**")
                .hasRole("ADMIN")

                .requestMatchers("/public/**")
                .permitAll()

                .anyRequest("/deprecated/**")
                .denyAll()
            );
        return http.build();
    }
}
```

현재 "public/"은 permitAll, "deprecated/"는 denyAll, "admin/"은 hasRole, 나머지는 authenticated로 돼있는걸 알 수 있습니다.  
각 역할마다 담당하는 Authorization Manager가 달라지게 됩니다.

- authenticated : AuthenticatedAuthorizationManager
- hasRole : AuthoritiesAuthorizationManager
- permitAll & denyAll : SingleResultAuthorizationManager

## [AuthenticatedAuthorizationManager](https://docs.spring.io/spring-security/site/docs/current/api/org/springframework/security/authorization/AuthenticatedAuthorizationManager.html)

Authentication객체가 isAuthenticated가 돼있는지만 판단합니다. 즉, `사용자가 인증만 됐다면 허락`하게 됩니다.

## [AuthoritiesAuthorizationManager](https://docs.spring.io/spring-security/reference/api/java/org/springframework/security/authorization/AuthoritiesAuthorizationManager.html)

`특정 권한(Authority)을 가진 사용자에게만 접근을 허용`합니다. 주로 사용자의 권한(예: ROLE_USER, ROLE_ADMIN)을 기반으로 접근을 제어합니다.

## [SingleResultAuthorizationManager](https://docs.spring.io/spring-security/reference/api/java/org/springframework/security/authorization/SingleResultAuthorizationManager.html)

사용자에 상관없이 `모두 허용하거나, 모두 거부`합니다.

---

# 허용과 거부

그럼 각 AuthorizationManager가 허용과 거부를 하면 어떻게 될까요? 앞서 말했듯이 AccessDeniedException을 던집니다.  
`해당 Exception은 ExceptionTranslationFilter가 잡고, 처리`하게 됩니다.  
여기서 "AuthenticatedAuthorizationManager에서 거부한거면 인증이 안됐다는 건데, AccessDeniedException이 맞나?"라는 생각이 드실 수 있습니다.  
이에 대한 해결은 ExceptionTranslationFilter에서 알 수 있습니다.

---

# 참고 자료

- [Spring Security — Authorization Architecture](https://docs.spring.io/spring-security/reference/servlet/authorization/architecture.html)
- [velog.io/@identity230c](https://velog.io/@identity230c/spring-security-AuthorizationManager-%EB%9C%AF%EC%96%B4%EB%B3%B4%EA%B8%B0)
