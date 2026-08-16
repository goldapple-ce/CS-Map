# 한눈에 보기

NGINX는 Web Server이면서 Reverse Proxy로 사용할 수 있는 Software입니다.

이 Map에서는 Build된 React 정적 파일을 제공하고 `/api` 요청을 Spring Application으로 전달하는 역할만 다룹니다.

---

# 요청 전달

```text
             ┌→ React 정적 파일 응답
Client → NGINX
             └→ `/api` 요청을 Spring으로 전달
```

NGINX는 요청 URI에 맞는 `location` 설정을 찾습니다. 화면 요청에는 정적 파일을 응답하고, API 요청은 `proxy_pass`에 지정된 Spring Application으로 전달할 수 있습니다.

```nginx
server {
    listen 80;
    root /usr/share/nginx/html;

    location /api/ {
        proxy_pass http://spring:8080;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

`/usr/share/nginx/html`에는 React Build 결과물을 둡니다. `/api` 요청은 `spring:8080`으로 전달하고, 그 밖의 경로에 해당하는 파일이 없으면 SPA의 시작 파일인 `index.html`을 응답합니다.

---

# NGINX를 앞에 두는 이유

Client가 Spring Application에 직접 연결하지 않고 NGINX를 공통 진입점으로 사용할 수 있습니다.

필요에 따라 NGINX에서 HTTPS 연결 종료, 정적 파일 제공, 요청별 전달 규칙과 여러 Application Server로의 부하 분산도 처리할 수 있습니다. 이 기능들이 모두 필수인 것은 아닙니다.

---

# 개발자가 개입하는 지점

개발자는 요청을 받을 Port, `location`, `proxy_pass`로 전달할 Spring Application의 주소와 Timeout을 설정합니다.

Spring이 원래 요청의 Host, Protocol과 Client IP를 알아야 한다면 `Host`, `X-Forwarded-For`, `X-Forwarded-Proto` 같은 Header를 알맞게 전달하고 Application이 신뢰할 Proxy 범위도 설정해야 합니다.

문제가 발생하면 NGINX의 Access Log와 Error Log, 선택된 `location`, 최종 Upstream 주소와 연결 Timeout을 확인합니다.

---

# 헷갈리기 쉬운 점

## Spring 앞에 NGINX가 반드시 필요한 것은 아닙니다

Spring Application도 직접 HTTP 요청을 받을 수 있습니다. NGINX는 외부 진입점과 Application의 역할을 분리하거나 HTTPS, 정적 파일과 부하 분산 같은 기능이 필요할 때 선택합니다.

## NGINX가 Spring의 요청 처리를 대신하지는 않습니다

NGINX는 설정에 따라 요청을 전달합니다. Controller 실행과 비즈니스 로직은 Spring Application이 처리합니다.

---

# 참고 자료

- [NGINX — Proxy Module](https://nginx.org/en/docs/http/ngx_http_proxy_module.html)
- [NGINX Beginner’s Guide — Simple Proxy Server](https://nginx.org/en/docs/beginners_guide.html#proxy)
