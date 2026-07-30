# 개요

HTML 로그인 폼으로 제출된 사용자 이름과 비밀번호를 읽어 인증을 시작하는 필터입니다. 기본 설정에서는 `POST /login` 요청을 처리하고, 요청 파라미터 이름은 `username`과 `password`입니다.

---

# 인증 요청 만들기

필터는 요청에서 사용자 이름과 비밀번호를 꺼내 인증되지 않은 `UsernamePasswordAuthenticationToken`을 만듭니다. 이 단계에서는 입력값을 포장할 뿐, 비밀번호가 맞는지 직접 검사하지 않습니다.

```text
POST /login
  → username, password 추출
  → 인증 전 UsernamePasswordAuthenticationToken 생성
  → AuthenticationManager.authenticate(...) 호출
```

URL, HTTP 메서드, 파라미터 이름은 보안 설정으로 바꿀 수 있습니다.

---

# 성공과 실패

인증에 성공하면 반환된 `Authentication`을 새 `SecurityContext`에 넣고 `SecurityContextHolder`에 설정합니다. 이후 성공 핸들러, remember-me, 세션 인증 전략 같은 후속 처리가 이어집니다. 다음 요청에서도 인증을 복원해야 한다면 구성된 `SecurityContextRepository`에 컨텍스트를 저장합니다.

인증에 실패하면 `SecurityContextHolder`를 비우고 실패 핸들러를 호출합니다. 실패 원인은 잘못된 비밀번호, 존재하지 않는 사용자, 잠긴 계정처럼 하위 인증 구성요소가 던진 `AuthenticationException`으로 전달됩니다.

---

# 책임의 경계

- 요청에서 자격 증명을 읽고 인증 흐름을 시작합니다.
- 실제 사용자 조회와 비밀번호 비교는 보통 `DaoAuthenticationProvider`가 담당합니다.
- 어떤 `AuthenticationProvider`를 사용할지는 `AuthenticationManager`의 대표 구현인 `ProviderManager`가 결정합니다.

---

# 참고 자료

- [Spring Security - UsernamePasswordAuthenticationFilter API](https://docs.spring.io/spring-security/reference/api/java/org/springframework/security/web/authentication/UsernamePasswordAuthenticationFilter.html)
- [Spring Security - Servlet Authentication Architecture](https://docs.spring.io/spring-security/reference/servlet/authentication/architecture.html)
