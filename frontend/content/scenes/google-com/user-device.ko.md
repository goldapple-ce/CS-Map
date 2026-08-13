# 한눈에 보기

사용자 기기의 운영체제도 이전에 확인한 IP 주소를 Cache할 수 있습니다.

---

# IP 주소 확인

```text
Cache 확인 → Hit → 저장된 IP 주소 사용
          → Miss → DNS에 질의
```

Cache된 IP 주소가 있으면 DNS 조회를 생략할 수 있습니다. 없으면 Router를 통해 DNS에 질의합니다.

---

# 참고 자료

- [RFC 1034 — Domain Names, Concepts and Facilities](https://www.rfc-editor.org/rfc/rfc1034.html)
