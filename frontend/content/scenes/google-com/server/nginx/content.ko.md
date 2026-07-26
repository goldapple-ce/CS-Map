# NGINX Reverse Proxy

## 개요

NGINX는 외부 요청을 받은 뒤 설정된 주소의 upstream server로 요청을 전달하는 reverse proxy로 사용할 수 있습니다. `proxy_pass`는 전달할 server의 protocol과 주소, 선택적인 URI를 지정합니다.

## 필요한 이유

클라이언트가 Application Server에 직접 연결하지 않게 하면 외부 접점과 애플리케이션 처리 역할을 분리할 수 있습니다. TLS 종료, 정적 파일 처리, 전달 규칙과 부하 분산 같은 기능도 구성에 따라 Proxy 계층에서 맡을 수 있지만 모두 필수는 아닙니다.

## 동작 과정

1. NGINX가 HTTP 요청을 받습니다.
2. 요청 URI에 맞는 `location` 설정을 찾습니다.
3. 설정에 따라 전달할 upstream을 결정합니다.
4. `proxy_pass`로 요청을 upstream Application Server에 전달합니다.
5. upstream 응답을 받아 클라이언트 방향으로 돌려보냅니다.

## 내부 구조

화면의 흐름은 reverse proxy 역할에 집중한 단순화입니다. 실제 header 전달, buffering, timeout, retry와 cache 동작은 각각의 설정에 따라 달라집니다.

## 실패 상황

- upstream 이름을 해석하지 못하거나 연결이 거부될 수 있습니다.
- timeout 또는 잘못된 URI 변환 때문에 요청이 실패할 수 있습니다.
- 필요한 header가 전달되지 않아 Application Server가 원래 요청 정보를 해석하지 못할 수 있습니다.

## 실무 맥락

NGINX에서 문제가 발생하면 선택된 `location`, 최종 upstream 주소, 연결·응답 timeout과 access/error log를 함께 확인합니다.

## 출처

- NGINX, _Module ngx_http_proxy_module_
- NGINX, _Beginner's Guide — Setting Up a Simple Proxy Server_

## 참고 자료

- [NGINX ngx_http_proxy_module](https://nginx.org/en/docs/http/ngx_http_proxy_module.html)
- [NGINX Beginner's Guide — Setting Up a Simple Proxy Server](https://nginx.org/en/docs/beginners_guide.html#proxy)
