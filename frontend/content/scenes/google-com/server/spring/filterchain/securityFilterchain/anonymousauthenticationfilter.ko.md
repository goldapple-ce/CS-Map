# 개요

로그인하지 않은 사용자에게도 Authentication 객체를 넣어주는 필터입니다. 이름 그대로 `익명 사용자 인증`을 담당합니다.

---

# 왜 존재하는가?

"Authentication 객체가 null이면 비인증 사용자라고 판단하면 되는 것 아닌가?"라는 생각이 들 수 있습니다.  
기술적으로는 가능합니다. 하지만 Spring Security는 인증 사용자와 익명 사용자를 모두 Authentication이라는 동일한 모델로 표현하기 위해 AnonymousAuthenticationFilter를 사용합니다.  
이를 통해 SecurityContext를 사용하는 과정에서 null 여부가 아니라 Authentication 객체를 기준으로 보안 처리를 할 수 있습니다.

---

# AnonymousAuthenticationToken

AnonymousAuthenticationFilter는 Authentication 객체를 생성합니다. 이때 생성하는 Authentication 구현체가 `AnonymousAuthenticationToken`입니다.

## 저는 익명 사용자입니다!

AnonymousAuthenticationToken은 로그인한 사용자는 아니지만, Spring Security 내부에서는 하나의 Authentication 상태로 관리되는 `익명 사용자`라는 점입니다.  
따라서 `authenticated = true`값을 가집니다. 여기서 true는 실제 로그인 인증이 완료되었다는 의미가 아닙니다.  
해당 Authentication 객체가 Spring Security 내부에서 정상적인 Authentication 상태라는 의미입니다.

---

# ExceptionTranslationFilter와 관계

AuthorizationFilter에서 인가에 실패하면 예외가 발생합니다. 하지만 이것이 인증 실패인지 권한 부족인지 구분하지 않고, 단순히 인가 실패 예외를 발생시킵니다.  
이후 ExceptionTranslationFilter가 현재 Authentication 상태를 확인합니다.

- AnonymousAuthenticationToken 일 경우 : 인증 실패 처리
- AnonymousAuthenticationToken 아닐 경우 : 인가 실패 처리

---

# 참고 자료

[SpringDocs - AnonymousAuthenticationToken](https://docs.spring.io/spring-security/reference/api/java/org/springframework/security/authentication/AnonymousAuthenticationToken.html)
[Velog - dailylifecoding](https://velog.io/@dailylifecoding/spring-security-anonymous-authentication-filter)
