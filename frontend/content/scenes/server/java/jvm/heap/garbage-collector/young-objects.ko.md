# 한눈에 보기

Young Objects는 최근 생성되어 Young Generation에 있는 객체입니다.

---

# Young GC의 대상

많은 객체는 생성 후 빠르게 사용되지 않으므로 Young 영역은 비교적 자주 수집됩니다. Young GC는 도달할 수 없는 Young 객체의 공간을 회수하고, 살아 있는 객체를 Survivor나 Old 영역으로 옮길 수 있습니다. 객체가 짧게 살 것이라고 미리 확정하는 것은 아닙니다. 여러 번의 수집 결과에 따라 오래 살아남은 객체가 구분됩니다.

Young 객체가 살아 있는지는 Young 영역 내부 Reference만으로 결정되지 않습니다. GC Root나 Old 객체에서 도달할 수 있다면 살아 있는 객체로 다뤄야 합니다. Young GC는 Card Table이나 Remembered Set에 기록된 세대 간 Reference 정보도 확인할 수 있습니다.

---

# Stop-The-World와 Safepoint

수집 중 객체를 옮기고 Reference를 고치는 구간에서는 보통 Application Thread가 일시 정지합니다. 이를 Stop-The-World라고 합니다.

JVM은 Thread의 실행 상태와 Reference 위치를 안전하게 파악할 수 있는 Safepoint에서 Thread를 멈출 수 있습니다. Safepoint는 안전하게 멈출 수 있는 지점이고, Stop-The-World는 Application Thread들이 실제로 멈춰 있는 상태입니다.

Young GC는 수집 범위가 작고 살아 있는 객체가 적다면 대체로 빨리 끝나지만, pause 길이는 객체 생존량과 Collector 동작에 따라 달라집니다.

---

# 참고 자료

- [Oracle Java 21 Generations](https://docs.oracle.com/en/java/javase/21/gctuning/generations.html)
