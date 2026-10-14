# 한눈에 보기

GC(Garbage Collection)는 Heap에서 더 이상 사용하지 않는 객체의 메모리를 자동으로 회수하는 기능입니다.
GC는 객체의 생존 여부를 판단하고 메모리를 회수하며, 수집 영역과 알고리즘에 따라 여러 방식으로 동작합니다.
이 글에서는 GC의 기본 원리부터 Serial, Parallel, CMS, G1의 발전 과정과 이를 지원하는 주요 기술을 살펴봅니다.

---

# GC란?

GC(Garbage Collection)는 Heap에서 더 이상 사용하지 않는 객체의 메모리를 자동으로 회수하는 기능입니다.
그렇다면 GC는 어떤 객체가 더 이상 필요하지 않은지 어떻게 판단할까요?
JVM은 `GC Roots`에서 Reference를 따라 객체에 도달할 수 있는지를 확인하는 `Reachability` 방식을 사용합니다.
GC Roots에서 도달할 수 있는 객체는 살아 있는 객체로 판단하고, 도달할 수 없는 객체는 메모리 회수 대상으로 판단합니다.
특히 GC 작업을 안전하게 수행하기 위해 Application Thread를 일시적으로 중지하는 `STW(Stop-The-World)`가 발생할 수 있습니다.

---

# GC 순서

GC는 기본적으로 살아 있는 객체를 식별하고, Garbage가 차지하는 메모리를 회수하는 과정으로 이해할 수 있습니다.
대표적으로 `Mark`, `Sweep / Compact / Copy`라는 개념이 사용됩니다.

## Mark

Mark는 GC Roots에서 Reference를 따라가며 살아 있는 객체를 식별하는 과정입니다.
GC Roots에서 직접 참조하는 객체뿐 아니라 해당 객체가 참조하는 다른 객체까지 탐색합니다.
이때 도달하지 못한 객체는 메모리 회수 대상이 됩니다.

## Sweep / Compact / Copy

살아 있는 객체를 식별했다면 메모리를 회수해야 합니다. 대표적인 방식은 다음과 같습니다.

- `Sweep`: Garbage가 차지하던 공간을 회수합니다. 다만 메모리 단편화가 발생할 수 있습니다.
- `Compact`: 살아 있는 객체를 한쪽으로 이동시켜 연속된 빈 공간을 확보합니다.
- `Copy`: 살아 있는 객체만 다른 영역으로 복사하고 기존 영역을 재사용합니다.

각 방식은 장단점이 있으며, GC Collector는 수집 대상과 객체의 생존 특성에 따라 적절한 알고리즘을 사용합니다.

---

# 영역에 따른 GC

JVM은 세대 가설에 따라 Heap을 `Young Generation`과 `Old Generation`으로 구분합니다.
특성에 따라 GC는 수집하는 영역을 구분하여 수행합니다.

- `Minor GC (Young GC)`: Young Generation을 대상으로 수행하는 GC입니다. Young Generation은 Eden과 Survivor 영역으로 구성되며, 살아남은 객체는 Survivor로 복사되거나 Old Generation으로 승격됩니다.
- `Major GC (Old GC)`: 일반적으로 Old Generation을 대상으로 수행하는 GC입니다. Old Generation은 오래 살아남은 객체가 많아 GC 작업량이 커질 수 있으며, 일부 Collector는 STW를 줄이기 위해 Concurrent 방식을 사용합니다.
- `Full GC`: 일반적으로 Young Generation과 Old Generation을 포함한 Heap 전체를 대상으로 수행하는 GC입니다. 보통 STW가 발생하며, 수집 범위가 넓어 중지 시간이 길어질 수 있습니다.

---

# GC 종류와 발전

GC Collector는 메모리 회수뿐 아니라 `Throughput`과 `Latency`를 개선하는 방향으로 발전해 왔습니다.
대표적으로 Serial, Parallel, CMS, G1이 있으며, 각각 서로 다른 성능 목표를 가지고 있습니다.

## Serial GC

Serial GC는 하나의 GC Thread로 메모리를 회수하는 방식입니다.
구조가 단순하지만 GC 작업 중에는 STW가 발생하며, 수집할 객체가 많아질수록 중지 시간이 길어질 수 있습니다.

## Parallel GC

Parallel GC는 여러 GC Thread를 활용해 GC 작업을 병렬로 수행합니다.
Serial GC보다 여러 CPU 코어를 효과적으로 활용할 수 있으며, 주요 목표는 `Throughput` 향상입니다.
다만 여전히 STW 상태에서 GC를 수행하기 때문에 긴 중지 시간이 발생할 수 있다는 한계가 있습니다.

## CMS (Concurrent Mark Sweep)

CMS는 Old Generation의 STW 시간을 줄이기 위해 등장한 Collector입니다.
Parallel GC가 여러 Thread로 GC를 빠르게 수행했다면, CMS는 일부 GC 작업을 Application Thread와 동시에 수행하는 `Concurrent` 방식을 도입했습니다.
CMS는 다음과 같은 단계로 동작합니다.

