# 한눈에 보기

CPU(Central Processing Unit)는 Program의 명령을 읽고 계산과 제어 작업을 수행하는 Hardware입니다.

Browser의 JavaScript 실행, HTML·CSS 처리, 암복호화와 화면 구성에 필요한 계산도 결국 CPU에서 실행됩니다. 실제 Browser는 여러 process와 Thread를 사용할 수 있고, OS가 이 작업들에 CPU 실행 시간을 배분합니다.

---

# 개발자가 개입하는 지점

개발자가 CPU 명령을 직접 작성하는 경우는 드뭅니다. 대신 profiler와 Browser 개발자 도구로 오래 실행되는 JavaScript, 과도한 rendering과 반복 계산을 찾아 줄일 수 있습니다.

CPU 사용률이 높다는 사실만으로 CPU 성능이 부족하다고 단정하지 않고 어떤 process와 작업이 시간을 사용하는지 확인해야 합니다.

---

# 참고 자료

- [Intel — CPU Basics](https://www.intel.com/content/www/us/en/products/docs/processors/what-is-a-cpu.html)
