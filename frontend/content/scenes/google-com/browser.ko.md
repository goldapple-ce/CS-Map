# 한눈에 보기

Browser는 사용자의 URL 입력을 받아 DNS 조회, Network 연결, HTTPS 통신과 HTTP 요청을 수행하는 Client Software입니다.

사용자는 접속을 시작하는 주체이지만 실제 Network 통신을 수행하는 Software는 Browser이므로 이 Map에서는 Browser만 Topic으로 표시합니다.

---

# Browser가 시작하는 일

1. 주소창에 입력된 문자열을 URL로 해석합니다.
2. DNS를 이용해 Domain Name에 대응하는 목적지 주소를 확인합니다.
3. Server와 Transport 연결과 TLS 연결을 준비합니다.
4. HTTP 요청을 만들고 HTTPS로 보호해 전송합니다.
5. Server의 HTTP 응답을 받아 화면 구성에 사용합니다.

Browser가 이 모든 기능을 혼자 구현한다는 뜻은 아닙니다. DNS와 Network 통신에는 운영체제의 기능을 사용하며 TLS와 HTTP 처리는 Browser 내부 Network 계층과 library가 담당합니다.

---

# 개발자가 개입하는 지점

개발자는 Browser에서 실행될 HTML, CSS와 JavaScript를 작성하고 URL, HTTP method, Header와 Body를 구성할 수 있습니다.

DNS 조회와 Packet 전달 자체는 대부분 Browser와 운영체제의 Network 기능을 사용합니다. 문제가 생기면 Browser 개발자 도구에서 요청 URL, DNS·연결 시간, TLS 정보, 요청·응답 Header와 상태 코드를 확인할 수 있습니다.

---

# 참고 자료

- [RFC 9110 — HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110.html)
- [WHATWG — URL Standard](https://url.spec.whatwg.org/)
