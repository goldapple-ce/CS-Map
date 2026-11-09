# 한눈에 보기

API Request에서는 로그인 이후 발급받은 Access Token을 HTTP 요청에 포함하여 서버에 전달합니다.
대표적인 전송 방식으로는 `Authorization 헤더`의 Bearer Token 방식과 브라우저가 자동으로 전송하는 `Cookie 방식`이 있습니다.
토큰 저장 방식에는 Memory, localStorage, sessionStorage, HttpOnly Cookie 등이 있으며, 각각 XSS와 CSRF에 대한 보안 고려 사항이 다릅니다.
서버는 전달받은 JWT를 검증하여 Authentication을 구성하고, 사용자의 권한에 따라 API 접근 여부를 판단합니다.

---

# API Request

API Request에서는 로그인 이후 발급받은 `Access Token을 HTTP 요청에 포함`하여 서버에 전달합니다.
서버는 전달받은 Access Token을 검증하여 사용자를 식별하고, 해당 사용자의 권한에 따라 API 접근 여부를 판단합니다.
이때 Access Token을 어디에 저장하고, 어떤 방식으로 전달하는지는 클라이언트의 인증 구조와 보안에 영향을 미칩니다.

---

# Access Token 전송 방식

Access Token을 전달하는 대표적인 방식에는 Authorization 헤더와 Cookie가 있습니다.

## Authorization 헤더

Authorization 헤더 방식은 클라이언트가 Access Token을 직접 HTTP 요청의 `Authorization 헤더에 포함`하는 방식입니다.
일반적으로 Bearer 스키마를 사용하며, 클라이언트가 요청마다 토큰을 `명시적으로 추가`해야 합니다.

```http
GET /api/orders
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

## Cookie

Cookie 방식은 서버가 로그인 성공 응답의 Set-Cookie 헤더를 통해 Access Token을 전달하고, `브라우저`가 이후 요청에 해당 `쿠키를 자동으로 포함`하는 방식입니다.

```http
GET /api/orders
Cookie: access_token=eyJhbGciOiJIUzI1NiJ9...
```

특히 `HttpOnly` 쿠키를 사용하면 JavaScript에서 Access Token을 직접 읽을 수 없으므로, `XSS`로 인한 토큰 값의 직접적인 탈취 위험을 줄일 수 있습니다.
하지만 브라우저가 쿠키를 자동으로 전송한다는 특성 때문에 `CSRF 공격에 대한 별도의 방어`가 필요합니다.

---

# Access Token 저장 방식

Authorization 헤더와 Cookie 중 어떤 방식으로 토큰을 전달하는지에 따라 클라이언트의 저장 방식도 달라질 수 있습니다.

| 저장 방식       | 특징                                                                   |
| --------------- | ---------------------------------------------------------------------- |
| Memory          | JavaScript 메모리에 저장하며 페이지를 새로고침하면 사라질 수 있습니다. |
| localStorage    | 브라우저에 유지되지만 JavaScript에서 접근할 수 있습니다.               |
| sessionStorage  | 탭 단위로 유지되며 JavaScript에서 접근할 수 있습니다.                  |
| HttpOnly Cookie | 브라우저가 관리하고 JavaScript에서 토큰 값을 직접 읽을 수 없습니다.    |

localStorage와 sessionStorage는 JavaScript로 접근할 수 있으므로 XSS가 발생하면 토큰이 노출될 위험이 있습니다.
반면 HttpOnly 쿠키는 토큰 값에 대한 JavaScript 접근을 막을 수 있지만, XSS를 통한 악의적인 요청 실행까지 차단하지는 못합니다.

따라서 저장 방식은 단순한 유지 기간뿐 아니라 XSS와 CSRF 등의 보안 위험을 함께 고려하여 선택해야 합니다.
