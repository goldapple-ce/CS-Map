# 한눈에 보기

데이터 링크 계층은 같은 Network 구간에서 인접한 장치로 Frame을 전달하는 역할을 합니다.

Ethernet과 Wi-Fi가 대표적인 기술이며, MAC 주소는 현재 구간에서 Frame을 전달할 장치를 식별하는 데 사용됩니다. Switch는 MAC 주소를 기준으로 Frame을 전달합니다.

Packet이 Router를 지나 다음 Network 구간으로 이동하면 그 구간에 맞는 새로운 Frame으로 다시 감싸질 수 있습니다.

---

# 개발자가 개입하는 지점

Application 개발자가 Frame을 직접 다룰 일은 거의 없습니다. Network를 운영한다면 Network Interface, VLAN, Switch와 MAC 주소 관련 문제를 확인할 수 있습니다.

---

# 참고 자료

- [IEEE 802.3 Ethernet](https://www.ieee802.org/3/)
- [IEEE 802.11 Wireless LAN](https://www.ieee802.org/11/)
