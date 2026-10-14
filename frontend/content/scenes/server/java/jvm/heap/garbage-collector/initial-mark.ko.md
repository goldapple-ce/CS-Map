# 한눈에 보기

Initial Mark는 Concurrent Marking을 시작하기 위해 GC Roots를 기준으로 초기 Mark를 수행하는 단계입니다.
GC Roots의 Reference가 변경되지 않도록 STW 상태에서 진행하며, 전체 Object Graph 탐색은 이후 단계에서 수행합니다.
G1 GC에서는 Young GC와 함께 Initial Mark를 수행해 별도의 STW 시간을 줄입니다.

---

# Initial Mark란?

Concurrent Marking을 시작하기 위해 GC Roots를 기준으로 초기 Mark를 수행하는 단계입니다.
`Stop-The-World(STW)` 상태에서 진행되며, GC Roots에서 직접 도달할 수 있는 Object를 식별합니다.

# Initial Mark는 왜 STW로 진행하나요?

GC Roots에는 Thread의 Stack에 저장된 Reference 등 Application 실행에 따라 달라질 수 있는 정보가 포함됩니다.
Application Thread가 계속 실행된다면 다음과 같은 변화가 발생할 수 있습니다.

- 메서드 실행에 따라 Stack Frame이 생성되거나 제거됩니다.
- Local Variable이 참조하는 Object가 변경됩니다.
- 새로운 Object가 생성되거나 기존 Reference가 사라집니다.

따라서 GC는 STW를 통해 Application Thread를 멈추고, 안정적인 상태에서 초기 Mark 작업을 수행합니다.

---

## G1 GC에서는 어떻게 동작하나요?

G1 GC에서는 Initial Mark를 별도의 GC Pause로 수행하는 대신 `일반적인 Young GC와 함께 수행`합니다.
또한 Initial Mark 이후 `Root Region Scanning`이라는 단계가 존재합니다.
이 단계에서는 Survivor Region에 남아 있는 Object들이 Old Generation의 어떤 Object를 참조하는지 탐색합니다.

이 작업을 Initial Mark의 STW 구간에서 모두 처리하지 않고 Application과 동시에 수행해 Pause를 줄입니다.

따라서 G1 GC의 실제 과정은 단순히 Initial Mark 이후 곧바로 Concurrent Mark로 넘어가는 것보다 조금 더 복잡합니다.

---

# 참고 자료

- [Oracle Java 21 Garbage-First Garbage Collector](https://docs.oracle.com/en/java/javase/21/gctuning/garbage-first-garbage-collector.html)
