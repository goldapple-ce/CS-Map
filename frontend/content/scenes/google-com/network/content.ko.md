# Router와 인터넷 경로

## 개요

DNS로 목적지 IP 주소를 알게 되어도 사용자 장치가 원격 서버에 packet을 직접 전달하는 것은 아닙니다. 목적지가 로컬 네트워크 밖에 있다면 장치는 기본 게이트웨이를 다음 hop으로 선택하고, 여러 router와 ISP 네트워크를 거쳐 목적지 네트워크로 packet을 보냅니다.

## 필요한 이유

IP 주소는 최종 목적지를 나타내지만, 현재 링크에서 frame을 누구에게 전달할지는 별도로 결정해야 합니다. 장치는 routing table로 다음 hop을 선택하고, IPv4에서는 ARP, IPv6에서는 Neighbor Discovery를 이용해 이웃의 링크 계층 주소를 확인할 수 있습니다.

## 동작 과정

1. 사용자 장치가 목적지 주소와 routing table을 보고 기본 게이트웨이를 다음 hop으로 선택합니다.
2. IPv4에서는 ARP, IPv6에서는 NDP를 사용해 게이트웨이의 링크 계층 주소를 확인할 수 있습니다.
3. 장치가 frame을 공유기 또는 로컬 router로 전달합니다.
4. 가정용 IPv4 환경에서는 공유기가 NAT/NAPT로 내부 주소와 port를 외부 값에 대응시킬 수 있습니다.
5. Packet이 ISP 네트워크에 전달됩니다.
6. 인터넷의 router들이 보유한 경로 정보와 정책을 바탕으로 목적지 네트워크 쪽 다음 hop을 선택합니다.
7. Packet이 목적지 서버가 연결된 네트워크에 도달합니다.

## 내부 구조

이 흐름은 일반적인 가정용 접속을 설명하기 위한 예시입니다. NAT는 Router의 필수 기능이 아니며 모든 IPv4·IPv6 경로에 항상 존재하지 않습니다. 또한 BGP는 AS 사이의 도달 가능성 정보를 교환하는 대표적인 protocol이지만, 개별 packet이 이동할 때마다 BGP 질의를 실행하는 것은 아닙니다.

## 실패 상황

- 기본 게이트웨이 설정이 없거나 잘못될 수 있습니다.
- ARP/NDP로 이웃의 링크 계층 주소를 확인하지 못할 수 있습니다.
- NAT 대응 상태나 방화벽 정책 때문에 packet이 차단될 수 있습니다.
- ISP 또는 중간 routing 경로에서 packet 손실과 loop, 단절이 발생할 수 있습니다.

## 실무 맥락

문제를 확인할 때는 로컬 링크, 기본 게이트웨이, NAT/방화벽, ISP와 원격 경로를 나누어 봅니다. `ping`, routing table, neighbor table과 traceroute 계열 도구는 서로 다른 구간의 단서를 제공합니다.

## 관련 개념

DNS 질의 packet도 이와 같은 로컬 게이트웨이와 네트워크 경로를 사용합니다. 따라서 상위 루트의 `DNS → Router` 배열은 학습 Topic의 순서이며 DNS가 Router 없이 먼저 완료된다는 뜻은 아닙니다.

## 출처

- RFC 826, _An Ethernet Address Resolution Protocol_
- RFC 4861, _Neighbor Discovery for IP version 6 (IPv6)_
- RFC 3022, _Traditional IP Network Address Translator_
- RFC 4271, _A Border Gateway Protocol 4 (BGP-4)_

## 지도 참고

- NAT는 모든 경로에 필수인 단계가 아니며, 가정용 IPv4 공유기를 사용하는 일반적인 예시로 표시합니다.

## 참고 자료

- [RFC 826 — An Ethernet Address Resolution Protocol](https://www.rfc-editor.org/rfc/rfc826.html)
- [RFC 4861 — Neighbor Discovery for IPv6](https://www.rfc-editor.org/rfc/rfc4861.html)
- [RFC 3022 — Traditional IP Network Address Translator](https://www.rfc-editor.org/rfc/rfc3022.html)
- [RFC 4271 — A Border Gateway Protocol 4](https://www.rfc-editor.org/rfc/rfc4271.html)
