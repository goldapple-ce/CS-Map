# 한눈에 보기

OS(Operating System)는 Application과 Hardware 사이에서 process, CPU 실행 시간, memory, file과 network 자원을 관리하는 System Software입니다.

Browser는 OS 위에서 하나 이상의 process로 실행되며, OS가 제공하는 API를 통해 file과 network 기능을 사용합니다.

---

# 개발자가 개입하는 지점

일반적인 Web 개발자가 OS Scheduler나 Device Driver를 직접 구현하지는 않습니다. 하지만 process의 CPU·Memory 사용량, file 권한, network 설정과 OS별 동작 차이를 확인할 수 있습니다.

OS를 알면 Browser가 느릴 때 Application Code, CPU 부족, memory 압박과 Network 문제를 구분하는 데 도움이 됩니다.

---

# 참고 자료

- [POSIX.1-2024](https://pubs.opengroup.org/onlinepubs/9799919799/)
