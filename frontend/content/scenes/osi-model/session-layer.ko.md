# 한눈에 보기

세션 계층은 통신하는 두 대상 사이의 대화를 시작하고 유지하며 끝내는 역할을 설명하는 계층입니다.

실제 TCP/IP 기반 Application에서는 이 기능이 독립된 계층으로 분리되지 않고 Application Protocol이나 Library 내부에 포함되는 경우가 많습니다.

여기서 말하는 Session은 로그인 정보를 보관하는 HTTP Session과 정확히 같은 개념은 아닙니다. HTTP Session은 Application이 상태를 관리하기 위해 만든 구체적인 기능입니다.

---

# 개발자가 개입하는 지점

Application 개발자는 연결을 언제 시작하고 종료할지, 연결이 끊겼을 때 다시 연결할지와 대화 상태를 어떻게 유지할지 설계할 수 있습니다.

---

# 참고 자료

- [ISO/IEC 7498-1 — OSI Basic Reference Model](https://www.iso.org/standard/20269.html)
