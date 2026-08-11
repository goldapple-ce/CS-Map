# 한눈에 보기

Browser가 `google.com`의 Server에 요청을 보내려면 먼저 Server의 IP 주소를 알아야 합니다. DNS는 사람이 사용하는 Domain Name을 통신에 필요한 IP 주소로 확인할 수 있게 해주는 시스템입니다.

이 그림은 Client가 `google.com`만 알고 있는 상태에서 시작해, **어떻게 IP 주소를 얻는지** 보여줍니다.

---

# 왜 여러 DNS Server가 등장하나요?

하나의 DNS Server가 세상의 모든 Domain과 IP 주소를 가지고 있지는 않습니다. 정보가 여러 DNS Server에 나뉘어 있으므로, Recursive Resolver는 안내를 따라 최종 답을 가진 Server까지 찾아갑니다.

- **Client**는 `google.com`의 IP 주소를 요청합니다.
- **Recursive Resolver**는 Client 대신 답을 찾습니다.
- **Root DNS**는 `.com`을 담당하는 TLD DNS의 위치를 알려줍니다.
- **TLD DNS**는 `google.com`을 담당하는 Authoritative DNS의 위치를 알려줍니다.
- **Authoritative DNS**는 `google.com`의 A 또는 AAAA Record를 반환합니다.
- **Recursive Resolver**는 찾은 IP 주소를 Client에게 돌려줍니다.

따라서 이 그림에서 중요한 것은 DNS Server의 이름을 외우는 것이 아니라, **Resolver가 다음 위치를 안내받으며 최종 IP 주소를 찾아간다**는 흐름입니다.

---

# 그림을 읽을 때 주의할 점

Root DNS가 TLD DNS로 요청을 전달하고, TLD DNS가 Authoritative DNS로 다시 전달하는 것은 아닙니다.

Root와 TLD DNS는 다음으로 확인할 DNS Server의 위치를 알려 줍니다. Scene의 세 질의 화살표가 모두 Recursive Resolver에서 출발하는 이유는 Resolver가 Referral을 받을 때마다 다음 DNS Server에 새로운 Query를 보내기 때문입니다.

Resolver의 Cache에 아직 유효한 답이 있다면 Root DNS부터 다시 찾아가지 않고 바로 IP 주소를 반환할 수도 있습니다. 그림은 Cache에 답이 없어서 전체 탐색이 필요한 경우를 보여줍니다.

A, AAAA와 CNAME 같은 DNS Record는 별도 처리 단계가 아니라 Authoritative DNS 응답의 내용이므로 별도 Topic으로 두지 않습니다.

---

# 개발자가 개입하는 지점

Application 개발자가 Recursive Resolver의 내부 탐색을 직접 구현할 일은 거의 없습니다. 운영체제나 Runtime의 이름 확인 기능을 사용합니다.

Domain을 운영한다면 Authoritative DNS에 A, AAAA와 CNAME 같은 Record와 TTL을 설정합니다. 장애를 확인할 때는 사용 중인 Recursive Resolver의 응답과 Authoritative DNS의 원본 설정을 구분해서 봐야 합니다.

---

# 참고 자료

- [RFC 1034 — Domain Names, Concepts and Facilities](https://www.rfc-editor.org/rfc/rfc1034.html)
- [RFC 1035 — Domain Names, Implementation and Specification](https://www.rfc-editor.org/rfc/rfc1035.html)
- [RFC 8499 — DNS Terminology](https://www.rfc-editor.org/rfc/rfc8499.html)
