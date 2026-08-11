# 한눈에 보기

Root DNS는 DNS 계층의 시작점입니다. `google.com`의 IP 주소를 직접 알려 주기보다 `.com`을 담당하는 TLD DNS의 위치를 Referral로 알려 줍니다.

```text
Recursive Resolver → Root DNS: google.com의 A Record는?
Recursive Resolver ← Root DNS: .com TLD DNS에 물어보세요
```

Root DNS의 응답을 받은 Recursive Resolver가 TLD DNS에 새로운 Query를 보냅니다. Root DNS가 Query를 TLD DNS로 대신 전달하는 것은 아닙니다.

---

# 개발자가 개입하는 지점

일반적인 Application 개발자가 Root DNS를 직접 설정하거나 호출할 일은 없습니다. Recursive Resolver가 Root Hint 정보를 이용해 Root DNS에 접근합니다.

그럼에도 Root DNS의 역할을 알면 Root Server에서 최종 IP 주소가 반환되지 않는 것이 정상적인 위임 과정임을 이해할 수 있습니다.

---

# 참고 자료

- [RFC 1034 — Name Servers](https://www.rfc-editor.org/rfc/rfc1034.html)
- [IANA — Root Servers](https://www.iana.org/domains/root/servers)
