# 개요

Servlet 컨테이너가 현재 요청에 적용할 `Filter`들을 순서대로 호출하기 위해 제공하는 실행 체인입니다. Spring Security 전용 구성요소가 아니라 Jakarta Servlet 표준의 일부입니다.

---

# 실행 방식

각 Filter는 다음 메서드에서 요청과 응답, 그리고 남은 체인을 전달받습니다.

```java
void doFilter(
    ServletRequest request,
    ServletResponse response,
    FilterChain chain
)
```

Filter가 `chain.doFilter(request, response)`를 호출하면 다음 Filter가 실행됩니다. 현재 Filter가 마지막이라면 대상 Servlet이나 정적 리소스가 호출됩니다. 반대로 다음 체인을 호출하지 않으면 요청 진행을 중단하고 직접 응답할 수 있습니다.

```text
요청 방향
Filter 1 → Filter 2 → Servlet

응답 방향
Filter 1 ← Filter 2 ← Servlet
```

다음 체인 호출 전에는 요청을 검사하거나 감쌀 수 있고, 호출이 돌아온 뒤에는 응답 헤더나 내용을 후처리할 수 있습니다.

---

# 이 Scene에서의 역할

Tomcat 같은 Servlet 컨테이너가 만든 원래 체인 안에 일반 Servlet Filter와 `DelegatingFilterProxy`가 함께 등록됩니다. Spring Security 내부 필터 체인은 이 원래 체인을 대체하지 않고, `DelegatingFilterProxy`를 통해 중간에 중첩되어 실행됩니다.

---

# 참고 자료

- [Jakarta Servlet - FilterChain API](https://jakarta.ee/specifications/servlet/6.2/apidocs/jakarta.servlet/jakarta/servlet/filterchain)
