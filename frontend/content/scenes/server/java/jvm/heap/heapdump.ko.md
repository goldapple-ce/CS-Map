# 한눈에 보기

Heap Dump는 특정 시점에 Heap에 존재하는 객체와 객체 사이의 Reference 관계를 기록한 자료입니다. Memory Leak이나 예상보다 오래 살아 있는 객체를 분석할 때 사용합니다.

---

# 무엇을 확인할 수 있을까

Heap Dump에서는 다음 내용을 확인할 수 있습니다.

- 어떤 Class의 객체가 많이 존재하는지
- 어떤 객체가 Memory를 많이 차지하는지
- 어떤 객체가 계속 증가하거나 예상보다 오래 살아 있는지
- 어떤 Reference가 그 객체를 계속 Reachable하게 만드는지

객체 수나 크기만 보는 것으로는 Leak의 원인을 확정할 수 없습니다. 중요한 것은 객체가 왜 GC Root에서 계속 도달 가능한지 확인하는 것입니다.

---

# Shallow Size와 Retained Size

Shallow Size는 객체 하나가 자기 자신만으로 차지하는 Memory 크기입니다. 그 객체가 Reference하는 다른 객체의 크기는 포함하지 않습니다.

Retained Size는 특정 객체가 더 이상 Reachable하지 않게 되었을 때 함께 회수될 수 있는 객체들의 Memory까지 포함한 크기입니다. 작은 Cache 객체가 많은 객체를 붙잡고 있다면 Shallow Size는 작아도 Retained Size는 매우 클 수 있습니다.

Memory Leak 분석에서는 단순히 큰 객체보다 Retained Size가 큰 객체가 왜 계속 Reachable한지 확인하는 것이 중요합니다.

---

# Dominator Tree와 GC Root 경로

Dominator Tree는 어떤 객체가 다른 객체들의 생존을 지배하고 있는지 찾는 데 도움을 줍니다. 작은 객체 하나가 큰 객체 Graph를 붙잡는 경우에도 원인 후보를 좁힐 수 있습니다.

Leak이 의심되는 객체를 찾았다면 GC Root까지의 Reference Path를 확인합니다. 예를 들어 Static Collection이 User, Order와 Item을 차례로 붙잡고 있다면 개별 객체 수보다 Collection에 남은 Reference가 근본 원인일 수 있습니다.

크기 제한이나 만료 정책이 없는 Cache, 제거되지 않은 Listener, 정리되지 않은 `ThreadLocal`과 종료되지 않은 Thread가 유지하는 Reference 등이 원인이 될 수 있습니다.

---

# 운영 환경에서 확인하는 순서

1. Heap 사용량이 GC 이후에도 계속 높은 수준으로 남는지 추세를 확인합니다.
2. GC Log, JFR과 `jstat` 등으로 Allocation Rate, GC 빈도, 회수량, Pause와 Old 영역 증가를 확인합니다.
3. 가능하면 Heap 사용량이 낮은 시점과 높아진 시점의 Dump를 확보해 비교합니다.
4. 계속 증가하는 Class와 Instance를 찾고 Shallow Size, Retained Size와 Dominator Tree를 확인합니다.
5. 의심 객체에서 GC Root까지의 Reference Path를 따라가 누가 객체를 붙잡고 있는지 찾습니다.
6. 원인이 되는 Reference나 객체의 생명주기를 수정합니다.

Heap 사용량이 증가한다는 사실만으로 Memory Leak이라고 단정하면 안 됩니다. 객체 생성 속도가 높아 일시적으로 증가할 수도 있으므로 GC 이후에도 회수되지 않는 기준선이 계속 높아지는지 먼저 확인합니다.

---

# 수정 후 재검증

Code를 수정한 뒤에도 같은 방법으로 Heap 사용량과 GC 이후 기준선, Old Generation 증가 추세를 다시 확인합니다. 필요하면 Heap Dump를 다시 수집해 수정 전과 비교합니다.

실제 지표가 안정되어야 Memory Leak이 해결됐다고 판단할 수 있습니다.

---

# 참고 자료

- [Oracle Java — Diagnostic Tools](https://docs.oracle.com/en/java/javase/21/troubleshoot/diagnostic-tools.html)
- [Oracle Java — jcmd](https://docs.oracle.com/en/java/javase/21/docs/specs/man/jcmd.html)
- [Eclipse Memory Analyzer — Concepts](https://help.eclipse.org/latest/topic/org.eclipse.mat.ui.help/concepts/basicheaptutorial.html)
