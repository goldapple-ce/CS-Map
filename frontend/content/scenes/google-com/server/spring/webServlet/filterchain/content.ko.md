## 개요

Spring Security의 Servlet 지원은 Servlet Filter를 기반으로 합니다. `FilterChainProxy`가 현재 요청에 적용할 `SecurityFilterChain`을 선택하고, 그 안의 Security Filter들이 정해진 순서로 요청을 검사합니다.

이 흐름에는 이름이 비슷하지만 서로 다른 세 계층이 있습니다.

```text
Servlet FilterChain
└─ DelegatingFilterProxy
   └─ FilterChainProxy
      └─ SecurityFilterChain
         └─ Security Filter들
```

- `Servlet FilterChain`: Servlet 컨테이너가 관리하는 전체 Filter 실행 체인
- `FilterChainProxy`: Spring Security의 단일 Servlet Filter 진입점
- `SecurityFilterChain`: 특정 요청에 적용할 Spring Security Filter 목록

## 필요한 이유

보안 검사를 Controller마다 반복하지 않고 요청이 Spring MVC에 도달하기 전 공통 FilterChain에서 적용할 수 있습니다. 인증은 요청 주체가 누구인지 확인하는 과정이고, 인가는 그 주체가 해당 요청을 수행할 수 있는지 판단하는 과정입니다.

## 동작 과정

1. Tomcat의 Servlet FilterChain이 `DelegatingFilterProxy`를 호출합니다.
2. `DelegatingFilterProxy`가 Spring Container에 등록된 `FilterChainProxy` Bean으로 처리를 위임합니다.
3. `FilterChainProxy`가 요청 조건과 일치하는 첫 번째 `SecurityFilterChain`을 선택합니다.
4. 선택된 filter들이 인증 정보와 보안 상태를 처리합니다.
5. 인가 규칙이 요청을 허용하는지 판단합니다.
6. 허용된 요청은 원래 Servlet FilterChain을 계속 진행하고, 남은 Filter를 거쳐 대상 Servlet인 `DispatcherServlet`에 도달할 수 있습니다.

각 Filter는 반드시 다음 체인을 호출해야 하는 것은 아닙니다. 보안 필터가 인증 또는 인가 실패 응답을 완성하고 다음 체인을 호출하지 않으면 뒤쪽 일반 Filter와 `DispatcherServlet`에는 요청이 도달하지 않습니다.

## 요청과 응답 방향

요청은 Filter 등록 순서대로 안쪽으로 진행하지만 응답은 호출 스택을 따라 반대 방향으로 돌아옵니다.

```text
요청
Servlet Filter
→ DelegatingFilterProxy
→ FilterChainProxy
→ Security Filter들
→ 남은 Servlet Filter
→ DispatcherServlet

응답
Servlet Filter
← DelegatingFilterProxy
← FilterChainProxy
← Security Filter들
← 남은 Servlet Filter
← DispatcherServlet
```

따라서 Filter는 `chain.doFilter()` 호출 전에 요청을 전처리하고, 호출이 반환된 뒤 응답을 후처리할 수 있습니다.

## 내부 구조

모든 요청이 화면과 똑같은 인증 방식을 거치는 것은 아닙니다. 이미 인증된 요청, 공개 경로와 사용하는 인증 방식에 따라 실행되는 Filter가 달라질 수 있습니다. 화면은 인증이 필요한 일반적인 요청의 핵심 순서를 단순화합니다.

## 실패 상황

- 요청에 맞는 SecurityFilterChain이 예상과 다를 수 있습니다.
- 인증 정보가 없거나 유효하지 않을 수 있습니다.
- 인증됐어도 필요한 권한이 없어 요청이 거부될 수 있습니다.
- Filter 순서나 RequestMatcher 설정이 의도와 다를 수 있습니다.

## 범위

개별 Security Filter의 상세 인증·인가 로직은 자식 `SecurityFilterChain` Scene에서 다룹니다. `DispatcherServlet` 이후의 Spring MVC 처리는 연결된 Spring MVC Scene에서 이어집니다.

## 출처

- Spring Security, _Servlet Architecture_

## 참고 자료

- [Spring Security — Servlet Architecture](https://docs.spring.io/spring-security/reference/servlet/architecture.html)
