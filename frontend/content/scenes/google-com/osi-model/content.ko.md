# 한눈에 보기

OSI 7계층은 Network 통신에 필요한 기능을 일곱 가지 역할로 나누어 이해하기 위한 **참조 모델**입니다.

요청이 `OSI 7계층`이라는 장비를 통과하거나 일곱 개의 별도 Program이 반드시 차례로 실행된다는 뜻은 아닙니다.

---

# 왜 계층을 나누나요?

통신에는 HTTP Message 작성, 데이터 표현, 연결 관리, 신뢰성 있는 전송, 다른 Network로의 Packet 전달과 실제 신호 전송처럼 서로 다른 역할이 함께 필요합니다.

이 역할을 계층으로 나누면 각 Protocol과 장비가 무엇을 담당하는지 구분하고, 통신 문제가 어느 범위에서 발생했는지 좁혀 볼 수 있습니다.

---

# 계층을 읽는 방법

위쪽 계층은 Application이 사용하는 기능에 가깝고, 아래쪽 계층은 실제 Network 전달 방식에 가깝습니다.

- 보내는 쪽에서는 위 계층의 데이터가 아래 계층으로 내려가며 필요한 Header 등이 추가됩니다.
- 받는 쪽에서는 아래 계층에서 받은 데이터를 위 계층으로 올리며 각 계층의 정보를 해석합니다.

이 과정을 각각 Encapsulation과 Decapsulation이라고 부릅니다.

---

# 실제 인터넷과 OSI 7계층

실제 인터넷은 보통 TCP/IP 모델과 Protocol을 중심으로 구현됩니다. 특히 표현 계층과 세션 계층의 기능은 별도의 계층으로 뚜렷하게 나뉘기보다 Application Protocol이나 Library에 포함되는 경우가 많습니다.

따라서 OSI 7계층은 실제 구현을 그대로 복사한 구조라기보다 HTTP, TCP, IP, Ethernet과 Router의 역할을 비교하기 위한 학습 기준으로 보는 것이 좋습니다.

---

# 개발자가 개입하는 지점

Application 개발자는 주로 응용 계층의 Protocol과 데이터 형식을 선택하고, 전송 계층의 TCP 또는 UDP 특성을 고려합니다. Network와 Infrastructure를 다룬다면 IP, Route, Ethernet과 물리 연결까지 확인할 수 있습니다.

모든 장애를 무조건 일곱 단계로 점검할 필요는 없습니다. 다만 Domain Name, Port, IP Route와 물리 연결처럼 서로 다른 문제를 같은 것으로 취급하지 않는 기준으로 활용할 수 있습니다.

---

# 참고 자료

- [ISO/IEC 7498-1 — OSI Basic Reference Model](https://www.iso.org/standard/20269.html)
- [RFC 1122 — Requirements for Internet Hosts](https://www.rfc-editor.org/rfc/rfc1122.html)
