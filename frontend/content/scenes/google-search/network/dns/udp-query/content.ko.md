# UDP DNS 질의

## 개요

resolver가 만든 DNS 메시지는 UDP를 사용할 때 하나의 datagram payload로 전달됩니다. RFC 768의 UDP 헤더에는 source port, destination port, length와 checksum이 들어갑니다.

## 보장 범위

UDP 자체는 전달, 중복 방지와 순서를 보장하지 않습니다. RFC 1035는 UDP DNS 질의가 손실될 수 있으므로 resolver에 재전송 전략이 필요하다고 설명합니다.

## 다음 장면

Socket API와 Kernel을 선택하면 사용자 프로세스의 전송 요청이 커널 네트워크 스택으로 넘어가는 경계를 볼 수 있습니다.
