# 한눈에 보기

SecurityContextHolder는 `현재 실행 흐름의 SecurityContext를 관리`하며, 기본적으로 `ThreadLocal`을 사용합니다.

---

# SecurityContextHolder란

SecurityContextHolder는 Spring Security에서 `현재 실행 중인` Thread의 `인증 정보를 관리`하는 클래스입니다.
인증에 성공하면 Authentication을 SecurityContext에 저장하고, SecurityContextHolder를 통해 애플리케이션 `어디서든 현재 사용자의 인증 정보에 접근`할 수 있습니다.

---

# SecurityContextHolder의 구조

SecurityContextHolder는 SecurityContextHolderStrategy를 이용하여 SecurityContext를 관리합니다.
기본적으로 `ThreadLocalSecurityContextHolderStrategy`를 사용하며, SecurityContext를 ThreadLocal에 저장합니다.

핵심 구현은 다음과 같습니다.

```java
public class SecurityContextHolder {

    private static SecurityContextHolderStrategy strategy;

    public static SecurityContext getContext() {
        return strategy.getContext();
    }

    public static void setContext(SecurityContext context) {
        strategy.setContext(context);
    }

    public static void clearContext() {
        strategy.clearContext();
    }

    public static SecurityContext createEmptyContext() {
        return strategy.createEmptyContext();
    }
}
```

- `getContext()`: 현재 Thread의 SecurityContext를 조회합니다.
- `setContext()`: 현재 Thread에 SecurityContext를 설정합니다.
- `clearContext()`: 현재 Thread의 SecurityContext를 제거합니다.
- `createEmptyContext()`: 새로운 SecurityContext를 생성합니다.

---

# ThreadLocal을 사용하는 이유

Spring Security는 여러 사용자의 HTTP 요청을 동시에 처리하므로, 요청마다 `인증 정보를 격리`해야 합니다.
SecurityContextHolder는 기본적으로 ThreadLocal을 이용하여 각 Thread가 서로 다른 SecurityContext를 사용하도록 합니다.

따라서 여러 요청이 동시에 실행되더라도 Thread 간에 인증 정보가 직접 공유되지 않습니다.

다만 WAS는 Thread Pool을 사용하여 요청을 처리하므로, 이전 요청의 인증 정보가 재사용된 Thread에 남아 있지 않도록 정리해야 합니다.
이를 위해 SecurityContextHolderFilter는 요청 처리가 끝나면 clearContext()를 호출합니다.
