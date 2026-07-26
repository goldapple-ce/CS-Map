# Socket과 Kernel

## 개요

Socket은 사용자 프로세스가 커널 네트워크 프로토콜을 사용하는 인터페이스입니다. Linux의 `socket(2)`는 통신 endpoint를 만들고 file descriptor를 반환하며, `SOCK_DGRAM`은 datagram 방식의 통신 의미를 선택합니다.

## 필요한 이유

사용자 프로세스가 network driver나 protocol 상태를 직접 제어하면 운영체제가 자원, 권한과 동시 실행을 일관되게 관리하기 어렵습니다. Socket API와 system call 경계는 애플리케이션 요청을 커널이 관리하는 네트워크 기능으로 전달하는 공통 인터페이스를 제공합니다.

## 동작 과정

1. Resolver 코드가 socket file descriptor를 사용합니다.
2. 전송 API 호출이 system call 경계를 통과합니다.
3. Kernel socket 계층이 요청과 socket 상태를 확인합니다.
4. UDP 계층이 payload를 datagram으로 처리합니다.
5. IP 계층과 network driver 방향으로 송신 처리가 이어집니다.

## 내부 구조

Linux socket 계층은 사용자 프로세스와 UDP·IP 같은 protocol 구현 사이의 공통 인터페이스를 제공합니다. 이 장면에서 UDP는 DNS라는 애플리케이션 의미보다 커널 내부의 datagram 처리 단계에 초점을 둡니다.

## 실패 상황

- 잘못된 file descriptor나 인자로 system call이 실패할 수 있습니다.
- Socket buffer나 시스템 자원이 부족할 수 있습니다.
- Routing 정보가 없거나 network interface가 사용할 수 없는 상태일 수 있습니다.
- 비동기적으로 보고되는 네트워크 오류는 전송 호출 시점과 다른 시점에 관찰될 수 있습니다.

## 실무 맥락

애플리케이션 로그의 전송 오류만으로 packet이 어느 계층까지 진행했는지 알 수 없는 경우가 있습니다. System call 반환값, socket 상태, kernel network 통계와 packet capture를 함께 관찰하면 사용자 공간과 커널 공간 사이에서 원인을 좁힐 수 있습니다.

## 관련 개념

IP 처리, 송신 queue와 Network Driver는 현재 흐름의 말단 Topic입니다. 각 Topic은 선택할 수 있고, 아직 별도 설명이 없으면 Explanation Panel에서 이를 알려줍니다. 아래 UDP Concept는 상위 UDP DNS 질의 장면과 동일한 공통 설명이며, 현재 패널에는 Kernel 처리라는 별도 맥락이 결합됩니다.

## 출처

- Linux man-pages, _socket(2)_
- Linux man-pages, _socket(7)_
- Linux man-pages, _udp(7)_

## 지도 참고

- Linux socket 계층은 사용자 프로세스와 커널 네트워크 프로토콜 스택 사이의 공통 인터페이스를 제공합니다.
- 사용자 프로세스가 넘긴 payload를 커널 UDP 계층이 datagram으로 구성해 IP 계층에 전달하는 처리 맥락입니다.

## 참고 자료

- [Linux socket(2) manual page](https://man7.org/linux/man-pages/man2/socket.2.html)
- [Linux socket(7) manual page](https://man7.org/linux/man-pages/man7/socket.7.html)
- [Linux udp(7) manual page](https://man7.org/linux/man-pages/man7/udp.7.html)
