# 한눈에 보기

Servlet FilterChain은 요청이 Controller에 도착하기 전에 거치는 여러 처리 단계를 순서대로 연결한 구조입니다.  
각 Filter는 요청을 검사하거나 수정한 뒤 다음 Filter로 넘길 수 있습니다. 문제가 있으면 요청을 더 진행하지 않고 그 자리에서 응답을 끝낼 수도 있습니다.  
모든 Filter를 통과한 요청은 Spring MVC의 `DispatcherServlet`에 도착합니다.

---

# 구성 요소

- `Servlet FilterChain`: 현재 요청에 적용할 Filter들을 정해진 순서대로 호출합니다.
- `Servlet Filter`: 요청과 응답에 공통 처리를 적용합니다. 로깅, 문자 인코딩과 요청 검사 등에 사용할 수 있습니다.
- `DelegatingFilterProxy`: Servlet 요청을 Spring Container가 관리하는 Filter Bean에 전달합니다.
- `Spring Security`: DelegatingFilterProxy를 통해 FilterChain 중간에 인증과 인가 처리를 추가합니다.
- `DispatcherServlet`: Filter를 모두 통과한 요청을 받아 알맞은 Spring MVC Controller로 연결합니다.

화면에 두 개의 `Servlet Filter`가 있지만 서로 다른 종류는 아닙니다. Spring Security 처리 앞뒤에 일반 Filter가 존재할 수 있다는 것을 보여주기 위해 두 번 표시했습니다.

---

# 전체 흐름

1. Tomcat 같은 Servlet Container가 현재 요청에 적용할 FilterChain을 실행합니다.
2. 첫 번째 Servlet Filter가 요청을 처리합니다.
3. Filter가 `chain.doFilter()`를 호출하면 다음 Filter로 요청이 넘어갑니다.
4. `DelegatingFilterProxy`가 호출되면 Spring Security의 Filter Bean에 보안 처리를 위임합니다.
5. Spring Security 처리가 요청을 허용하면 원래 Servlet FilterChain으로 돌아와 다음 Servlet Filter를 실행합니다.
6. 남은 Filter도 다음 체인을 호출하면 마지막에 `DispatcherServlet`이 실행됩니다.

Spring Security가 FilterChain 전체를 교체하는 것은 아닙니다. 원래 Servlet FilterChain의 DelegatingFilterProxy 위치에서 Spring Security 내부 Filter들이 잠시 중첩되어 실행된 뒤, 처리가 끝나면 원래 체인으로 돌아옵니다.

---

# 개발자가 개입하는 지점

개발자가 Servlet FilterChain 객체를 직접 만드는 경우는 드뭅니다. 보통 Filter를 구현하고 적용 범위와 순서를 설정하면 Servlet Container가 실행 체인을 구성합니다.

- 일반 공통 처리: `Filter` 또는 Spring의 `OncePerRequestFilter` 구현
- Spring Security 내부에 Filter 추가: `SecurityFilterChain` 설정에서 기존 Filter의 앞이나 뒤에 배치
- 보안 규칙 변경: Spring Security Scene의 `SecurityFilterChain` Bean 구성

---

# 꼭 알아둘 점

## Filter는 요청을 중단할 수 있습니다

Filter가 반드시 다음 Filter를 호출해야 하는 것은 아닙니다. 인증이나 권한 검사에 실패했거나 잘못된 요청이라고 판단하면 직접 응답을 만들고 `chain.doFilter()`를 호출하지 않을 수 있습니다. 이 경우 뒤쪽 Filter와 DispatcherServlet은 실행되지 않습니다.

## Spring Security 지원선은 호출 순서가 아닙니다

화면의 `Spring Security → DelegatingFilterProxy` 점선은 Spring Security가 DelegatingFilterProxy를 통해 Servlet FilterChain에 연결된다는 관계를 나타냅니다. 요청이 Spring Security Topic에서 DelegatingFilterProxy로 이동한다는 뜻은 아닙니다.

---

# 참고 자료

- [Jakarta Servlet — FilterChain API](https://jakarta.ee/specifications/servlet/6.1/apidocs/jakarta.servlet/jakarta/servlet/filterchain)
- [Spring Security — Servlet Architecture](https://docs.spring.io/spring-security/reference/servlet/architecture.html)
- [Spring Framework — DelegatingFilterProxy API](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/web/filter/DelegatingFilterProxy.html)
