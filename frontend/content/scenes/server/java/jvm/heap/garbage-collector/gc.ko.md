# 한눈에 보기

GC는 더 이상 도달할 수 없는 객체가 차지한 Memory를 회수하는 JVM의 Memory 관리 기능입니다.

---

# Memory를 회수하는 방법

Collector마다 구체적인 알고리즘은 다르지만 기본적으로 다음과 같은 작업이 조합되어 사용됩니다.

- `Mark`: 살아 있는 객체와 수집 대상 객체를 구분
- `Sweep`: 사용하지 않는 객체가 차지한 Memory를 다시 사용할 수 있게 만듦
- `Compact`: 살아 있는 객체를 한쪽으로 모아 Memory Fragmentation을 줄임
- `Copy`: 살아 있는 객체를 다른 Memory 영역으로 복사하고 기존 영역을 비움

## Mark

GC Roots에서 Reference를 따라가며 도달 가능한 객체를 찾습니다.  
도달 가능한 객체는 살아 있는 객체로 판단하고, 도달할 수 없는 객체를 Memory 회수 대상으로 볼 수 있습니다.

## Sweep

수집 대상으로 판단된 객체가 사용하던 Memory를 다시 사용할 수 있도록 만듭니다.  
객체마다 하나씩 삭제한다기보다 해당 객체가 차지하던 Memory를 이후 Allocation에 재사용할 수 있게 만드는 과정에 가깝습니다.

## Compact

객체가 제거되고 빈 공간이 흩어지면 Memory Fragmentation이 발생할 수 있습니다.  
이때 살아 있는 객체를 한쪽으로 이동시켜 연속된 빈 공간을 확보할 수 있습니다.

## Copy

살아 있는 객체만 다른 Memory 영역으로 복사하고 기존 영역을 비우는 방식입니다.  
Young Generation의 Survivor 이동과 연결해서 이해할 수 있습니다.

---

# 개발자가 결정하는 것

Application은 객체를 언제 수거할지 직접 결정하지 않습니다. `System.gc()`도 즉시 수집을 강제하는 명령이 아니라 JVM에 요청하는 Method입니다. 큰 수집과 긴 pause를 유발할 수 있으므로 운영 코드에서는 GC 시점을 직접 통제하려 하기보다 원인을 측정하고 Heap과 Collector를 조정하는 편이 일반적입니다.

---

# 참고 자료

- [Oracle Java 21 Available Collectors](https://docs.oracle.com/en/java/javase/21/gctuning/available-collectors.html)
- [System.gc()](<https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/System.html#gc()>)
