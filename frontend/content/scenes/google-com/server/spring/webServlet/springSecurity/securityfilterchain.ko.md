# 개요

`SecurityFilterChain`은 특정 요청에 적용할 Spring Security Filter 목록을 나타내는 interface입니다.

```java
boolean matches(HttpServletRequest request)
List<Filter> getFilters()
```

각 SecurityFilterChain은 요청 조건을 확인하는 `RequestMatcher`와 순서가 정해진 Filter 목록을 가집니다. 애플리케이션에는 API, 정적 resource, 일반 웹 요청처럼 서로 다른 조건과 보안 정책을 가진 여러 Chain을 구성할 수 있습니다.

`FilterChainProxy`는 등록된 SecurityFilterChain들을 순서대로 확인하고 현재 요청과 처음 일치하는 Chain 하나를 선택합니다. 여러 Chain의 Filter를 모두 합쳐서 실행하지 않으므로 더 구체적인 요청 조건을 가진 Chain이 앞에 오도록 순서를 구성하는 것이 중요합니다.

SecurityFilterChain은 Filter를 직접 실행하는 주체라기보다 요청 조건과 Filter 목록을 제공하는 구성 객체입니다. 선택된 Filter들을 실제로 순서대로 호출하는 과정은 `FilterChainProxy` 내부의 가상 FilterChain이 담당합니다.

# 참고 자료

- [Spring Security — SecurityFilterChain API](https://docs.spring.io/spring-security/reference/api/java/org/springframework/security/web/SecurityFilterChain.html)
- [Spring Security — Multiple SecurityFilterChain Instances](https://docs.spring.io/spring-security/reference/servlet/configuration/java.html#_multiple_httpsecurity_instances)
