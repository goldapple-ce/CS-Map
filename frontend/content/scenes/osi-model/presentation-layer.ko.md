# 한눈에 보기

Presentation Layer는 서로 다른 System이 데이터를 같은 의미로 해석할 수 있도록 데이터의 표현 방식을 다루는 계층입니다.

- `UTF-8` 같은 문자 Encoding
- Object를 JSON이나 다른 전송 형식으로 바꾸는 Serialization
- 전송할 데이터의 Compression과 Decompression
- 데이터를 보호하는 Encryption과 Decryption

이 기능을 통해 보내는 쪽에서 만든 데이터 표현을 받는 쪽에서도 같은 의미로 복원할 수 있습니다.

---

# SSL과 TLS

OSI 7계층을 설명할 때 SSL과 TLS는 암호화와 데이터 표현을 담당한다는 이유로 Presentation Layer의 대표적인 예로 자주 배치됩니다.

다만 실제 TCP/IP 구현에서는 TLS가 독립된 Presentation Layer에 정확히 들어맞는다고 보기는 어렵습니다. TLS는 HTTP 같은 Application Layer Protocol과 TCP 사이에서 데이터를 암호화하고 상대를 인증합니다.

`SSL`은 오래된 Protocol의 이름이며 현재는 사용하지 않습니다. 지금 HTTPS에서 사용하는 것은 SSL의 후속인 **TLS**입니다.

SSH도 암호화를 제공하지만 원격 접속이라는 Application 기능과 Protocol 전체를 정의하므로 Application Layer에서 다룹니다.

---

# 실제 구현에서는

Presentation Layer만 담당하는 별도 Program이 항상 존재하지는 않습니다. JSON Library가 Serialization을, TLS Library가 암호화를 처리하는 것처럼 Application과 Library 안에서 관련 기능을 나누어 맡는 경우가 많습니다.

---

# 개발자가 개입하는 지점

개발자는 JSON 같은 데이터 형식, UTF-8 같은 문자 Encoding, 압축 사용 여부, TLS Version과 인증서를 설정할 수 있습니다.

---

# 참고 자료

- [RFC 8259 — The JavaScript Object Notation Data Interchange Format](https://www.rfc-editor.org/rfc/rfc8259.html)
- [RFC 8446 — TLS 1.3](https://www.rfc-editor.org/rfc/rfc8446.html)
