# 한눈에 보기

Network Layer는 서로 다른 Network에 있는 목적지 Host까지 Packet을 전달하는 역할을 합니다. 대표적인 Protocol은 IP입니다.

IP는 전송할 데이터에 출발지와 목적지 IP 주소 등이 담긴 Header를 붙여 IP Packet을 만듭니다.

---

# IP 주소

IP 주소는 Network에서 출발지와 목적지 Host를 식별합니다.

- `IPv4`: `192.0.2.1`처럼 32-bit 주소를 사용합니다.
- `IPv6`: `2001:db8::1`처럼 128-bit 주소를 사용합니다.

Port가 Host 내부의 Process를 구분한다면, IP 주소는 Network에서 목적지 Host를 찾는 데 사용됩니다.

---

# Router와 Routing

Router는 Packet의 목적지 IP 주소와 Routing Table을 보고 다음 Router 또는 Network로 Packet을 전달합니다.

Router를 여러 번 거치더라도 목적지 IP는 최종 Server를 가리킵니다. 각 구간에서 다음으로 전달할 대상과 Frame 정보는 달라질 수 있습니다.

각 Router는 목적지까지의 전체 과정을 한 번에 실행하지 않습니다. 자신이 가진 Routing Table을 이용해 다음으로 보낼 곳을 선택하고, 다음 Router가 같은 판단을 반복합니다.

---

# TTL과 Hop Limit

잘못된 Routing으로 Packet이 Network를 계속 순환하는 것을 막기 위해 Packet이 Router를 통과할 수 있는 횟수를 제한합니다.

- IPv4는 `TTL`을 사용합니다.
- IPv6는 `Hop Limit`을 사용합니다.

Router를 하나 지날 때마다 값이 감소하고, 0이 되면 Packet은 더 이상 전달되지 않습니다.

---

# IP가 보장하지 않는 것

IP는 Packet을 목적지 방향으로 전달하려고 하지만 도착, 순서와 중복 방지를 보장하지 않는 Best Effort 방식입니다.

신뢰성 있는 전달이 필요하다면 Transport Layer의 TCP 같은 Protocol이 순서 확인과 재전송을 담당합니다. 이것이 Network Layer와 Transport Layer를 분리해서 보는 이유입니다.

---

# 개발자가 개입하는 지점

Application 개발자가 Packet 경로를 직접 선택할 일은 거의 없습니다. Network나 Cloud 환경에서는 IP 주소, Subnet, Route, Gateway, 방화벽과 Load Balancer 설정에 개입할 수 있습니다.

장애를 확인할 때는 Domain Name이 IP 주소로 변환되지 않는 문제인지, IP Route가 목적지까지 이어지지 않는 문제인지 구분하는 것이 중요합니다.

---

# 참고 자료

- [RFC 791 — Internet Protocol](https://www.rfc-editor.org/rfc/rfc791.html)
- [RFC 8200 — Internet Protocol, Version 6](https://www.rfc-editor.org/rfc/rfc8200.html)
- [RFC 1812 — Requirements for IP Version 4 Routers](https://www.rfc-editor.org/rfc/rfc1812.html)
