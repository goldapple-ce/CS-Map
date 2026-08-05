# 한눈에 보기

`SecurityContextHolderFilter`는 요청이 시작될 때 저장되어 있던 SecurityContext를 불러와 현재 요청에서 사용할 수 있게 준비하는 Filter입니다.

세션 기반 로그인에서는 이전 요청에서 저장한 로그인 정보를 다음 요청에서 복원할 때 중요한 역할을 합니다.

---

# 동작 방식

1. `SecurityContextRepository`에서 현재 요청과 연결된 SecurityContext를 찾습니다.
2. 찾은 Context를 `SecurityContextHolder`에서 사용할 수 있게 설정합니다.
3. 뒤쪽 Security Filter들이 Context 안의 Authentication을 사용합니다.
4. 요청 처리가 끝나면 현재 실행 흐름의 Context를 정리합니다.

SecurityContextHolderFilter는 Context를 불러오지만 변경된 Context를 자동으로 저장하지는 않습니다. 인증 결과를 다음 요청에서도 유지해야 한다면 인증 성공 처리에서 SecurityContextRepository에 저장해야 합니다.

---

# 개발자가 개입하는 지점

보통 개발자가 SecurityContextHolderFilter를 직접 생성하거나 호출할 지점은 없습니다.  
다만, 이 구조를 알면 현재 요청에서는 인증됐지만 다음 요청에서 다시 익명 사용자로 보이는 문제를 추적하는 데 도움이 됩니다.

---

# 헷갈리기 쉬운 점

## 불러오기와 저장은 다릅니다

SecurityContextHolderFilter의 중심 역할은 저장된 Context를 불러와 현재 요청에 연결하는 것입니다. 다음 요청을 위한 저장은 별도 성공 처리와 Repository가 담당합니다.

---

# 참고 자료

- [Spring Security — SecurityContextHolderFilter API](https://docs.spring.io/spring-security/reference/api/java/org/springframework/security/web/context/SecurityContextHolderFilter.html)
- [Spring Security — Authentication Persistence](https://docs.spring.io/spring-security/reference/servlet/authentication/persistence.html)
