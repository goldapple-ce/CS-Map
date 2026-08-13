# 한눈에 보기

Memory는 실행 중인 Program의 명령과 데이터를 CPU가 빠르게 사용할 수 있도록 보관하는 Hardware입니다. 여기서는 주로 RAM을 뜻합니다.

Browser를 실행하면 필요한 Code와 Tab의 Data가 Memory에 올라옵니다. Tab과 Extension을 많이 열거나 큰 Data를 처리하면 Browser의 Memory 사용량이 증가할 수 있습니다.

---

# 개발자가 개입하는 지점

개발자는 Browser 개발자 도구와 profiler로 JavaScript 객체, DOM node와 resource가 불필요하게 계속 유지되는지 확인할 수 있습니다.

사용 가능한 Memory가 부족하면 OS가 Storage를 보조 공간으로 사용하거나 process를 종료할 수 있어 전체 응답성이 크게 떨어질 수 있습니다.

---

# 참고 자료

- [MDN — Memory Management](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Memory_management)
