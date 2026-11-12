# 한눈에 보기

Resource Owner는 보호된 리소스에 대한 접근 `권한을 부여할 수 있는 주체`로, 일반적으로 사용자입니다.
Authorization Server에서 인증하고 Client가 요청한 권한을 승인하거나 거부합니다.
기존 로그인 세션과 권한 동의 이력이 유효하다면 재로그인이나 `동의 화면 없이 인증 과정이 진행`될 수 있으며, `prompt=select_account`로 계정 선택을 요청할 수 있습니다.

---

# Resource Owner

Resource Owner는 OAuth 2.0에서 보호된 리소스에 대한 접근 `권한을 부여할 수 있는 주체`입니다.
일반적으로 사용자에 해당하며, Client가 자신의 리소스에 접근할 수 있도록 권한을 승인하는 역할을 수행합니다.
예를 들어 외부 애플리케이션이 Google Calendar의 일정을 조회하려는 경우, `Google 계정 소유자가 Resource Owner에 해당`합니다.

---

# Resource Owner의 역할

OAuth 2.0의 Authorization Code Flow에서 Resource Owner는 `Authorization Server를 통해 인증`하고, Client가 요청한 접근 권한을 승인합니다.

1. Client의 요청에 따라 Authorization Server의 인증 및 권한 승인 화면으로 이동합니다.
2. Authorization Server에서 사용자 인증을 수행합니다.
3. Client가 요청한 Scope를 확인하고 접근 권한을 승인하거나 거부합니다.

Resource Owner가 권한을 승인하면 Authorization Server는 Client에 Authorization Code를 발급하는 과정을 진행합니다.
이때 Resource Owner는 자신의 비밀번호를 Client에 직접 제공하지 않으며, Client에 허용할 접근 권한의 범위를 결정할 수 있습니다.

---

# 항상 로그인과 권한 동의가 필요할까?

Authorization Code Flow를 시작한다고 해서 사용자가 매번 로그인하거나 권한 동의 화면을 거쳐야 하는 것은 아닙니다.
Authorization Server는 `기존 로그인 세션과 권한 동의 이력을 재사용`할 수 있기 때문입니다.

예를 들어 사용자가 이미 Google에 로그인되어 있고, Client에 프로필 조회 권한을 승인한 상태라면 다음과 같이 처리될 수 있습니다.

1. `로그인 생략`: Google의 로그인 세션이 유효하다면 사용자에게 아이디와 비밀번호를 다시 요구하지 않을 수 있습니다.
2. `권한 동의 생략:` 동일한 Client에 요청된 Scope를 이미 승인했고 해당 권한이 유지되고 있다면 동의 화면을 생략할 수 있습니다.

따라서 두 조건이 충족되면 로그인과 권한 동의 화면 없이 Authorization Code가 발급될 수 있습니다.
다만 새로운 Scope를 요청하거나 기존 동의가 철회된 경우에는 다시 권한 승인이 필요할 수 있으며, Authorization Server의 정책에 따라 재인증을 요구할 수도 있습니다.

---

# 로그인 계정을 직접 선택하려면?

사용자가 여러 Google 계정에 로그인한 상태라면, 기존 로그인 세션에 따라 의도하지 않은 계정으로 인증이 진행될 수 있습니다.
이때 Client는 Authorization 요청에 `prompt=select_account` 파라미터를 추가하여 Google에 계정 선택 화면을 표시하도록 요청할 수 있습니다.

```http
GET /o/oauth2/v2/auth?...&prompt=select_account
```

Google에서 지원하는 대표적인 prompt 값은 다음과 같습니다.

- `prompt=select_account`: 기존 로그인 세션이 있더라도 계정 선택 화면을 표시하도록 요청합니다.
- `prompt=consent`: 기존 권한 동의 여부와 관계없이 동의 화면을 표시하도록 요청합니다.
- `prompt=none`: 사용자와의 추가 상호작용 없이 인증을 시도하며, 로그인이나 동의가 필요하면 오류를 반환합니다.

따라서 여러 Google 계정 중 사용자가 직접 계정을 선택하도록 하려면 `prompt=select_account`를 지정하면 됩니다.
다만 prompt는 Client가 Authorization Server에 요청하는 동작이며, 최종적인 화면 표시와 인증 처리는 Authorization Server가 담당합니다.
