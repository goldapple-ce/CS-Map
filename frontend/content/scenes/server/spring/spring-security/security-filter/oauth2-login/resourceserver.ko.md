# 한눈에 보기

Resource Server는 Client가 전달한 Access Token을 검증하고 보호된 리소스를 제공하는 서버입니다.
JWT 또는 Opaque Token의 유효성을 확인하고, Scope를 통해 요청한 리소스에 대한 접근 권한을 판단합니다.
Access Token이 유효하지 않거나 권한이 부족한 경우 접근을 거부합니다.

---

# Resource Server란?

Resource Server는 OAuth 2.0에서 보호된 리소스를 보유하고, Client가 전달한 Access Token을 검증하여 허`용된 리소스를 제공하는 서버`입니다.
예를 들어 외부 애플리케이션이 Google Calendar의 일정을 조회하는 경우, Google Calendar API가 Resource Server에 해당합니다.
Authorization Server가 접근 권한을 승인하고 Access Token을 발급한다면, Resource Server는 해당 토큰을 이용한 실제 리소스 접근을 처리합니다.

---

# Resource Server 수행 과정

Client는 Authorization Server에서 발급받은 Access Token을 이용하여 Resource Server에 API 요청을 전달합니다.
일반적으로 HTTP Authorization 헤더에 Bearer Token을 포함합니다.

```http
GET /calendar/v3/calendars/primary/events
Authorization: Bearer ACCESS_TOKEN
```

Resource Server는 요청을 받으면 다음 과정을 수행합니다.

1. `Access Token 검증`: 토큰이 유효한지 확인합니다. JWT라면 Signature와 만료 시간 등을 검증하고, Opaque Token이라면 Authorization Server에 토큰 정보를 조회하는 방식 등을 사용할 수 있습니다.
2. `Scope 확인`: Access Token에 부여된 접근 권한이 요청한 리소스에 필요한 권한을 충족하는지 확인합니다.
3. `리소스 제공`: 토큰이 유효하고 접근 권한이 충분하다면 요청한 리소스를 반환합니다.

---

# Access Token 검증

Resource Server는 Access Token을 신뢰하기 전에 유효성을 확인해야 합니다.
이때 검증 방식은 Access Token의 형식에 따라 달라질 수 있습니다.

- `JWT`: 신뢰할 수 있는 검증 키를 이용하여 Signature, 만료 시간, 발급자, 대상 서버 등을 검증할 수 있습니다.
- `Opaque Token`: 토큰 자체에서 정보를 확인할 수 없으므로, Authorization Server의 Introspection Endpoint 등을 통해 유효성과 권한 정보를 확인할 수 있습니다.

따라서 Resource Server가 반드시 Authorization Server에 매번 토큰 검증을 요청하는 것은 아닙니다.
JWT처럼 자체 검증이 가능한 토큰을 사용한다면 필요한 검증 키를 가지고 독립적으로 처리할 수도 있습니다.

---

# Scope는 왜 필요할까?

Access Token이 유효하다고 해서 Client가 모든 리소스에 접근할 수 있는 것은 아닙니다.
OAuth 2.0에서는 Scope를 통해 `Client에 위임된 접근 권한의 범위를 제한`합니다.
예를 들어 Google Calendar의 일정 조회 권한만 승인받은 Client가 일정 수정 API를 요청한다면, Resource Server는 필요한 권한이 부족하므로 접근을 거부할 수 있습니다.
이처럼 Resource Server는 Access Token의 유효성뿐 아니라 요청한 리소스에 필요한 Scope도 확인해야 합니다.

---

# 접근 거부 처리

Resource Server는 토큰 검증 결과와 접근 권한에 따라 요청을 거부할 수 있습니다.

- `401 Unauthorized`: Access Token이 없거나 만료되었거나 유효하지 않아 인증에 실패한 경우입니다.
- `403 Forbidden`: Access Token은 유효하지만 요청한 리소스에 필요한 Scope가 부족한 경우입니다.

OAuth 2.0의 Bearer Token 규격에서는 이러한 오류를 `WWW-Authenticate` 응답 헤더를 통해 전달할 수 있습니다.
