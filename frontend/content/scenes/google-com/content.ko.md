# google.com에 접속하는 전체 흐름

## 개요

사용자가 브라우저 주소창에 `google.com`을 입력하면 브라우저는 먼저 목적지의 IP 주소를 알아내고, 네트워크 경로를 통해 원격 서버와 통신을 준비합니다. 이 루트 Scene은 그 과정에서 학습할 큰 영역을 사용자/브라우저, DNS, Router, Server로 나누어 보여줍니다.

> 이 지도는 공개적으로 확인된 인터넷 표준과 학습용 일반 웹 서비스 구조를 구분합니다. Google 내부 서버의 실제 배치나 비공개 구현을 단정하지 않습니다.

## 필요한 이유

주소 하나에 접속하는 과정에도 이름 확인, 로컬 네트워크, 인터넷 라우팅, 보안 연결과 서버 처리가 함께 관여합니다. 전체 흐름을 먼저 보면 DNS, Router, TLS, Proxy, Application Server와 Database가 어느 맥락에서 연결되는지 이해할 수 있습니다.

## 동작 과정

1. 사용자가 브라우저 주소창에 `google.com`을 입력합니다.
2. 브라우저와 운영체제가 DNS를 이용해 목적지 주소를 확인합니다.
3. 패킷이 기본 게이트웨이와 여러 네트워크 경로를 거쳐 목적지로 이동합니다.
4. 원격 서버와 보안 연결을 수립하고 요청을 전달할 준비를 합니다.

화면의 `DNS → Router` 순서는 학습 Topic을 왼쪽에서 오른쪽으로 배열한 것입니다. 실제 DNS 질의 패킷도 Router와 네트워크를 사용하므로 모든 패킷의 완전한 시간 순서를 뜻하지 않습니다.

## 내부 구조

사용자/브라우저, DNS, Router, Server는 각각 별도의 내부 Scene으로 확장됩니다. 하위 Scene이 없는 Topic도 선택할 수 있으며, 별도 설명이 없으면 Explanation Panel에서 이를 알려줍니다.

## 실패 상황

- 주소가 잘못되었거나 DNS에서 이름을 확인하지 못할 수 있습니다.
- 로컬 네트워크, 기본 게이트웨이 또는 인터넷 경로에 문제가 생길 수 있습니다.
- 서버 인증서를 신뢰할 수 없거나 안전한 연결 협상에 실패할 수 있습니다.
- 목적지 서버에 연결할 수 없거나 서버가 요청을 처리하지 못할 수 있습니다.

## 실무 맥락

문제를 조사할 때는 주소 입력부터 서버 도달까지를 하나의 실패 지점으로 취급하지 않습니다. DNS 응답, 기본 게이트웨이, 라우팅 경로, TLS 연결과 서버 응답을 계층별로 나누어 관찰해야 원인을 좁힐 수 있습니다.

## 관련 개념

DNS 내부에서는 재귀 Resolver와 권한 DNS의 관계를, Router 내부에서는 게이트웨이와 인터넷 라우팅을 탐색할 수 있습니다. Server 내부의 NGINX, Spring, SQL/NoSQL은 특정 Google 내부 구조가 아니라 학습을 위한 일반적인 구성 예시로 다룹니다.

## 출처

- RFC 1034, _Domain Names — Concepts and Facilities_
- RFC 8446, _The Transport Layer Security (TLS) Protocol Version 1.3_

## 참고 자료

- [RFC 1034 — Domain Names, Concepts and Facilities](https://www.rfc-editor.org/rfc/rfc1034.html)
- [RFC 8446 — The Transport Layer Security Protocol Version 1.3](https://www.rfc-editor.org/rfc/rfc8446.html)
