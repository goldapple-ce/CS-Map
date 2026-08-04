# 개요

로그인 성공 후 만들어진 `SecurityContext`를 요청 사이에 저장하고 다음 요청에서 복원하는 전략 인터페이스입니다.

---

# 이 Scene에서 저장하는 것

저장 대상은 현재 사용자의 `OAuth2AuthenticationToken`이 담긴 `SecurityContext`입니다. 세션 기반 구성에서는 이를 저장해야 브라우저가 다음 요청에서 세션 쿠키를 보냈을 때 로그인 사용자를 복원할 수 있습니다.

```text
SecurityContext
└─ OAuth2AuthenticationToken
   └─ principal: OAuth2User
```

이 저장소는 Access Token 저장소와 목적이 다릅니다.

- `SecurityContextRepository`: 내 애플리케이션에서 로그인한 사용자가 누구인지 저장합니다.
- `OAuth2AuthorizedClientRepository`: Provider Client 정보와 Access·Refresh Token을 사용자와 연결해 저장합니다.

세션을 사용하지 않는 구성에서는 저장 정책이 달라질 수 있으므로 모든 OAuth2 Login이 같은 방식으로 `HttpSession`에 유지된다고 단정하면 안 됩니다.

---

# 참고 자료

- [Spring Security - SecurityContextRepository API](https://docs.spring.io/spring-security/reference/api/java/org/springframework/security/web/context/SecurityContextRepository.html)
