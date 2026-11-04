# 한눈에 보기

Network Access Layer는 같은 Network 구간에서 Frame을 전달하고, Frame의 Bit를 실제 전송 매체로 보내는 역할을 묶습니다.

Ethernet과 Wi-Fi가 대표적인 기술이며, MAC 주소는 현재 구간에서 Frame을 전달할 장치를 식별하는 데 사용됩니다. Switch는 MAC 주소를 기준으로 Frame을 전달합니다.

Packet이 Router를 지나 다음 Network 구간으로 이동하면 그 구간에 맞는 새로운 Frame으로 다시 감싸질 수 있습니다.

---

# Frame과 실제 신호

Internet Layer에서 받은 IP Packet은 현재 Link 기술에 맞는 Frame에 담깁니다. Ethernet Frame이나 Wi-Fi Frame에는 같은 구간에서 전달에 필요한 MAC 주소 등의 정보가 들어갑니다.

Frame을 구성하는 Bit는 LAN Cable의 전기 신호, 광 Fiber의 빛 또는 Wi-Fi의 무선 신호로 표현되어 실제 매체를 통과합니다. Network Access Layer는 HTTP의 의미를 해석하거나 목적지까지의 전체 Route를 정하지 않고, 현재 구간에서 데이터를 전달하는 데 집중합니다.

---

# 개발자가 개입하는 지점

Application 개발자가 Frame이나 신호를 직접 다룰 일은 거의 없습니다. Network를 운영한다면 Network Interface, VLAN, Switch, MAC 주소, Cable 연결과 Wi-Fi 신호 문제를 확인할 수 있습니다.

---

# 참고 자료

- [IEEE 802.3 Ethernet](https://www.ieee802.org/3/)
- [IEEE 802.11 Wireless LAN](https://www.ieee802.org/11/)
