# 한눈에 보기

`FilterChainProxy`는 현재 요청에 맞는 SecurityFilterChain을 선택하고, 선택된 Chain의 Security Filter들을 실행합니다.

이 Scene에서는 Security Filter 실행을 시작하는 출발점으로 표시됩니다.

---

# 동작 방식

1. 등록된 SecurityFilterChain을 순서대로 확인합니다.
2. 현재 요청과 처음 일치하는 Chain 하나를 선택합니다.
3. 선택된 Chain의 Security Filter들을 정해진 순서대로 호출합니다.
4. 모든 Security Filter가 다음 체인을 호출하면 원래 Servlet FilterChain으로 돌아갑니다.

---

# 개발자가 개입하는 지점

일반적인 Spring Boot 애플리케이션에서 개발자가 FilterChainProxy를 직접 생성하거나 호출할 지점은 없습니다.

개발자는 `SecurityFilterChain` Bean의 요청 조건, Filter와 순서를 설정해 FilterChainProxy가 선택하고 실행할 대상을 구성합니다.

다만 이 구조를 알면 특정 URL에 예상과 다른 SecurityFilterChain이 적용되거나, Security Filter가 실행되지 않는 문제를 추적하는 데 도움이 됩니다.

---

# 헷갈리기 쉬운 점

FilterChainProxy는 화면에 표시된 Security Filter 중 하나가 아니라, 이 Filter들을 선택하고 실행하는 바깥쪽 Filter입니다.

---

# 참고 자료

- [Spring Security — FilterChainProxy](https://docs.spring.io/spring-security/reference/servlet/architecture.html#servlet-filterchainproxy)
