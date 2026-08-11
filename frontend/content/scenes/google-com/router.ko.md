# 한눈에 보기

Router는 서로 다른 Network 사이에서 Packet을 다음 Network로 전달하는 장비입니다.

Packet에 적힌 목적지 IP 주소를 보고, 목적지에 가까워질 수 있는 다음 Router 또는 Network를 선택합니다. 이 전달이 여러 Router에서 반복되면서 Packet이 최종 Server에 도착합니다.

---

# Packet을 전달하는 방법

```text
Client → Router → Router → ··· → 목적지 Server
```

Router는 Packet의 목적지 IP 주소와 자신이 가진 Routing Table을 비교해 다음으로 보낼 곳을 결정합니다. Routing Table에는 특정 Network로 가려면 어느 방향으로 보내야 하는지에 대한 경로 정보가 들어 있습니다.

Router가 처음부터 목적지까지의 전체 이동 경로를 Packet에 적어 보내는 것은 아닙니다. 각 Router가 자신이 알고 있는 정보로 다음 경로를 하나씩 선택합니다.

---

# 경로 정보는 어떻게 생기나요?

관리자가 경로를 직접 설정할 수도 있고, Router끼리 Routing Protocol을 사용해 도달할 수 있는 Network 정보를 교환할 수도 있습니다.

인터넷에서는 여러 Network가 연결되어 있으므로, 경로가 끊기거나 정책이 바뀌면 다른 경로가 선택될 수 있습니다. 하지만 Packet을 전달할 때마다 인터넷 전체에 새로운 경로를 물어보는 것은 아닙니다. Router는 미리 만들어진 Routing Table을 사용합니다.

---

# 가정용 공유기와 Router

가정용 공유기도 내부 Network와 인터넷을 연결하는 Router 역할을 합니다. 여기에 Wi-Fi, NAT, 방화벽과 DHCP 같은 여러 기능이 함께 들어 있는 경우가 많습니다.

따라서 NAT나 Wi-Fi는 가정용 공유기의 대표적인 기능이지만, Router의 가장 기본적인 역할은 **목적지 IP를 보고 Packet을 다음 Network로 전달하는 것**입니다.

---

# 헷갈리기 쉬운 점

전송량을 천천히 늘리고, Network 혼잡이나 Packet 손실이 발생하면 전송량을 줄이는 동작은 Router의 Routing이 아니라 **TCP 혼잡 제어**에 해당합니다. Slow Start와 Congestion Avoidance 같은 방식은 이후 TCP를 다룰 때 설명합니다.

---

# 개발자가 개입하는 지점

Application 개발자가 Router의 Routing Table이나 인터넷 경로를 직접 제어할 일은 거의 없습니다. Network 관리자나 Cloud 운영자는 Route, Gateway와 Network 정책을 설정할 수 있습니다.

개발자가 Router의 역할을 알면 요청이 Server에 도달하지 않을 때 Application 문제인지, Gateway나 중간 Network 경로의 문제인지 구분하는 데 도움이 됩니다.

---

# 참고 자료

- [RFC 1812 — Requirements for IP Version 4 Routers](https://www.rfc-editor.org/rfc/rfc1812.html)
- [Cloudflare Learning Center — What is a Router?](https://www.cloudflare.com/learning/network-layer/what-is-a-router/)
