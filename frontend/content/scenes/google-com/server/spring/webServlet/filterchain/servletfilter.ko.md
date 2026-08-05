# 한눈에 보기

Servlet Filter는 요청이 Servlet에 도착하기 전이나 응답이 클라이언트로 돌아가기 전에 공통 처리를 적용하는 구성 요소입니다.

이 Topic은 뷰포트에서 `DelegatingFilterProxy`보다 먼저 실행되는 일반 Filter를 나타냅니다. 특정 제품이나 class 하나를 뜻하는 것이 아니라, Servlet Container에 등록된 `jakarta.servlet.Filter`의 한 위치를 보여줍니다.

---

# 할 수 있는 일

Filter는 다음과 같은 작업에 사용할 수 있습니다.

- 요청과 응답을 기록하는 logging
- 문자 encoding 설정
- header 검사와 추가
- 요청이나 응답 객체를 wrapper로 감싸기
- CORS 같은 공통 웹 처리
- 잘못된 요청을 중단하고 직접 응답하기

---

# 개발자가 개입하는 지점

개발자는 요청 logging이나 header 검사처럼 여러 Controller에 공통으로 필요한 작업을 custom Filter로 구현할 수 있습니다.  
`Filter`를 직접 구현하거나 Spring의 `OncePerRequestFilter`를 상속합니다.

---

# 헷갈리기 쉬운 점

## Filter와 Controller는 역할이 다릅니다

Filter는 특정 Controller가 선택되기 전에 공통 처리를 수행합니다. Controller는 요청 경로에 맞는 애플리케이션 기능을 실행합니다.

## Spring Security Filter도 Servlet Filter입니다

Spring Security의 Filter들도 Servlet Filter interface를 구현합니다. 다만 각각을 Servlet Container에 직접 등록하지 않고, 일반적으로 하나의 `FilterChainProxy` 안에서 관리합니다.

---

# 참고 자료

- [Jakarta Servlet — Filter API](https://jakarta.ee/specifications/platform/9/apidocs/jakarta/servlet/filter)
