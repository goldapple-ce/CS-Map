# 한눈에 보기

TLD DNS는 `.com`, `.net`, `.org`, `.kr` 같은 Top-Level Domain 영역의 위임 정보를 관리합니다.

`.com` TLD DNS는 일반적으로 `google.com`의 최종 IP 주소보다, `google.com`을 담당하는 Authoritative DNS의 위치를 Referral로 알려 줍니다.

```text
Recursive Resolver → .com TLD DNS: google.com의 A Record는?
Recursive Resolver ← .com TLD DNS: google.com의 Authoritative DNS에 물어보세요
```

Referral을 받은 Recursive Resolver가 Authoritative DNS에 새로운 Query를 보냅니다.

---

# 개발자가 개입하는 지점

Application 개발자가 TLD DNS를 직접 다룰 일은 없습니다. Domain을 등록하고 Name Server를 지정하면 Registrar와 Registry를 통해 TLD의 위임 정보에 반영됩니다.

Domain의 Name Server 설정을 변경할 때는 TLD에 등록된 위임 정보와 실제 Authoritative DNS 설정이 서로 맞는지 확인해야 합니다.

---

# 참고 자료

- [RFC 1034 — Domain Name Space and Delegation](https://www.rfc-editor.org/rfc/rfc1034.html)
- [ICANN — Top-Level Domains](https://www.icann.org/resources/pages/tlds-2012-02-25-en)
