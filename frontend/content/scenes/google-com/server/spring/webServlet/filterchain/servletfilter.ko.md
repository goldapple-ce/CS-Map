# 개요

Servlet 컨테이너가 관리하는 일반 `jakarta.servlet.Filter`를 나타냅니다. 이 Topic은 `DelegatingFilterProxy`보다 먼저 실행되는 Filter의 구체적 사용 위치입니다.

---

# 할 수 있는 일

- 요청 헤더와 본문을 검사합니다.
- 요청이나 응답 객체를 Wrapper로 감쌉니다.
- 로깅, 인코딩, CORS 같은 공통 처리를 수행합니다.
- 조건에 따라 다음 체인을 호출하거나 요청을 중단합니다.
- 다음 체인의 처리가 끝난 뒤 응답을 후처리합니다.

```java
public void doFilter(request, response, chain) {
    // 요청 전처리
    chain.doFilter(request, response);
    // 응답 후처리
}
```

Filter의 실제 실행 순서는 Servlet 컨테이너 등록 순서에 따라 결정됩니다. Spring Security 필터들도 `Filter` 인터페이스를 구현하지만, 각각을 Servlet 컨테이너에 직접 등록하지 않고 보통 `FilterChainProxy` 내부에서 관리합니다.

---

# 참고 자료

- [Jakarta Servlet - Filter API](https://jakarta.ee/specifications/platform/9/apidocs/jakarta/servlet/filter)
