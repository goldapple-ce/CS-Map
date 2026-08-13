# 한눈에 보기

Network Interface는 사용자 기기를 Network에 연결하고 Data를 송수신하는 Hardware와 관련 기능입니다. Wi-Fi Adapter와 Ethernet Adapter가 대표적입니다.

OS가 만든 Network Data는 Network Interface를 통해 Frame으로 전달되며, 수신한 Data도 OS의 Network 계층으로 올라갑니다.

---

# 개발자가 개입하는 지점

Application 개발자가 Network Interface를 직접 제어하는 경우는 드뭅니다. 그럼에도 Wi-Fi 신호, Link 연결, IP 설정과 Packet 손실 상태는 Browser 요청의 속도와 성공 여부에 영향을 줍니다.

HTTP 오류만 확인하기 전에 기기가 실제 Network에 연결되어 있는지와 다른 목적지에도 통신할 수 있는지 확인하면 문제 범위를 줄일 수 있습니다.

---

# 참고 자료

- [IEEE 802.3 Ethernet Working Group](https://www.ieee802.org/3/)
- [IEEE 802.11 Wireless LAN Working Group](https://www.ieee802.org/11/)
