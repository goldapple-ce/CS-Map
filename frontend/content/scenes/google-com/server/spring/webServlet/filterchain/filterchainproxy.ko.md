# 개요

Spring Security의 Servlet 지원을 시작하는 핵심 `Filter`입니다. 하나 이상의 `SecurityFilterChain`을 보유하고 현재 요청에 적용할 체인을 선택해 그 안의 Security Filter들을 실행합니다.

---

# 요청에 맞는 SecurityFilterChain 선택

각 `SecurityFilterChain`은 `RequestMatcher`와 Security Filter 목록을 가집니다. `FilterChainProxy`는 등록 순서대로 요청 조건을 확인하고 일반적으로 처음 일치하는 체인을 사용합니다.

```text
FilterChainProxy
├─ SecurityFilterChain 1: /api/**
├─ SecurityFilterChain 2: /admin/**
└─ SecurityFilterChain 3: /**
```

구체적인 조건을 가진 체인을 더 넓은 조건보다 앞에 배치해야 합니다. 어떤 체인이 선택되느냐에 따라 실행되는 인증 방식과 보안 정책이 달라질 수 있습니다.

---

# 두 체인을 연결하는 방법

선택한 Security Filter들을 실행할 때도 원래 Servlet `FilterChain`은 보존됩니다. 내부 보안 필터가 모두 다음 체인을 호출하면 `FilterChainProxy`는 원래 Servlet FilterChain으로 돌아가 남은 일반 Filter와 대상 Servlet을 계속 실행합니다.

또한 Spring Security 진입점으로서 요청이 끝날 때 `SecurityContext`를 정리하는 등 모든 보안 필터에 공통으로 필요한 처리를 제공합니다.

---

# DelegatingFilterProxy와 구분

- `DelegatingFilterProxy`: Servlet 컨테이너의 호출을 Spring Bean에 전달합니다.
- `FilterChainProxy`: 요청에 맞는 `SecurityFilterChain`을 선택하고 Security Filter들을 실행합니다.

---

# 참고 자료

- [Spring Security - FilterChainProxy](https://docs.spring.io/spring-security/reference/servlet/architecture.html#servlet-filterchainproxy)
- [Spring Security - FilterChainProxy API](https://docs.spring.io/spring-security/reference/api/java/org/springframework/security/web/FilterChainProxy.html)
