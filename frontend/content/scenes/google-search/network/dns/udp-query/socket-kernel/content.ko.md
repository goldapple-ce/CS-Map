# Socket과 Kernel

## 개요

Socket은 사용자 프로세스가 커널 네트워크 프로토콜을 사용하는 인터페이스입니다. Linux의 `socket(2)`는 통신 endpoint를 만들고 file descriptor를 반환하며, `SOCK_DGRAM`은 datagram 방식의 통신 의미를 선택합니다.

## 커널 경계

프로세스가 socket descriptor를 사용해 전송을 요청하면 실행은 system call 경계를 지나 커널 socket 계층으로 들어갑니다. Linux socket 계층은 사용자 프로세스와 UDP·IP 같은 프로토콜 모듈 사이에 공통 인터페이스를 제공합니다.

## 더 깊은 내용

IP 처리, 송신 큐와 network driver는 독립적인 내부 구조를 가지므로 이후 하위 장면으로 확장할 수 있습니다. 현재는 준비 중 대상으로 표시합니다.
