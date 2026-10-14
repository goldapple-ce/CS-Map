# Remark란?

Remark는 Concurrent Marking이 끝나갈 때 `STW 상태에서 남은 Reference 탐색을 마무리하고 Marking 결과를 확정하는 단계`입니다.
CMS와 G1 모두 Concurrent Marking 중 Application Thread가 Reference를 변경할 수 있으므로, 변경 사항을 추적하는 알고리즘을 사용합니다.
CMS는 Incremental Update를, G1은 SATB를 사용하며, Remark에서는 각 알고리즘이 기록한 정보 중 아직 처리되지 않은 작업을 마무리합니다.

---

# 왜 STW가 필요할까?

Concurrent Marking은 Application Thread와 동시에 실행되므로 GC가 Reference를 탐색하는 도중에도 새로운 변경이 발생할 수 있습니다.
예를 들어 GC가 변경된 Reference를 모두 검사했다고 판단한 직후, Application Thread가 다시 Reference를 변경할 수도 있습니다. 따라서 Concurrent Marking만으로는 모든 탐색이 완료되었다고 확정하기 어렵습니다.
Remark에서는 Application Thread를 중단하여 새로운 Reference 변경을 막고, 남아 있는 탐색 작업을 처리합니다.
즉, `Concurrent Marking에서 대부분의 탐색을 수행하고, Remark에서 남은 작업을 마무리하는 것`입니다.

---

# CMS에서는 어떻게 동작할까?

CMS는 Incremental Update를 사용하여 Concurrent Marking 도중 변경된 Reference를 추적합니다.
Barrier를 통해 변경된 Card를 기록하고, Concurrent Preclean에서 가능한 변경 사항을 미리 처리합니다. 하지만 Concurrent Preclean 역시 Application Thread와 동시에 실행되므로 처리하지 못한 변경 정보가 남을 수 있습니다.
CMS의 Remark는 STW 상태에서 다음 작업을 수행합니다.

1. `변경 정보 확인`: Card Table과 Mod Union Table에서 아직 검사해야 할 Card를 확인합니다.
2. `Reference 재탐색`: 변경된 Card에 포함된 Mark된 Object의 Reference를 다시 검사합니다.
3. `Root 재탐색`: GC Roots와 Young Generation에서 Old Generation으로 이어지는 Reference 등도 다시 확인합니다.
4. `Marking 완료`: 새롭게 발견한 Object까지 탐색하여 Marking을 마무리합니다.

여기서 중요한 점은 `Remark가 Old Generation 전체를 처음부터 다시 탐색하는 것은 아니라는 것`입니다. 이전 Marking 결과를 바탕으로 변경되었거나 추가 확인이 필요한 영역을 탐색합니다.
따라서 Concurrent Preclean에서 많은 변경 사항을 처리했다면 Remark에서 수행할 작업을 줄일 수 있습니다.

---

# G1에서는 어떻게 동작할까?

G1은 SATB를 사용하여 Concurrent Marking 도중 Reference가 변경되기 전의 값을 기록합니다.
Pre-write Barrier가 기존 Reference를 SATB Buffer에 저장하며, GC는 Concurrent Marking 중에도 이 정보를 처리할 수 있습니다. 하지만 아직 처리되지 않은 SATB 기록이 남을 수 있습니다.
G1의 Remark는 STW 상태에서 다음 작업을 수행합니다.

1. `SATB 기록 확인`: 아직 처리되지 않은 SATB Buffer와 Queue의 기록을 확인합니다.
2. `Reference 탐색`: 기록된 Reference가 가리키는 Object를 확인하고, 필요한 Marking 작업을 이어갑니다.
3. `Marking 완료`: 남은 탐색을 끝내고 생존 Object에 대한 Marking 결과를 확정합니다.

G1은 이 과정에서 Reference Processing과 Class Unloading 등의 작업도 수행합니다.
CMS가 `변경된 Card를 다시 탐색`하는 방식이라면, G1은 `SATB에 보존된 기존 Reference를 처리`한다는 차이가 있습니다.

---

# 참고 자료

- [Oracle — Getting Started with G1 GC](https://www.oracle.com/technetwork/tutorials-1876574.html)
- [OpenJDK — CMS 구현](https://cr.openjdk.org/~stefank/8200729/prototype/webrev.01/src/hotspot/share/gc/cms/concurrentMarkSweepGeneration.cpp.html)
- [Oracle — G1 Garbage Collector](https://docs.oracle.com/en/java/javase/25/gctuning/garbage-first-g1-garbage-collector1.html)
