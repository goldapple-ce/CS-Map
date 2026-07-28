# 개요

뒤에서 발생한 보안 예외를 받아서 HTTP 응답으로 바꿔주는 필터입니다.

---

# 보안 Exception 처리

처리하는 예외는 AuthenticationException, AccessDeniedException 딱 두 가지입니다.

## AuthenticationException

`인증을 실패했다`는 예외입니다. 이 경우에는 `authenticationEntryPoint`를 호출합니다.  
그리고 authenticationEntryPoint는 401(Unauthorized)로 사용자에게 보냅니다.

## AccessDeniedException

`인증은 됐는데 권한이 없다`는 예외입니다. 이 경우에는 `accessDeniedHandler`를 호출합니다.  
그리고 accessDeniedHandler는 403(Forbidden)로 사용자에게 보냅니다.

---

# AuthorizationFilter에서 인가를 거부한 경우 어떻게 되는가?

AuthorizationFilter를 읽었다면, "당연히 AccessDeniedException이 뜰텐데 왜 이런 질문을 할까"라는 생각이 들겁니다.(아닐수도?)  
그럼에도 이 질문을 한 이유가 있습니다. AuthenticatedAuthorizationManager의 경우 인증만 됐다면 허용됩니다.  
반대로 말하면 AuthenticatedAuthorizationManager가 거부했다는 것은 인증 실패입니다.  
그럼 당연히 AuthenticationException이 떠야겠지만, 아쉽게도 AuthorizationManager는 AccessDeniedException만 던집니다.  
이를 해결하기 위해 ExceptionTranslationFilter는 accessDeniedHandler를 호출하기 전에 `isAnonymous(익명 사용자)인지 확인을 하고, AuthenticationException으로 변경`한 뒤, authenticationEntryPoint를 호출하게 됩니다.

---

# 참고자료

- [SpringSecurity - ExceptionTranslation](https://docs.spring.io/spring-security/reference/api/java/org/springframework/security/web/access/ExceptionTranslationFilter.html)
