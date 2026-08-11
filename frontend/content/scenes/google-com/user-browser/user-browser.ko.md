# 한눈에 보기

사용자는 Browser에 Domain Name을 입력하고, Browser는 DNS 조회, Network 연결, HTTPS 통신과 HTTP 요청을 대신 수행합니다.

이 Map에서는 시작점을 단순하게 보여주기 위해 사람인 사용자와 통신을 실행하는 Browser를 하나의 Topic으로 묶었습니다.

---

# 개발자가 개입하는 지점

개발자는 Browser가 보낼 URL, HTTP 요청과 화면 동작을 작성할 수 있지만 DNS 조회와 Network Packet 전달은 대부분 Browser와 운영체제의 Network 기능을 사용합니다.

---

# 참고 자료

- [RFC 9110 — HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110.html)
