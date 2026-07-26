# UDP DNS 질의

## 개요

Resolver가 만든 DNS 메시지는 UDP를 사용할 때 하나의 datagram payload로 전달됩니다. 이 장면은 DNS 메시지가 Socket API, UDP와 IP 계층을 거쳐 이름 서버의 UDP 53번 port를 향하는 흐름을 보여줍니다.

## 필요한 이유

DNS 메시지는 애플리케이션 데이터이므로 그 자체만으로 네트워크를 이동할 수 없습니다. 프로세스는 Socket API를 통해 전송을 요청하고, 커널의 UDP와 IP 처리가 목적지 port와 주소에 필요한 protocol header를 구성합니다.

## 동작 과정

1. Resolver가 DNS header와 question을 포함한 메시지를 만듭니다.
2. 프로세스가 socket을 통해 메시지 전송을 요청합니다.
3. UDP 계층이 payload를 datagram으로 처리합니다.
4. UDP datagram이 IP packet의 payload가 됩니다.
5. Packet이 network interface의 송신 경로를 거쳐 이름 서버로 전달됩니다.

## 내부 구조

RFC 768의 UDP header에는 source port, destination port, length와 checksum이 있습니다. 이 장면의 UDP는 DNS 메시지를 운반하는 맥락이며, 아래 공통 Concept 설명은 특정 애플리케이션과 무관한 UDP의 핵심 원리를 제공합니다.

## 실패 상황

- UDP datagram이나 응답이 경로에서 손실될 수 있습니다.
- Resolver의 시간 제한 안에 응답이 오지 않을 수 있습니다.
- 응답이 질의와 일치하지 않거나 처리할 수 없는 형식일 수 있습니다.
- 응답 크기와 기능 조건에 따라 다른 전송 방식으로 다시 시도해야 할 수 있습니다.

## 실무 맥락

UDP 자체에는 재전송 정책이 없으므로 DNS resolver가 시간 제한과 재시도 정책을 담당합니다. Packet capture를 볼 때는 DNS transaction 정보뿐 아니라 source/destination port, 주소와 재시도 간격을 함께 확인해야 합니다.

## 관련 개념

Socket API와 Kernel Topic을 선택하면 같은 UDP가 사용자 API가 아니라 커널 protocol 처리 단계에서 어떻게 나타나는지 볼 수 있습니다. 두 장면은 아래의 동일한 UDP Concept를 재사용합니다.

## 출처

- RFC 768, _User Datagram Protocol_
- RFC 1035, _Domain names — implementation and specification_
- Linux man-pages, _udp(7)_

## 지도 참고

- UDP는 datagram 전송을 제공하지만 전달, 중복 방지, 순서를 보장하지 않습니다.
- DNS resolver가 만든 하나의 질의 메시지를 이름 서버의 UDP 53번 port로 전달하는 전송 맥락입니다.

## 참고 자료

- [RFC 768 — User Datagram Protocol](https://www.rfc-editor.org/info/rfc768/)
- [RFC 1035 — Domain names, implementation and specification](https://www.rfc-editor.org/info/rfc1035/)
- [Linux udp(7) manual page](https://man7.org/linux/man-pages/man7/udp.7.html)
