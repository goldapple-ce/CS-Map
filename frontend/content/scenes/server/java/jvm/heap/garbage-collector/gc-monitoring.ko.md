# 한눈에 보기

GC Monitoring은 GC가 언제, 얼마나 오래, 어느 범위를 수집했고 Memory를 얼마나 회수했는지 확인하는 과정입니다.

---

# 함께 볼 정보

GC Log, Java Flight Recorder와 운영 지표에서 다음을 함께 확인합니다.

- GC 발생 빈도와 pause 시간
- GC 전후 Heap 사용량과 회수량
- 객체 생성 속도인 Allocation Rate
- Promotion과 Old 영역의 증가 추세
- GC에 사용되는 CPU와 Application 응답 시간

GC가 자주 발생해도 매번 짧고 충분한 Memory를 회수한다면 반드시 문제는 아닙니다. 반대로 GC 후에도 Old 사용량의 기준선이 계속 오르거나 긴 pause가 반복되면 오래 살아 있는 객체, 과도한 Allocation, 부족한 Heap 크기 등을 구분해 확인해야 합니다.

GC Monitoring은 시간에 따른 동작과 수치를 관찰합니다. Heap Dump는 특정 시점에 어떤 객체가 Memory를 점유하고 어떤 Reference가 붙잡고 있는지 분석하므로 역할이 다릅니다.

---

# 참고 자료

- [Oracle Java Flight Recorder Runtime Guide](https://docs.oracle.com/en/java/javase/21/jfapi/flight-recorder-runtime-guide.html)
- [Oracle Java 21 Garbage Collection Tuning Guide](https://docs.oracle.com/en/java/javase/21/gctuning/)
