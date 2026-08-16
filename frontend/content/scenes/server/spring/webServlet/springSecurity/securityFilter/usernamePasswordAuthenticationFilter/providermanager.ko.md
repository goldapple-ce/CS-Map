# 한눈에 보기

`AuthenticationManager`의 가장 일반적인 구현체입니다. 등록된 `AuthenticationProvider` 목록을 사용해 전달받은 인증 요청을 처리할 Provider를 찾고, 인증 결과를 호출자에게 돌려줍니다.

---

# Provider 선택 흐름

1. 등록 순서대로 각 `AuthenticationProvider`가 요청 토큰 타입을 지원하는지 확인합니다.
2. 지원하는 Provider에 `authenticate`를 호출합니다.
3. 인증 결과가 반환되면 성공으로 마칩니다.
4. Provider가 판단을 보류하면 다음 Provider를 시도합니다.
5. 어느 Provider도 처리하지 못하면 선택적 부모 `AuthenticationManager`에 위임하거나 `ProviderNotFoundException`으로 실패합니다.

이 Scene의 사용자 이름·비밀번호 인증에서는 `UsernamePasswordAuthenticationToken`을 지원하는 `DaoAuthenticationProvider`가 대표적인 처리자입니다.

---

# 인증 결과 정리

`ProviderManager`는 기본적으로 인증 성공 뒤 반환된 `Authentication`에서 비밀번호 같은 민감한 자격 증명을 제거하려고 합니다. 민감 정보가 세션이나 메모리에 필요 이상으로 오래 남는 것을 줄이기 위한 동작입니다.

---

# AuthenticationManager와 차이

- `AuthenticationManager`: 필터가 의존하는 인증 진입점 인터페이스입니다.
- `ProviderManager`: 여러 `AuthenticationProvider`로 위임하는 대표 구현체입니다.

이 분리 덕분에 상위 필터는 실제로 어떤 Provider가 인증하는지 알 필요가 없습니다.

---

# 개발자가 개입하는 지점

일반적인 Form Login에서는 Spring Security가 ProviderManager를 구성하므로 개발자가 직접 생성하거나 호출할 지점은 많지 않습니다.

여러 인증 방식을 함께 사용하거나 custom AuthenticationProvider를 추가하면 ProviderManager가 확인할 Provider 목록에 영향을 줄 수 있습니다.

다만 이 구조를 알면 올바른 Provider가 선택되지 않거나 `ProviderNotFoundException`이 발생하는 문제를 추적하는 데 도움이 됩니다.

---

# 참고 자료

- [Spring Security - Servlet Authentication Architecture](https://docs.spring.io/spring-security/reference/servlet/authentication/architecture.html#servlet-authentication-providermanager)
