# 사용자, 브라우저와 Server

## 개요

Server는 실제 접속 전에 CA 계층을 통해 인증서를 서명·발급받습니다. 이후 사용자가 브라우저에 `google.com`을 입력하고 목적지까지의 네트워크 경로가 준비되면 브라우저는 HTTPS 통신을 위한 TLS handshake를 진행합니다. Server 인증과 handshake가 완료된 뒤 브라우저가 암호화된 HTTP 요청을 보내고 Server가 HTTP 응답을 반환합니다.

## 필요한 이유

암호화만으로는 현재 연결한 상대가 사용자가 요청한 `google.com`인지 알 수 없습니다. 브라우저는 로컬 신뢰 저장소의 CA 신뢰 기준을 사용해 Server가 제공한 인증서 체인, 요청한 도메인과 유효기간 등을 검증합니다.

## 동작 과정

1. 사용자가 브라우저 주소창에 `google.com`을 입력합니다.
2. 브라우저가 지원하는 TLS 조건과 연결 정보를 담은 `ClientHello`를 Server로 보냅니다.
3. Server가 선택한 연결 조건과 인증서 체인을 브라우저에 제공합니다.
4. 브라우저가 로컬 CA 신뢰 기준을 사용해 인증서 체인, 서비스 이름과 유효기간을 검증합니다.
5. TLS handshake가 완료되면 브라우저가 암호화된 HTTP 요청을 Server에 보냅니다.
6. Server가 처리 결과를 HTTP 응답으로 브라우저에 반환합니다.

## 내부 구조

CA는 접속할 때마다 브라우저가 직접 요청을 보내는 대상으로 표현하지 않습니다. Server 인증서는 접속 전에 CA 계층에서 발급·서명되며, 브라우저는 자신의 신뢰 저장소를 기준으로 전달받은 인증서 체인을 검증합니다. 화면에서 CA가 브라우저와 Server로 보내는 점선 화살표는 이 두 사전 관계를 뜻합니다.

## 실패 상황

- 인증서 체인을 신뢰할 수 있는 root 인증서까지 연결하지 못할 수 있습니다.
- 인증서의 도메인 이름이 사용자가 요청한 호스트와 일치하지 않을 수 있습니다.
- 인증서가 아직 유효하지 않거나 만료되었을 수 있습니다.
- 클라이언트와 Server가 공통으로 사용할 수 있는 TLS 조건을 협상하지 못할 수 있습니다.
- TLS 인증 이후 HTTP 요청 전송이나 Server 응답이 실패할 수 있습니다.

## 실무 맥락

브라우저의 인증서 오류는 단순한 Server 연결 실패와 구분해야 합니다. 인증서 체인 구성, 중간 인증서 누락, 호스트 이름과 유효기간을 각각 확인하면 원인을 좁힐 수 있습니다.

## 관련 개념

DNS 질의와 Router 경로는 상위 Scene의 별도 Topic에서 다룹니다. HTTP 응답 이후의 HTML/CSS 처리와 브라우저 렌더링은 현재 범위에서 제외합니다.

## 출처

- RFC 8446, _The Transport Layer Security (TLS) Protocol Version 1.3_
- RFC 5280, _Internet X.509 Public Key Infrastructure Certificate and CRL Profile_
- RFC 9525, _Service Identity in TLS_

## 지도 참고

- CA는 접속 때마다 호출되는 서버가 아니라 브라우저가 인증서 체인을 검증할 때 사용하는 사전 신뢰 체계입니다.

## 참고 자료

- [RFC 8446 — The Transport Layer Security Protocol Version 1.3](https://www.rfc-editor.org/rfc/rfc8446.html)
- [RFC 5280 — Internet X.509 Public Key Infrastructure Certificate and CRL Profile](https://www.rfc-editor.org/rfc/rfc5280.html)
- [RFC 9525 — Service Identity in TLS](https://www.rfc-editor.org/rfc/rfc9525.html)
