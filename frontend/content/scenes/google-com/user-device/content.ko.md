# 한눈에 보기

사용자 기기는 Browser 같은 Application이 실제로 실행되는 Client 쪽 Computer입니다. Desktop, Notebook, Smartphone과 Tablet 등이 사용자 기기가 될 수 있습니다.

```text
Browser 같은 Application
          ↓
          OS
          ↓
CPU · Memory · Storage · Network Interface
```

Application이 CPU나 Network Interface를 매번 직접 제어하지는 않습니다. 일반적으로 OS가 Hardware를 관리하고 Application에 process, memory, file과 network 기능을 제공합니다.

---

# 구성 요소

- `OS`: Application의 실행과 Hardware 자원을 관리합니다.
- `CPU`: 명령을 실행하고 계산을 수행합니다.
- `Memory`: 실행 중인 Program의 명령과 데이터를 빠르게 보관합니다.
- `Storage`: Program과 File을 전원이 꺼진 뒤에도 보관합니다.
- `Network Interface`: Wi-Fi나 Ethernet 등을 이용해 Frame과 Packet을 송수신합니다.

---

# Web 접속에서 함께 하는 일

1. Storage에 설치된 Browser가 실행됩니다.
2. Browser Code와 필요한 Data가 Memory에 올라옵니다.
3. CPU가 Browser와 OS의 명령을 실행합니다.
4. OS가 DNS 조회와 Socket 통신을 위한 Network 기능을 제공합니다.
5. Network Interface가 공유기나 연결된 Network로 Data를 송수신합니다.

실제 Computer 내부 연결은 이보다 복잡합니다. 이 Scene은 Browser가 추상적인 Software로만 존재하는 것이 아니라 OS와 Hardware 자원을 사용해 동작한다는 큰 구조를 보여줍니다.

---

# 개발자가 개입하는 지점

일반적인 Web 개발자가 CPU와 Memory를 직접 제어하지는 않지만 Application의 CPU 사용률, Memory 사용량, Storage I/O와 Network 상태를 관찰할 수 있습니다.

성능 문제가 생기면 Code만 확인하지 않고 CPU가 포화됐는지, Memory가 부족한지, Storage나 Network I/O가 지연되는지도 구분해야 합니다.

---

# 참고 자료

- [MDN — How the Web works](https://developer.mozilla.org/en-US/docs/Learn_web_development/Getting_started/Web_standards/How_the_web_works)
