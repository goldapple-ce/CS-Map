# 한눈에 보기

SecurityContextRepository는 `SecurityContext를 저장하고 조회`하는 인터페이스입니다.
SecurityContextHolder가 현재 요청에서 사용할 인증 정보를 관리한다면, SecurityContextRepository는 인증 정보를 저장하고 `이후 HTTP 요청에서 다시 사용`할 수 있도록 하는 역할을 수행합니다.
HttpSession, Request Attribute, Null 등의 구현체를 통해 인증 정보의 유지 범위를 결정할 수 있습니다.

---

# SecurityContextRepository란?

SecurityContextRepository는 Spring Security에서 `SecurityContext를 저장하고 조회`하는 인터페이스입니다.
SecurityContextHolder가 현재 요청에서 사용할 인증 정보를 관리한다면, SecurityContextRepository는 인증 정보를 저장하고 `이후 HTTP 요청에서 다시 사용`할 수 있도록 하는 역할을 수행합니다.

---

# SecurityContextRepository의 구조

SecurityContextRepository는 다음과 같이 정의되어 있습니다.

```java
public interface SecurityContextRepository {

    DeferredSecurityContext loadDeferredContext(HttpServletRequest request);
    void saveContext(SecurityContext context, HttpServletRequest request, HttpServletResponse response);
    boolean containsContext(HttpServletRequest request);
}
```

위 코드는 주요 메서드만 남긴 축약 코드입니다. 기존의 `loadContext()`는 Deprecated되어 생략했습니다.

1. `loadDeferredContext()`: 저장된 SecurityContext를 필요할 때 조회할 수 있도록 반환합니다.
2. `saveContext()`: SecurityContext를 저장합니다.
3. `containsContext()`: 현재 요청에 해당하는 SecurityContext가 저장되어 있는지 확인합니다.

---

# SecurityContextRepository의 구현체

Spring Security는 SecurityContext의 저장 방식에 따라 여러 구현체를 제공합니다.

- `HttpSessionSecurityContextRepository`: SecurityContext를 HttpSession에 저장하여 서로 다른 HTTP 요청에서도 인증 정보를 유지합니다.
- `RequestAttributeSecurityContextRepository`: SecurityContext를 HttpServletRequest의 Attribute에 저장하며, 동일한 요청 내에서 ERROR Dispatch 등이 발생해도 인증 정보를 사용할 수 있도록 합니다.
- `NullSecurityContextRepository`: SecurityContext를 저장하거나 복원하지 않습니다. JWT 기반 Stateless 인증에 사용할 수 있습니다.
- `DelegatingSecurityContextRepository`: 여러 SecurityContextRepository를 조합하여 저장과 조회를 위임합니다. Spring Security 6 이후 일반적인 기본 구성에서는 RequestAttributeSecurityContextRepository와 HttpSessionSecurityContextRepository를 함께 사용합니다.
