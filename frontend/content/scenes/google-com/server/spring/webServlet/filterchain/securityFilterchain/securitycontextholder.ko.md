현재 요청을 보낸 사용자의 인증 정보(Authentication)를 저장하고 꺼내 쓰는 저장소입니다.  
쉽게 말하면 `지금 이 요청을 보낸 사람이 누구인지 기억해두는 공간`입니다.

---

# 구조

```
SecurityContextHolder -> SecurityContext -> Authentication
```

- SecurityContextHolder : 저장소에 접근하는 역할
- SecurityContext : 인증 정보를 담는 객체
- Authentication : 실제 사용자 정보
  - authenticated : 인증 여부
  - principal: 사용자 식별자(ID)
  - credential : 비밀번호
  - authorities: 권한(ex:ROLE_USER)

여기서 중요하게 볼것은 authenticated 필드는 인증 여부라는 점입니다.
AnonymousAuthenticationFilter를 보면 더 자세히 알 수 있지만, 간단하게 말씀드리면 `로그인 하지 않은 사용자 또한 authenticated는 true`입니다.  
해당 Authentication 객체가 Spring Security 내부에서 정상적인 Authentication 상태라는 의미입니다.

---

# 각 컴포넌트들과의 관계

- `SecurityContextHolderFilter` : SecurityContext를 설정합니다.
- Authentication Filter : 인증을 성공한다면 Authentication을 등록합니다.
  - `Oatuh2LoginAuthenticationFilter`
  - `UsernamePasswordAuthenticationFilter`
  - `AnonymousAuthenticationFilter`
- `AuthorizationFilter` : AuthorizationFilter의 AuthorizationManager가 인가를 확인할 때 사용합니다.
- `ExceptionTranslationFilter` : 인증 Exception인지, 인가 Exception인지 확인할 때 사용합니다.

---

# ThreadLocal과 관계

기본적으로 `ThreadLocal 기반`입니다. 각 요청마다 다른 인증 정보를 가집니다

```
요청 1Thread -> SecurityContextHolder1 -> 사용자 A 정보
요청 2Thread -> SecurityContextHolder2 -> 사용자 B 정보
```

---

# 이를 왜 알아야 하는가?

만약 Security를 사용하고, `인증/인가 방식을 커스텀`(ex : JWT Filter)해야 할 상황에 알아야합니다.  
필터를 통과한다고 해도, 결국 SecurityContextHolder에 SecurityContext를 넣지 않으면 해당 사용자는 인증된 상태가 아니게 됩니다.  
이런 일을 방지하기 위해서라도 이를 알아야 합니다.

---

# 참고자료

- [SpringSecurity - Authentication](https://docs.spring.io/spring-security/reference/servlet/authentication/architecture.html)