1. `Initial Mark (STW)`: 초기 탐색 대상을 식별합니다.
2. `Concurrent Mark`: Application Thread와 동시에 살아 있는 객체를 탐색합니다.
3. `Remark (STW)`: Marking 중 놓쳤을 수 있는 객체를 추가로 탐색합니다.
4. `Concurrent Sweep`: Application Thread와 동시에 Garbage가 차지하는 공간을 회수합니다.

CMS는 STW를 줄였지만 Mark-Sweep 방식으로 인한 `메모리 단편화`와, 메모리를 충분히 회수하기 전에 Old Generation이 가득 차는 `Concurrent Mode Failure` 등의 문제가 있었습니다.

## G1 (Garbage First)

G1은 CMS의 메모리 단편화 문제를 줄이고, STW 시간을 보다 효과적으로 관리하기 위해 설계된 Collector입니다.
CMS와 마찬가지로 Concurrent Marking을 사용하지만, Heap을 관리하고 메모리를 회수하는 방식에 차이가 있습니다.

### Region

G1은 Heap을 동일한 크기의 여러 `Region`으로 나누어 관리합니다.
각 Region은 Eden, Survivor, Old 등의 역할을 가지며, G1은 필요한 Region을 선택적으로 수집합니다.
`Concurrent Marking`을 통해 Region별 생존 정보를 파악하고, 회수 효율이 높은 Old Region을 선택해 수집합니다.
이때 살아 있는 객체를 다른 Region으로 복사하므로 메모리 단편화를 줄일 수 있습니다.
G1의 주요 수집 방식은 `Young GC`와 `Mixed GC`입니다.

- `Young GC`: Young Region을 수집합니다.
- `Mixed GC`: Young Region과 일부 Old Region을 함께 수집합니다.

두 방식 모두 STW가 발생하지만, G1은 목표 STW 시간을 고려해 수집할 Region을 조절합니다.

---

# GC를 지원하는 주요 기술

## Card Table과 Remembered Set

GC는 특정 영역만 수집하더라도 다른 영역에서 들어오는 Reference를 확인해야 합니다.
예를 들어 Young GC에서는 Old Generation의 객체가 Young 객체를 참조하고 있을 수 있습니다.
이때 Old Generation 전체를 탐색하는 비용을 줄이기 위해 `Card Table`과 `Remembered Set(RSet)`을 활용합니다.

- `Card Table`: Heap을 작은 Card 단위로 나누고, Reference 변경이 발생한 영역을 Dirty로 표시하는 자료구조입니다.
- `RSet`: 특정 수집 영역을 참조할 가능성이 있는 외부 Card의 위치를 관리하는 자료구조입니다.

두 기술은 서로 다른 역할을 하지만, GC가 수집 영역 외부의 Reference를 효율적으로 찾도록 돕는다는 공통점이 있습니다.
이러한 정보는 `Write Barrier`를 통해 관리됩니다.
JVM은 Reference를 변경하는 코드에 Barrier를 삽입하여, 필요한 변경 정보를 기록하거나 RSet 갱신에 활용합니다.
대표적으로 CMS 계열에서는 Card Table을 활용하고, G1에서는 Card Table과 Region별 RSet을 함께 활용합니다.

## Concurrent Marking과 Incremental Update / SATB

Concurrent Marking은 Application Thread와 동시에 살아 있는 객체를 탐색하여 STW 시간을 줄이는 방식입니다.
하지만 Marking 중에도 Application Thread가 Reference를 변경할 수 있다는 문제가 있습니다.
예를 들어 이미 탐색을 마친 객체가 새로운 객체를 참조하고, 기존 참조 경로가 제거된다면 GC가 살아 있는 객체를 놓칠 수 있습니다.
이러한 문제를 해결하기 위한 대표적인 방식이 `Incremental Update`와 `SATB`입니다.

- `Incremental Update`: Marking 중 새롭게 생성된 참조 관계를 놓치지 않도록 변경 정보를 기록하고, 필요한 객체를 추가로 탐색하는 방식입니다. CMS에서는 Card Table과 Mod Union Table 등을 활용합니다.
- `SATB(Snapshot At The Beginning)`: Marking 시작 시점에 살아 있던 객체를 이번 Marking에서도 살아 있는 것으로 간주하는 방식입니다. G1에서는 Pre-write Barrier를 통해 변경 전 Reference를 기록합니다.

두 방식 모두 Barrier를 활용하지만, Reference 변경에 대응하는 관점이 다릅니다.
Incremental Update는 `변경 이후의 참조 관계`를 반영하는 데 집중하고, SATB는 `변경 이전의 참조 관계`를 보존하는 데 집중합니다.
이렇게 수집 영역 외부의 Reference를 관리하는 기술과 Concurrent Marking 중 Reference 변경을 추적하는 기술을 구분하면, 각 기술이 어떤 문제를 해결하기 위해 필요한지 이해할 수 있습니다.
