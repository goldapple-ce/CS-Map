# 개요

요청이 시작될 때 `저장되어 있던 SecurityContext`를 불러와 SecurityContextHolder에 설정하는 필터입니다.  
저장된 SecurityContext를 사용하는 세션 기반의 `Stateful 서버`에서 특히 중요합니다.  
주로 HttpSession을 사용하는 경우 이전 요청의 로그인 정보를 현재 요청에 복원합니다.

---

# 구조

```
요청
-> SecurityContextRepository -> HttpSessionSecurityContextRepository
-> SecurityContextHolderStrategy
```

- `SecurityContextRepository`: 요청 간에 SecurityContext를 저장하고 불러오는 저장소
  - `HttpSessionSecurityContextRepository`: HttpSession에 SecurityContext를 저장하는 구현체
- `SecurityContextHolderStrategy`: SecurityContextHolder가 SecurityContext를 저장하고 조회하는 방식을 담당

---

# 흐름

1. 요청이 들어옵니다.
2. SecurityContextRepository에서 저장된 SecurityContext를 조회합니다.
3. 조회한 SecurityContext를 SecurityContextHolderStrategy를 통해 SecurityContextHolder에 설정합니다.
4. 이후 Security Filter들이 해당 SecurityContext를 사용합니다.
5. 요청 처리가 끝나면 SecurityContextHolder를 비웁니다.

중요한 점은 SecurityContextHolderFilter는 `SecurityContext를 불러오기만 한다`는 점입니다.  
Spring Security 6에서는 변경된 SecurityContext를 `다음 요청에서도 유지하려면 SecurityContextRepository.saveContext()를 명시적으로 호출`해야 합니다.  
따라서 커스텀 인증 필터를 만들고 세션 기반으로 인증 상태를 유지한다면, 인증 성공 후 SecurityContextRepository에도 저장해야 합니다.  
저장하지 않으면 다음 요청에서 SecurityContextHolderFilter가 해당 인증 정보를 불러올 수 없습니다.

---

# 참고 자료

[Spring Security - Authentication Architecture](https://docs.spring.io/spring-security/reference/servlet/authentication/architecture.html)

[Spring Security - Persisting Authentication](https://docs.spring.io/spring-security/reference/servlet/authentication/persistence.html)
