# 한눈에 보기

`AuthorizationFilter`는 SecurityContextHolder의 Authentication과 접근 규칙을 이용해 현재 요청을 허용할지 판단합니다.

Custom JWT Filter는 인증 정보를 만드는 역할이고 AuthorizationFilter는 그 인증 정보로 권한을 검사합니다. JWT Signature가 유효하다는 사실만으로 모든 API 접근이 허용되는 것은 아닙니다.

---

# 참고 자료

- [Spring Security — AuthorizationFilter](https://docs.spring.io/spring-security/reference/servlet/authorization/authorize-http-requests.html#_authorizationfilter)
