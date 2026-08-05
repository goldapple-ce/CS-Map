# 한눈에 보기

`SecurityContextHolder`는 현재 요청을 처리하는 동안 사용자의 인증 정보를 꺼내거나 설정할 수 있게 하는 공간입니다.

```text
SecurityContextHolder -> SecurityContext -> Authentication
```

- `SecurityContext`: 현재 실행 흐름의 보안 정보를 담습니다.
- `Authentication`: 사용자 정보, 인증 여부와 권한을 나타냅니다.

---

# 동작 방식

로그인에 성공한 Authentication Filter는 인증된 Authentication을 담은 SecurityContext를 Holder에 설정합니다. 이후 `AuthorizationFilter`는 이 Authentication을 이용해 현재 요청을 허용할지 판단합니다.

---

# 개발자가 개입하는 지점

custom Authentication Filter를 만들거나 현재 로그인 사용자를 코드에서 조회할 때는 SecurityContextHolder를 사용할 수 있습니다.

---

# 헷갈리기 쉬운 점

## 다음 요청까지 저장하는 저장소가 아닙니다

SecurityContextHolder는 현재 실행 흐름에서 Context에 접근하게 합니다. 다음 요청에서도 로그인 상태를 유지하는 역할은 `SecurityContextRepository`가 담당합니다.

## authenticated가 항상 실제 로그인을 뜻하지는 않습니다

`AnonymousAuthenticationFilter`가 만든 익명 Authentication도 인증된 객체로 표시될 수 있습니다. `isAuthenticated()` 값 하나만으로 실제 로그인 사용자인지 판단하면 안 됩니다.

---

# 참고 자료

- [Spring Security — SecurityContextHolder](https://docs.spring.io/spring-security/reference/servlet/authentication/architecture.html#servlet-authentication-securitycontextholder)
- [Spring Security — Anonymous Authentication](https://docs.spring.io/spring-security/reference/servlet/authentication/anonymous.html)
