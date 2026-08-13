# 한눈에 보기

Router는 Routing Table을 보고 Packet을 보낼 적절한 다음 경로를 선택하는 장비입니다.  
가정용 공유기도 사용자 기기와 Internet을 연결하는 Router 역할을 합니다.

---

# 기본 개념

- `Packet`: Network로 보내는 Data 묶음입니다. 목적지 IP 주소가 들어 있어 Router가 어디로 전달할지 판단할 수 있습니다.
- `Routing Table`: 목적지 Network별로 Packet을 어느 다음 경로로 보낼지 저장한 표입니다. Router는 이 표를 보고 다음 Router나 Network를 선택합니다.

---

# 경로 선택

Router는 `Routing Table`을 보고 Packet을 다음 어디로 보낼지 선택합니다.

같은 목적지로 가는 경로가 여러 개라면 거리, 속도, 경로 비용과 Network 운영 정책 등을 비교합니다. 따라서 항상 물리적으로 가장 짧거나 가장 빠른 경로를 선택하는 것은 아닙니다.

대표적인 경로 계산 방식은 다음과 같습니다.

- `Distance Vector`: 주변 Router에게 목적지까지의 거리 정보를 받아 경로를 계산합니다.
- `Link State`: Network 연결 상태를 모아 전체 지도를 만든 뒤 가장 비용이 낮은 경로를 계산합니다. 이때 Dijkstra Algorithm을 사용할 수 있습니다.

이렇게 계산한 결과가 Routing Table에 저장되고, 실제 Packet이 들어오면 Router는 Table을 빠르게 확인해 다음 경로로 전달합니다.

---

# 참고 자료

- [RFC 1812 — Requirements for IP Version 4 Routers](https://www.rfc-editor.org/rfc/rfc1812.html)
- [RFC 2328 — OSPF Version 2](https://www.rfc-editor.org/rfc/rfc2328.html)
