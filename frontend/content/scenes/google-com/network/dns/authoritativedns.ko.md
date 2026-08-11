# 한눈에 보기

Authoritative DNS는 자신이 담당하는 Domain의 DNS Record에 대한 원본 답을 제공하는 DNS Server입니다.

`google.com`을 담당하는 Authoritative DNS는 Query에 맞는 A, AAAA나 CNAME Record를 반환할 수 있습니다.

```text
Recursive Resolver → Authoritative DNS: google.com의 A Record는?
Recursive Resolver ← Authoritative DNS: A Record와 TTL
```

Recursive Resolver는 이 답을 Client에게 반환하고 TTL 동안 Cache할 수 있습니다.

- `A` Record는 IPv4 주소를 나타냅니다.
- `AAAA` Record는 IPv6 주소를 나타냅니다.
- `CNAME` Record는 다른 Domain Name을 가리키는 별칭입니다.
- `NS` Record는 Domain을 담당하는 Authoritative DNS를 나타냅니다.

---

# 개발자가 개입하는 지점

Domain을 운영하는 개발자나 운영자는 Authoritative DNS에 Record와 TTL을 설정합니다. 잘못된 A·AAAA Record, CNAME 연결이나 빠진 Record는 모든 Recursive Resolver에 잘못된 답을 제공할 수 있습니다.

DNS 장애를 확인할 때는 Recursive Resolver의 Cache된 응답과 Authoritative DNS가 현재 제공하는 원본 응답을 구분해야 합니다.

---

# 참고 자료

- [RFC 1034 — Authoritative Name Servers](https://www.rfc-editor.org/rfc/rfc1034.html)
- [RFC 1035 — Resource Records](https://www.rfc-editor.org/rfc/rfc1035.html)
