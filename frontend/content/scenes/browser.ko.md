# 한눈에 보기

Browser는 사용자가 입력한 주소를 보고 Web Server에 요청을 시작하는 Software입니다.

---

# Browser가 하는 일

1. 주소창에서 Domain Name을 확인합니다.
2. Browser나 사용자 기기에 Cache된 IP 주소가 있는지 확인합니다.
3. 없으면 DNS를 통해 IP 주소를 찾습니다.
4. 찾은 IP 주소로 Server에 HTTP 요청을 보냅니다.

Network 통신에는 운영체제의 기능도 함께 사용합니다. HTTPS 내부 동작과 화면을 그리는 과정은 이 Topic에서 다루지 않습니다.

---

# 참고 자료

- [RFC 9110 — HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110.html)
- [WHATWG — URL Standard](https://url.spec.whatwg.org/)
