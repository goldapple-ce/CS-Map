# 한눈에 보기

Recursive Resolver는 Client를 대신하여 DNS Record의 최종 답을 찾는 DNS Server입니다.

Client는 Resolver에 한 번 요청하지만, Resolver는 Cache를 확인하고 필요하면 여러 DNS Server에 별도의 Query를 보냅니다.

---

# Recursive Resolver는 어디에 있나요?

가정에서 가장 가까운 예는 **공유기**입니다. Client의 DNS Server 주소로 공유기 주소가 설정되어 있으면 Client는 공유기에 DNS Query를 보냅니다.

```text
Client → 공유기 → ISP 또는 Public Recursive Resolver
```

다만 일반적인 공유기는 Root DNS부터 직접 답을 찾기보다, Query를 ISP나 Public Recursive Resolver로 전달하는 **DNS Forwarder 또는 DNS Proxy** 역할을 합니다. 이 Map에서는 Client가 최종 답을 요청하는 대상을 하나의 `Recursive Resolver`로 단순화해 표현합니다.

실제로 재귀 탐색을 수행하는 Resolver에는 통신사가 제공하는 DNS Server, 회사나 학교의 내부 DNS Server, Google Public DNS와 Cloudflare 1.1.1.1 같은 Public DNS Service가 있습니다.

---

# Cache에 답이 있는 경우

```text
Client → Recursive Resolver Cache → DNS Record 반환
```

이전에 찾은 Record의 TTL이 남아 있다면 Resolver는 Root DNS부터 다시 확인하지 않고 Cache의 답을 반환할 수 있습니다.

존재하지 않는 Domain이라는 응답도 일정 시간 Cache될 수 있습니다. 이를 Negative Caching이라고 합니다.

---

# Cache에 답이 없는 경우

```text
Recursive Resolver → Root DNS
Recursive Resolver ← `.com` TLD DNS 위치

Recursive Resolver → `.com` TLD DNS
Recursive Resolver ← `google.com` Authoritative DNS 위치

Recursive Resolver → Authoritative DNS
Recursive Resolver ← A / AAAA 등의 최종 Record
```

Root DNS와 TLD DNS는 일반적으로 `google.com`의 IP 주소를 직접 알려 주지 않습니다. 다음 Query를 보낼 DNS Server의 위치를 Referral로 알려 줍니다.

Resolver는 최종 답을 Client에게 반환하고 TTL 동안 Cache할 수 있습니다.

---

# Recursive Query와 Iterative Query

Client는 Recursive Resolver에 최종 답을 찾아 달라는 Recursive Query를 보냅니다.

Resolver가 Root, TLD와 Authoritative DNS의 안내를 따라가는 과정은 Iterative Resolution입니다. 각 DNS Server가 다음 Server로 요청을 전달하는 것이 아니라 Resolver가 새로운 Query를 반복합니다.

---

# 개발자가 개입하는 지점

Application 개발자가 이 탐색 과정을 직접 구현할 일은 거의 없습니다. 어떤 Recursive Resolver를 사용할지는 운영체제, Network 설정이나 조직의 DNS 환경에서 정해집니다.

가정에서는 공유기 설정에서 상위 DNS Server를 ISP의 DNS Server나 Public DNS Service로 변경할 수 있습니다.

DNS 장애를 확인할 때는 Resolver Cache의 이전 값인지, Referral을 따라가지 못하는지, Authoritative DNS가 잘못된 Record를 반환하는지 구분해야 합니다.

---

# 참고 자료

- [RFC 1034 — Domain Name Resolution](https://www.rfc-editor.org/rfc/rfc1034.html)
- [RFC 1035 — Domain Names, Implementation and Specification](https://www.rfc-editor.org/rfc/rfc1035.html)
- [RFC 2308 — Negative Caching of DNS Queries](https://www.rfc-editor.org/rfc/rfc2308.html)
- [RFC 5625 — DNS Proxy Implementation Guidelines](https://www.rfc-editor.org/rfc/rfc5625.html)
- [Google Public DNS](https://developers.google.com/speed/public-dns)
- [Cloudflare 1.1.1.1](https://developers.cloudflare.com/1.1.1.1/)
