# 한눈에 보기

CA(Certificate Authority)는 Server 인증서에 전자서명하여, Browser가 Server의 신원을 검증할 수 있는 신뢰 체계를 제공합니다.

CA가 사용자의 HTTPS 접속 때마다 호출되는 것은 아닙니다. Browser는 미리 가지고 있는 Root CA 신뢰 기준을 이용해 Server가 전달한 인증서 체인을 검증합니다.

---

# Certificate

Server Certificate에는 Domain Name, Public Key, 유효기간과 발급자 등의 정보가 들어 있습니다. Browser는 다음과 같은 항목을 확인합니다.

- 요청한 Domain Name과 인증서가 일치하는가
- 인증서가 유효기간 안에 있는가
- 신뢰하는 Root CA까지 인증서 체인이 이어지는가
- 인증서의 전자서명이 유효한가

---

# 개발자가 개입하는 지점

개발자나 운영자는 올바른 Domain의 인증서를 발급하고, Server에 인증서와 중간 인증서 체인을 설정하며, Private Key가 노출되지 않도록 관리합니다.

---

# 참고 자료

- [RFC 5280 — Internet X.509 PKI Certificate Profile](https://www.rfc-editor.org/rfc/rfc5280.html)
- [RFC 9525 — Service Identity in TLS](https://www.rfc-editor.org/rfc/rfc9525.html)
