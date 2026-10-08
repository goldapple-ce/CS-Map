# 한눈에 보기

Sweep, Compact, Copy는 Mark 결과를 바탕으로 사용하지 않는 Memory를 다시 확보하는 서로 다른 작업입니다.

---

# Sweep

Sweep는 살아 있지 않은 객체가 사용하던 공간을 이후 Allocation에 다시 쓸 수 있게 만듭니다. 객체를 하나씩 삭제하는 것보다, 수집 대상이 차지하던 Memory를 빈 공간으로 돌려놓는 작업에 가깝습니다.

Sweep 뒤에는 살아 있는 객체 사이사이에 작은 빈 공간이 남을 수 있습니다. 전체 여유 공간은 충분해도 큰 객체가 들어갈 연속된 공간을 구하기 어려워지는 현상을 Memory Fragmentation이라고 합니다.

---

# Compact

Compact는 살아 있는 객체를 한쪽으로 모아 흩어진 빈 공간을 큰 연속 공간으로 만듭니다. 객체가 Memory 안에서 이동하므로 그 객체를 가리키는 Reference도 새로운 위치를 가리키도록 갱신해야 합니다.

Fragmentation은 줄일 수 있지만, 살아 있는 객체를 옮기고 Reference를 고치는 비용이 듭니다.

---

# Copy

Copy는 살아 있는 객체만 다른 Memory 영역으로 옮긴 뒤 기존 영역을 한 번에 비웁니다. 죽은 객체를 하나씩 처리할 필요가 없으므로 수집 영역에서 살아 있는 객체가 적을 때 유리할 수 있습니다.

Young Generation에서 한 Survivor 공간의 생존 객체를 다른 Survivor 공간으로 옮기는 흐름을 Copy의 대표적인 예로 볼 수 있습니다. Copy도 객체가 이동하므로 Reference 갱신이 필요하고, 객체를 옮길 별도 공간도 필요합니다.

---

# Collector가 선택하는 조합

Sweep, Compact, Copy 중 하나만 모든 상황에 가장 좋은 것은 아닙니다. Collector는 수집하는 영역, 살아 있는 객체의 양, pause 목표와 처리량 목표에 따라 이 작업들을 서로 다른 방식으로 조합합니다.

---

# 참고 자료

- [Oracle Java 21 Generations](https://docs.oracle.com/en/java/javase/21/gctuning/generations.html)
- [Oracle Java 21 Available Collectors](https://docs.oracle.com/en/java/javase/21/gctuning/available-collectors.html)
