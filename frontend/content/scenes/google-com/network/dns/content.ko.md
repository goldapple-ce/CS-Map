# DNS 이름 확인

## 개요

브라우저가 `google.com`에 접속하려면 먼저 목적지로 사용할 주소 정보를 얻어야 합니다. 브라우저와 운영체제의 캐시만으로 해결되지 않으면 보통 로컬 설정에 지정된 재귀 DNS Resolver가 여러 이름 서버의 응답과 referral을 따라 결과를 찾습니다.

## 필요한 이유

사람이 사용하는 도메인 이름과 IP 네트워크가 전달에 사용하는 주소는 역할이 다릅니다. DNS는 계층적인 이름 공간과 resource record를 여러 권한 영역에 나누어 관리하고, Resolver가 필요한 정보를 찾아 애플리케이션에 돌려줄 수 있게 합니다.

## 동작 과정

1. 브라우저와 운영체제가 유효한 DNS 캐시를 확인합니다.
2. 캐시로 해결되지 않으면 로컬 설정의 재귀 Resolver에 `google.com`의 주소 정보를 요청합니다.
3. Resolver에 답이 없으면 DNS 질의를 전송합니다. 이 지도에서는 일반적인 UDP 질의 경로를 확대할 수 있습니다.
4. Root DNS는 Google의 IP를 직접 반환하는 대신 `.com` TLD DNS를 찾을 수 있는 referral을 제공합니다.
5. `.com` TLD DNS는 `google.com`을 담당하는 권한 DNS를 찾을 수 있는 referral을 제공합니다.
6. 권한 DNS의 답을 바탕으로 Resolver가 주소 결과를 클라이언트에 반환하고 캐시할 수 있습니다.

## 내부 구조

사용자 프로그램이 Root, TLD와 권한 DNS를 직접 차례대로 호출하는 구조로 이해하면 안 됩니다. 일반적으로 클라이언트는 재귀 Resolver에 최종 답을 요청하고, Resolver가 캐시와 여러 이름 서버의 referral을 처리합니다. 실제 응답에는 CNAME 같은 별칭이 포함되어 추가 확인이 필요할 수도 있습니다.

## 실패 상황

- 캐시된 결과가 만료되었거나 이름이 존재하지 않을 수 있습니다.
- Resolver 또는 이름 서버의 응답이 시간 안에 도착하지 않을 수 있습니다.
- referral이나 권한 DNS 설정이 잘못되어 최종 답을 얻지 못할 수 있습니다.
- UDP 응답이 잘리거나 전송 조건이 달라 TCP 등 다른 방식이 필요할 수 있습니다.

## 실무 맥락

장애를 조사할 때는 브라우저/OS 캐시, 사용 중인 재귀 Resolver, referral과 권한 응답을 구분해야 합니다. Root DNS에서 최종 IP가 보이지 않는 것은 정상적인 위임 과정일 수 있습니다.

## 관련 개념

`DNS 질의 전송` Topic을 클릭하면 DNS 메시지가 UDP datagram과 IP packet이 되어 Socket/Kernel 경로를 지나는 과정을 이어서 볼 수 있습니다. DNS가 항상 UDP만 사용하는 것은 아닙니다.

## 출처

- RFC 1034, _Domain Names — Concepts and Facilities_
- RFC 1035, _Domain Names — Implementation and Specification_
- RFC 8499, _DNS Terminology_

## 지도 참고

- Root와 .com TLD DNS는 보통 최종 IP가 아니라 다음으로 질의할 권한 DNS의 위치를 안내합니다.

## 참고 자료

- [RFC 1034 — Domain Names, Concepts and Facilities](https://www.rfc-editor.org/rfc/rfc1034.html)
- [RFC 1035 — Domain Names, Implementation and Specification](https://www.rfc-editor.org/rfc/rfc1035.html)
- [RFC 8499 — DNS Terminology](https://www.rfc-editor.org/rfc/rfc8499.html)
