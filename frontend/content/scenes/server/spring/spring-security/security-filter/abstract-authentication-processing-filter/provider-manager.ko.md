# 한눈에 보기

ProviderManager는 등록된 `AuthenticationProvider를 순회`하며 supports()와 authenticate()를 통해 `인증을 위임`합니다.

---

# ProviderManager

ProviderManager는 Spring Security에서 AuthenticationManager 인터페이스를 구현한 클래스로, 등록된 AuthenticationProvider 중 인증 요청을 처리할 수 있는 `Provider를 찾아 인증을 위임`합니다.

---

# ProviderManager의 동작

ProviderManager는 등록된 AuthenticationProvider를 순회하면서 `supports()`와 `authenticate()`를 호출합니다.

핵심 구현은 다음과 같습니다.

```java
public class ProviderManager implements AuthenticationManager {

    private List<AuthenticationProvider> providers;

    @Override
    public Authentication authenticate(Authentication authentication) {
        Class<? extends Authentication> toTest = authentication.getClass();
        Authentication result = null;

        for (AuthenticationProvider provider : getProviders()) {
            if (!provider.supports(toTest)) {
                continue;
            }

            result = provider.authenticate(authentication);

            if (result != null) {
                break;
            }
        }

        return result;
    }
}
```

위 코드는 Provider 선택 과정만 남긴 축약 코드입니다. 실제 구현의 예외 처리, Parent AuthenticationManager 호출, 인증 결과 후처리 등은 생략했습니다.

1. `supports()`: AuthenticationProvider가 전달받은 Authentication 타입을 지원하는지 확인합니다. 지원하지 않는다면 다음 Provider로 이동합니다.
2. `authenticate()`: 해당 Provider에 실제 인증을 위임합니다.
3. `result != null`: 인증 결과를 반환했다면 순회를 중단합니다. null이면 다음 Provider를 확인합니다.

여기서 중요한 점은 `supports()가 true를 반환`하더라도 반드시 해당 Provider가 `인증을 처리하는 것은 아니라`는 것입니다.
Provider는 authenticate()에서 처리할 수 없는 요청이라고 판단하면 `null을 반환`하여 다음 `Provider에 인증을 넘길 수 있습니다.`
다른 Scope를 처리하도록 구현되어 있으므로, 등록 순서와 관계없이 해당 요청을 처리하는 Provider가 인증 결과를 반환할 수 있습니다.
