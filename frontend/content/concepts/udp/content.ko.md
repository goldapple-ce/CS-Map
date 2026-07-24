# UDP 공통 원리

## 개요

UDP(User Datagram Protocol)는 애플리케이션이 독립적인 datagram을 IP 위로 보내도록 하는 전송 계층 프로토콜입니다. 통신 전에 연결 수립 절차를 수행하지 않으며, 각 datagram은 별개의 메시지로 취급됩니다.

## 제공하는 정보

UDP 헤더는 source port, destination port, length, checksum으로 구성됩니다. Port는 호스트 안의 통신 endpoint를 구분하고 length는 UDP header와 payload의 전체 길이를 나타냅니다.

## 제공하지 않는 보장

UDP 자체는 전달 성공, 중복 제거, 순서 유지, 혼잡 제어를 보장하지 않습니다. 필요하다면 재전송, 순서 관리와 시간 제한 같은 정책을 애플리케이션 프로토콜이 설계해야 합니다.

## 맥락에 따라 달라지는 부분

DNS 질의에서는 UDP가 DNS 메시지를 운반하는 수단으로 사용됩니다. Kernel 장면에서는 같은 UDP가 socket에서 받은 payload에 header를 붙이고 IP 계층으로 전달하는 프로토콜 처리 단계로 나타납니다. 이 차이는 UDP의 공통 원리가 아니라 UDP가 사용되는 위치의 차이입니다.

## 출처

- RFC 768, _User Datagram Protocol_
- Linux man-pages, _udp(7)_
