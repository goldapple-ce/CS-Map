# 한눈에 보기

Access Token과 Refresh Token은 JWT 기반 인증에서 `사용자의 인증 상태를 유지`하기 위해 사용하는 두 종류의 토큰입니다.
`Access Token`은 API `인증에 사용`하며, 짧은 만료 시간을 통해 탈취 시 피해 기간을 제한합니다.
`Refresh Token`은 `Access Token을 재발급`하는 데 사용하며, 긴 만료 시간을 제공하는 대신 서버 측 저장과 폐기 관리가 중요합니다.
두 토큰을 구분하는 이유는 인증의 유효 기간과 보안 위험 사이의 균형을 맞추기 위해서입니다.
Refresh Token Rotation을 적용하면 기존 토큰의 재사용을 제한할 수 있지만, 동시에 발생하는 재발급 요청에서 Race Condition이 발생하지 않도록 원자적 갱신을 보장해야 합니다.

---

# Access Token이란?

Access Token은 클라이언트가 보호된 API에 접근할 때 `사용자를 인증`하는데 사용하는 토큰입니다.
서버는 Access Token의 Signature와 만료 시간 등을 검증하고, 포함된 사용자 식별자와 권한 정보를 이용해 Authentication을 생성합니다.
하지만 Access Token이 `탈취되면 공격자도 해당 토큰을 이용`해 API에 접근할 수 있다는 문제가 있습니다.
따라서 Access Token은 일반적으로 15분과 같이 비교적 `짧은 만료 시간`을 설정하여 탈취된 토큰이 악용될 수 있는 기간을 제한합니다.

---

# Refresh Token이란?

Refresh Token은 Access Token이 만료되었을 때 새로운 `Access Token을 발급받기 위한 토큰`입니다.
Access Token과 달리 일반적인 API 인증에는 사용하지 않으며, 토큰 재발급 요청에서만 사용합니다.
Refresh Token은 사용자가 Access Token이 만료될 때마다 다시 로그인하지 않도록 비교적 `긴 만료 시간`을 가집니다.
하지만 Refresh Token이 `탈취되면 공격자가 새로운 Access Token을 발급`받을 수 있으므로, Access Token보다 엄격하게 관리해야 합니다.
따라서 Refresh Token은 Redis나 DB와 같은 `서버 측 저장소에서 상태를 관리`하고, 재발급 시 기존 토큰을 폐기하는 `Rotation` 방식을 적용할 수 있습니다.

---

# Access Token과 Refresh Token의 차이

| 구분         | Access Token         | Refresh Token                 |
| ------------ | -------------------- | ----------------------------- |
| 목적         | API 인증             | Access Token 재발급           |
| 사용 위치    | 보호된 API 요청      | 토큰 재발급 API               |
| 만료 시간    | 짧음 (예: 15분)      | 김 (예: 7일)                  |
| 포함 정보    | 사용자 식별자, 권한  | 사용자 식별자, 토큰 식별자 등 |
| 서버 측 관리 | Stateless 검증 가능  | 저장 및 폐기 관리 권장        |
| 탈취 시 위험 | 만료 전까지 API 접근 | 새로운 Access Token 발급 가능 |

---

# Refresh Token Rotation이란?

Refresh Token Rotation은 Refresh Token을 사용할 때마다 `새로운 Refresh Token을 발급`하고, `기존 Refresh Token을 폐기`하는 방식입니다.
일반적인 Refresh Token 방식에서는 동일한 토큰을 만료될 때까지 반복 사용할 수 있지만, Rotation을 적용하면 `한 번 사용한 Refresh Token은 다시 사용할 수 없습니다.`
이를 통해 Refresh Token이 탈취되었더라도 이미 사용된 토큰의 재사용을 탐지할 수 있습니다.
이미 폐기된 Refresh Token이 다시 사용되었다면 토큰 탈취에 의한 재사용 가능성을 의심할 수 있으며, 해당 토큰 계열을 무효화하고 재로그인을 요구하는 정책을 적용할 수 있습니다.

---

# Refresh Token Rotation의 동시성 문제

Refresh Token Rotation에서는 동일한 Refresh Token으로 여러 재발급 요청이 동시에 들어올 때 `Race Condition이 발생`할 수 있습니다.
예를 들어 Access Token이 만료된 상태에서 여러 API 요청이 동시에 실패하면, 클라이언트가 동일한 `Refresh Token으로 재발급 요청을 중복 전송`할 수 있습니다.

```text
요청 A                        요청 B
  │                             │
  ▼                             ▼
Refresh Token A 검증       Refresh Token A 검증
  │                             │
  ▼                             ▼
유효한 토큰 확인           유효한 토큰 확인
  │                             │
  ▼                             ▼
Refresh Token B 발급       Refresh Token C 발급
  │                             │
  ▼                             ▼
기존 토큰 폐기             기존 토큰 폐기
```

두 요청이 모두 기존 Refresh Token을 유효하다고 판단하면 각각 새로운 Refresh Token을 발급할 수 있습니다.
이때 서버의 저장 방식에 따라 마지막에 저장된 토큰만 유효하게 남거나, 여러 Refresh Token이 동시에 유효해지는 문제가 발생할 수 있습니다.
이는 토큰 검증과 갱신이 하나의 원자적 연산으로 처리되지 않기 때문에 발생하는 Race Condition입니다.

## 해결 방법

1. `원자적 갱신`: Redis Lua Script나 DB의 조건부 UPDATE를 이용하여 기존 토큰 검증과 교체를 하나의 원자적 연산으로 처리합니다.
2. `클라이언트 요청 통합`: 여러 API 요청에서 Access Token 만료가 동시에 발생하더라도 하나의 Refresh 요청만 보내고 결과를 공유하도록 처리합니다.
3. `재사용 탐지 정책`: 이미 사용된 Refresh Token이 다시 전달되었을 때 정상적인 중복 요청과 탈취 가능성을 고려하여 토큰 무효화 정책을 설계합니다.

특히 서버에서는 원자적 갱신을 보장하는 것이 중요합니다.
원자적 갱신을 적용하면 여러 재발급 요청이 동시에 들어오더라도 하나의 요청만 기존 Refresh Token을 교체할 수 있습니다.
다만 정상적인 클라이언트의 중복 요청도 재사용으로 감지될 수 있으므로, 짧은 유예 기간이나 요청 중복 처리 정책을 적용할 때는 보안상 허용 범위를 신중하게 결정해야 합니다.

---

# Refresh Token도 JWT여야 할까?

Refresh Token은 반드시 `JWT 형식일 필요는 없습니다.`
Access Token은 서버가 자체적으로 검증할 수 있도록 JWT를 사용하더라도, Refresh Token은 무작위 문자열 형태의 Opaque Token으로 발급할 수 있습니다.
Refresh Token을 서버 측 저장소에서 조회하고 유효성을 확인하는 구조라면, 토큰 자체에 사용자 정보를 포함할 필요가 없기 때문입니다.
따라서 Access Token과 Refresh Token은 반드시 동일한 형식을 사용할 필요가 없으며, 각각의 목적에 맞게 선택할 수 있습니다.
