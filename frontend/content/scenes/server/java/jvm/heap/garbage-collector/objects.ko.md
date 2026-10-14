# 한눈에 보기

GC는 메모리 회수 범위에 따라 `Minor GC / Major GC / Full GC`로 구분합니다.
Minor GC는 Young Generation, Major GC는 Old Generation, Full GC는 Heap 전체를 대상으로 합니다.
CMS는 Concurrent Marking으로 Old Generation을 회수하며, G1은 Mixed GC로 일부 Old Region을 점진적으로 회수합니다.

---

# Young / Old Object의 GC

GC는 메모리를 회수하는 범위에 따라 `Minor GC / Major GC / Full GC`로 구분할 수 있습니다.

- `Minor GC`: Young Generation을 대상으로 수행하는 GC입니다.
- `Major GC`: Old Generation을 대상으로 수행하는 GC입니다.
- `Full GC`: Young과 Old Generation을 포함한 Heap 전체를 대상으로 수행하는 GC입니다.

## Minor GC는 어떻게 진행되나요?

Minor GC는 Young Generation의 메모리를 회수하는 작업으로, CMS와 G1 GC에서는 STW 상태에서 수행합니다. 살아 있는 Object를 다른 영역으로 복사하는 Copying 방식을 사용합니다.

1. `Root 탐색`: GC Roots와 Old Generation에서 들어오는 Reference를 확인해 살아 있는 Young Object를 찾습니다.
2. `Object 복사`: 살아 있는 Object를 Survivor 또는 Old Generation으로 복사합니다. Survivor로 복사되는 Object는 Age가 1 증가합니다.
3. `메모리 회수`: 복사가 끝나면 기존 Eden과 수집 대상 Survivor 영역을 비웁니다.

Young Generation은 수명이 짧은 Object가 많아 복사해야 하는 Object가 상대적으로 적습니다. 따라서 일반적으로 Old Generation을 수집하는 작업보다 짧은 STW로 끝날 수 있습니다.

## Major GC는 어떻게 진행되나요?

Major GC는 Old Generation의 메모리를 회수하는 작업입니다. Old Generation은 살아 있는 Object가 많아 탐색 시간이 길어질 수 있으므로 CMS와 G1 GC는 Concurrent Marking을 활용합니다.

- `CMS GC`: Initial Mark → Concurrent Mark → Remark → Concurrent Sweep 과정을 거쳐 Garbage를 회수합니다.
- `G1 GC`: Concurrent Marking으로 Region별 생존 정보를 파악한 뒤 Mixed GC를 통해 일부 Old Region을 회수합니다.

CMS는 Sweep 방식으로 Garbage가 차지하던 공간을 회수하고, G1은 살아 있는 Object를 다른 Region으로 복사한 뒤 기존 Region을 비웁니다.

---

# Full GC는 언제 발생하나요?

Full GC는 Young과 Old Generation을 포함한 Heap 전체를 대상으로 메모리를 회수하는 작업입니다. CMS와 G1 GC에서는 일반적인 GC로 충분한 메모리를 확보하지 못했을 때 발생할 수 있습니다.
대표적인 원인은 다음과 같습니다.

- `Allocation Failure`: 새로운 Object를 할당할 공간을 확보하지 못한 경우
- `Promotion Failure`: Young Object를 Old Generation으로 이동시킬 공간이 부족한 경우
- `Concurrent Mode Failure`: CMS가 Concurrent GC를 완료하기 전에 Old Generation의 공간이 부족해진 경우

Full GC는 일반적으로 STW 상태에서 진행되며, 수집 범위가 넓어 긴 Pause가 발생할 수 있습니다.
