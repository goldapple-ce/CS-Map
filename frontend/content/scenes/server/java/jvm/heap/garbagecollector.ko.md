# 한눈에 보기

Garbage Collector는 Heap에서 더 이상 도달할 수 없는 객체를 찾아 Memory를 회수하는 JVM의 Memory 관리 기능입니다.

GC를 이해하면 객체가 왜 제거되지 않는지, GC가 왜 자주 발생하는지, Stop-The-World로 인해 응답 시간이 튀는 이유를 분석할 수 있습니다.

Heap의 세대 구조는 앞에서 다뤘으므로 여기서는 `어떤 객체를 수집 대상으로 판단하는지`, `어떤 방식으로 Memory를 회수하는지`, `GC가 언제 어떤 범위를 수집하는지`, `Collector마다 무엇이 다른지`에 집중합니다.

---

# GC 대상 기준

Garbage Collector는 단순히 오래된 객체나 `null`이 된 객체를 수집하지 않습니다.

기준은 `GC Roots에서 해당 객체에 도달할 수 있는가`입니다.

대표적인 GC Roots에는 다음과 같은 참조가 포함됩니다.

- 실행 중인 Thread의 JVM Stack Frame에서 참조하는 객체
- Class의 `static` Field 등을 통해 참조되는 객체
- JVM 내부에서 유지하는 Reference
- JNI 같은 Native Code에서 유지하는 Reference

GC Roots에서 Reference를 따라가 도달할 수 있는 객체는 아직 사용될 가능성이 있다고 판단합니다.

반대로 어떤 GC Root에서도 도달할 수 없는 객체는 GC 대상이 될 수 있습니다.

```java
User user = new User();
user = null;
```

다른 Reference가 없다면 기존 `User` 객체는 더 이상 GC Roots에서 도달할 수 없으므로 수집 대상이 될 수 있습니다.

---

# 순환 참조

객체끼리 서로 참조하고 있다고 해서 반드시 살아 있는 것은 아닙니다.

```java
class Node {
    Node next;
}

Node a = new Node();
Node b = new Node();

a.next = b;
b.next = a;

a = null;
b = null;
```

두 객체는 서로를 참조하고 있지만 GC Root에서 두 객체에 도달할 수 없다면 둘 다 GC 대상이 될 수 있습니다.

즉 Java GC는 단순한 Reference Count가 아니라 `Reachability`를 기준으로 객체의 생존 여부를 판단합니다.

---

# GC에서는 어떤 일이 일어날까

Collector마다 구체적인 알고리즘은 다르지만 기본적으로 다음과 같은 작업이 조합되어 사용됩니다.

- `Mark`: 살아 있는 객체와 수집 대상 객체를 구분
- `Sweep`: 사용하지 않는 객체가 차지한 Memory를 다시 사용할 수 있게 만듦
- `Compact`: 살아 있는 객체를 한쪽으로 모아 Memory Fragmentation을 줄임
- `Copy`: 살아 있는 객체를 다른 Memory 영역으로 복사하고 기존 영역을 비움

모든 Garbage Collector가 이 작업을 동일한 방식과 순서로 수행하는 것은 아닙니다.

Collector마다 어떤 작업을 Application과 동시에 수행하는지, 언제 Thread를 멈추는지, 객체를 어떻게 이동하는지가 다릅니다.

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

# Stop-The-World와 Safepoint

GC 과정의 일부에서는 Application Thread를 멈춰야 할 수 있습니다.

이를 `Stop-The-World`라고 합니다.

Application Thread가 객체 Reference를 계속 변경하는 동안 GC가 동시에 객체 관계를 확인하면 일관된 상태를 파악하기 어려울 수 있기 때문입니다.

JVM은 Thread를 아무 Instruction에서나 무조건 멈추는 것이 아니라 실행 상태와 Reference를 안전하게 확인할 수 있는 지점에서 멈출 수 있습니다.  
이 지점을 `Safepoint`라고 합니다.

따라서 둘은 다음처럼 구분할 수 있습니다.

- `Safepoint`: Thread를 안전하게 멈출 수 있는 지점
- `Stop-The-World`: Application Thread들이 실제로 멈춰 있는 상태

Stop-The-World 시간이 길다고 해서 모든 시간이 실제 GC 작업에 사용된 것은 아닐 수 있습니다.  
Thread들이 Safepoint에 도달하기까지 걸린 시간도 영향을 줄 수 있습니다.

---

# Concurrent Marking

일부 Garbage Collector는 Mark 작업의 상당 부분을 Application Thread와 동시에 수행합니다.  
이를 `Concurrent Marking`이라고 합니다.

GC가 모든 Mark 작업을 Stop-The-World 상태에서 수행하면 객체 Graph를 안정적으로 확인할 수 있지만, Heap이 클수록 Application이 멈춰 있는 시간이 길어질 수 있습니다.

Concurrent Marking은 이 Pause를 줄이기 위해 Mark 작업의 일부를 Application 실행과 동시에 수행하는 방식입니다.

CMS, G1, ZGC, Shenandoah 같은 Collector에서 이러한 Concurrent GC 개념을 볼 수 있습니다.

## Concurrent Marking의 문제

GC가 Mark 작업을 하는 동안 Application Thread도 계속 실행되기 때문에 객체의 Reference 관계가 바뀔 수 있습니다.

예를 들어 처음에는 다음과 같은 Reference가 있다고 가정합니다.

`A → B`

GC가 `A`를 확인한 이후 Application Thread가 Reference를 변경할 수 있습니다.

```java
a.child = c;
```

이제 객체 Graph는 다음처럼 달라질 수 있습니다.

`A → C`

GC가 이러한 변경을 알지 못하면 실제로 살아 있는 객체를 놓치거나 Mark 결과가 실제 객체 Graph와 달라질 수 있습니다.

즉 Concurrent Marking의 핵심 문제는 `GC가 객체 Graph를 조사하는 동안 객체 Graph 자체가 계속 변한다`는 것입니다.

## Barrier를 이용한 Reference 변경 추적

현대 Garbage Collector는 이러한 문제를 해결하기 위해 `Write Barrier`, `Load Barrier` 같은 Barrier를 사용할 수 있습니다.

Application Thread가 Reference를 변경할 때 추가적인 처리를 수행하여 GC가 알아야 할 정보를 기록하는 방식입니다.

예를 들어 다음과 같은 Reference 변경이 발생하면:

```java
a.child = c;
```

GC는 Barrier를 통해 변경된 Reference 정보를 기록하고, 나중에 Mark 작업에서 다시 확인할 수 있습니다.

즉 Application Thread를 Concurrent Marking 전체 동안 멈추는 대신:

`Application은 계속 실행`  
→ `Reference 변경은 Barrier로 추적`  
→ `GC가 변경 정보를 반영`

하는 방식입니다.

## SATB

Concurrent Marking에서 사용하는 대표적인 방식 중 하나가 `SATB(Snapshot-At-The-Beginning)`입니다.

SATB는 Concurrent Marking이 시작된 시점의 객체 Graph를 논리적으로 유지하는 방식입니다.

예를 들어:

`A → B`

라는 Reference가 있었는데 Application Thread가 이를 다음처럼 변경한다고 가정합니다.

```java
a.child = c;
```

Reference가 `B`에서 `C`로 변경되기 전에 기존 Reference인 `B`를 별도로 기록해 두면 GC는 Concurrent Marking 시작 시점에 살아 있던 `B`를 놓치지 않고 확인할 수 있습니다.

G1 GC는 Concurrent Marking에서 이러한 SATB 방식의 Write Barrier를 사용합니다.

## Incremental Update

또 다른 접근은 `Incremental Update`입니다.

Concurrent Marking 중 새롭게 만들어진 Reference 관계를 추적하고, 변경된 객체 Graph를 GC의 Mark 결과에 반영하는 방식입니다.

즉 두 방식의 관점은 조금 다릅니다.

- `SATB`: Mark 시작 시점의 객체 Graph를 놓치지 않도록 유지
- `Incremental Update`: Marking 중 새롭게 생긴 Reference 변경을 추적

Collector마다 사용하는 방식은 다를 수 있습니다.

## 왜 Concurrent Marking을 사용할까

Concurrent Marking은 Application 실행 중 Barrier 처리와 추가 Metadata 관리 비용을 발생시킵니다.

그럼에도 사용하는 이유는 Mark 작업 전체를 Stop-The-World로 수행했을 때 발생할 수 있는 긴 Pause를 줄이기 위해서입니다.

즉 Trade-off는 다음과 같습니다.

> Application 실행 중 Reference 변경을 추적하는 작은 비용  
> 대신  
> GC Mark 작업 때문에 Application이 오래 멈추는 시간을 줄임

Heap이 크거나 낮은 Latency가 중요한 Application에서는 이러한 방식이 특히 중요합니다.

정리하면 Concurrent Marking은 `Application Thread를 계속 실행하면서 객체 생존 여부를 조사하고, 그 사이 발생하는 Reference 변경은 Barrier를 이용해 추적하여 Mark 결과의 정확성을 유지하는 방식`입니다.

---

# Allocation Rate와 GC

GC가 자주 발생한다고 반드시 Memory Leak이 있는 것은 아닙니다.

객체를 매우 빠르게 생성하고 빠르게 버리는 Application도 GC를 자주 실행할 수 있습니다.

```java
public Response process(Request request) {
    List<Item> items = new ArrayList<>();
    Map<Long, Item> itemMap = new HashMap<>();

    return new Response();
}
```

이 객체들이 빠르게 제거되더라도 객체 생성 속도인 `Allocation Rate`가 높으면 Young 영역이 빠르게 차고 GC가 자주 발생할 수 있습니다.

따라서 GC 문제를 볼 때는 살아 있는 객체의 양뿐 아니라 `얼마나 빠르게 객체를 생성하고 있는지`도 함께 확인해야 합니다.

---

# GC 범위

GC는 항상 Heap 전체를 한 번에 수집하는 것은 아닙니다.

Collector와 상황에 따라 일부 영역만 수집하거나 더 넓은 범위를 수집할 수 있습니다.

전통적으로 다음과 같은 용어가 사용됩니다.

- `Minor GC`: 일반적으로 Young Generation을 중심으로 수집
- `Major GC`: 일반적으로 Old Generation 수집을 의미하지만 의미가 Collector나 문서에 따라 다를 수 있음
- `Full GC`: 일반적으로 Young과 Old를 포함한 Heap의 넓은 범위를 대상으로 수집

이 용어들은 `Minor → Major → Full`처럼 순차적으로 진행되는 단계가 아닙니다.

Young 영역만 반복해서 수집될 수도 있고, Old 영역이나 Heap 전체 수준의 수집이 필요할 수도 있습니다.

Full GC는 부분적인 수집만으로 충분한 Memory를 확보하기 어려운 상황에서 더 넓은 범위를 정리하기 위해 발생할 수 있습니다.

다만 Full GC의 실제 동작과 발생 조건은 Collector마다 다를 수 있습니다.

Application에서 `System.gc()`를 호출할 수도 있지만 이는 GC를 즉시 강제하는 명령이라기보다 JVM에 GC 수행을 요청하는 것입니다.  
실제 실행 여부와 방식은 JVM과 설정에 따라 달라질 수 있으며, 명시적인 GC 요청은 큰 Pause를 유발할 수 있으므로 운영 Code에서는 주의해서 사용해야 합니다.

---

# 세대 간 Reference 추적

Young GC는 Young Generation을 수집할 때 Old Generation 전체를 매번 탐색하지 않습니다.

그렇다고 Old 객체가 Young 객체를 참조하는 경우를 무시할 수는 없습니다.

예를 들어 다음과 같은 Reference가 있다고 가정합니다.

```java id="v4m1pf"
oldObject.child = youngObject;
```

`oldObject`는 Old Generation에 있고 `youngObject`는 Young Generation에 있습니다.

Young GC가 Young 영역만 확인한다면 `youngObject`가 Old 객체에서 참조되고 있다는 사실을 놓칠 수 있습니다.

이를 해결하기 위해 JVM은 `Old → Young`과 같은 세대 간 Reference를 미리 추적합니다.

---

# Write Barrier

`Write Barrier`는 객체의 Reference가 변경될 때 JVM이 추가적인 처리를 수행하도록 넣는 메커니즘입니다.

예를 들어 다음과 같은 Reference 대입이 발생하면:

```java id="djzv2s"
oldObject.child = youngObject;
```

JVM은 단순히 Field 값만 변경하는 것이 아니라 해당 Reference 변경을 추적하기 위한 추가 작업도 수행할 수 있습니다.

즉 Write Barrier는 `Reference 변경을 감지하고 추적 정보를 갱신하는 역할`을 합니다.

Write Barrier 자체가 Reference 정보를 저장하는 공간은 아니며, Card Table이나 Remembered Set 같은 자료구조를 갱신하는 데 사용됩니다.

## Write Barrier의 비용

Write Barrier를 사용하면 객체 Reference를 변경할 때마다 추가적인 검사나 Metadata 갱신이 필요할 수 있습니다.

즉 Application Code 입장에서는 단순한 Reference 대입이 끝나는 것이 아니라 Card Table을 Dirty로 표시하거나 Remembered Set 관리에 필요한 추가 작업이 함께 발생할 수 있습니다.

이 때문에 다음과 같은 Runtime 비용이 생길 수 있습니다.

- Reference 대입 시 추가 Instruction 실행
- Card Table / Remembered Set 갱신 비용
- 경우에 따라 추가 Memory Access
- 여러 Thread가 관련 GC Metadata를 갱신하면서 발생하는 부가 비용

즉 GC를 빠르게 만들기 위해 Application의 평상시 실행 경로에 작은 비용을 분산해서 지불하는 방식이라고 볼 수 있습니다.

그럼에도 이 비용을 감수하는 이유는 GC 시점에 더 큰 비용을 피할 수 있기 때문입니다.

Write Barrier가 없다면 Young GC가 발생할 때마다 Old Generation 전체를 탐색하면서 Young 객체를 참조하는 Old 객체를 찾아야 할 수 있습니다.

Old Generation이 매우 큰 Application에서는 이 탐색 비용이 크게 증가하고 GC Pause도 길어질 수 있습니다.

따라서 JVM은 `평상시 Reference 변경마다 작은 비용을 지불하는 대신, GC가 발생했을 때 탐색해야 하는 Memory 범위를 크게 줄이는 방식`을 선택할 수 있습니다.

즉 다음과 같은 Trade-off입니다.

> Application 실행 중 작은 지속 비용  
> 대신  
> GC 시점의 큰 탐색 비용과 Pause 감소

이런 방식은 특히 Heap이 크고 Young GC가 자주 발생하는 Application에서 가치가 있습니다.

---

# Card Table

`Card Table`은 Heap을 작은 `Card` 단위로 나누고 Reference 변경이 발생한 Memory 영역을 표시하는 자료구조입니다.

예를 들어 Old Generation의 특정 영역에서 Reference가 변경되면 해당 Card를 `Dirty` 상태로 표시할 수 있습니다.

Young GC가 발생하면 Old Generation 전체를 탐색하는 대신 Dirty Card만 확인합니다.

그 Card 안에서 실제로 `Old → Young` Reference가 존재하는지 검사하고, 발견한 Young 객체부터 Reachability를 추적할 수 있습니다.

즉 Card Table은:

> `Old Generation의 어느 부분을 확인해야 하는가`

를 알려주는 비교적 거친 단위의 추적 정보라고 볼 수 있습니다.

---

# Remembered Set

`Remembered Set`은 특정 Memory 영역이나 Region으로 `외부에서 들어오는 Reference 정보`를 관리하는 자료구조입니다.

특히 G1 GC처럼 Heap을 여러 Region으로 나누고 일부 Region만 선택적으로 수집하는 Collector에서 중요합니다.

예를 들어 G1이 특정 Region을 수집하려고 한다면 다음을 알아야 합니다.

> 이 Region 내부의 객체를 다른 Region에서 누가 참조하고 있는가?

이 정보를 미리 관리하고 있으면 Heap 전체를 탐색하지 않고 해당 Region으로 들어오는 외부 Reference만 확인할 수 있습니다.

---

# Card Table과 Remembered Set의 차이

둘은 완전히 같은 개념은 아닙니다.

- `Card Table`: 어떤 Memory 구역에서 Reference 변경이 있었는지 표시
- `Remembered Set`: 특정 Region으로 들어오는 외부 Reference 정보를 관리

Card Table은 `어디가 변경됐는지`를 찾는 데 가깝고,  
Remembered Set은 `이 Region을 외부에서 누가 참조하는지`를 관리하는 데 가깝습니다.

둘 중 하나만 반드시 사용하는 것도 아닙니다.

Collector 구현에 따라 Card Table 중심으로 동작할 수도 있고, Card 단위 정보를 활용해 Remembered Set을 구성하거나 갱신할 수도 있습니다.

즉 `Card Table 또는 Remembered Set`처럼 완전히 대체 관계로 보면 안 됩니다.

---

# 왜 Remembered Set이 중요해졌을까

전통적인 세대형 GC에서는 주로 다음 문제가 중요했습니다.

> Old Generation 중 어느 부분이 Young Generation을 참조하고 있는가?

따라서 Old 영역을 Card 단위로 나누고 변경된 부분만 표시하는 Card Table 방식으로도 Young GC 비용을 줄일 수 있었습니다.

하지만 G1 GC는 Heap을 여러 개의 `Region`으로 나누고, GC가 필요할 때 일부 Region만 선택적으로 수집할 수 있습니다.

이 경우 단순히 `Old → Young` Reference만 알아서는 부족합니다.

특정 Region을 수집하려면 다음과 같은 정보가 필요합니다.

> 이 Region으로 다른 Region에서 어떤 Reference가 들어오고 있는가?

그래서 Region 단위로 외부 Reference를 관리하는 Remembered Set이 중요해졌습니다.

즉 GC의 수집 단위가:

`Generation 단위`

에서

`Region 단위`

로 더 세밀해지면서 Reference 추적 정보도 더 세밀하게 관리할 필요가 생긴 것입니다.

---

# Young GC에서는 어떻게 사용될까

Young GC에서는 대략 다음과 같은 정보를 이용해 살아 있는 Young 객체를 찾습니다.

- JVM Stack이나 static Field 같은 일반적인 GC Roots에서 Young으로 직접 들어오는 Reference
- Old Generation에서 Young Generation으로 들어오는 Reference 정보

Old 전체를 GC Root부터 끝까지 탐색하는 것이 아니라, Card Table이나 Remembered Set을 이용해 `Old → Young Reference가 존재할 가능성이 있는 부분`을 먼저 찾습니다.

이후 실제 Young 객체를 발견하면 그 객체부터 Young Generation 내부의 Reachability를 추적합니다.

즉 개념적으로는 다음과 같습니다.

`Reference 변경`  
→ `Write Barrier 실행`  
→ `Card Table / Remembered Set 갱신`  
→ `Young GC에서 필요한 Old 영역만 확인`  
→ `Young 객체의 Reachability 추적`

핵심은 `Young GC가 Old Generation 전체를 매번 탐색하지 않아도 되도록 세대 간 Reference 정보를 평소에 미리 관리한다`는 것입니다.

---

# Garbage Collector 종류

HotSpot JVM에서는 목적이 다른 여러 Garbage Collector를 사용할 수 있습니다.

### Serial GC

하나의 GC Thread를 중심으로 수집 작업을 수행합니다.

구조가 단순하고 부가 비용이 적지만 큰 Heap이나 낮은 Latency가 필요한 Server 환경에는 불리할 수 있습니다.

### Parallel GC

여러 GC Thread를 사용해 GC 작업을 병렬로 수행합니다.

Stop-The-World 동안 CPU를 적극적으로 사용해 GC 작업을 빠르게 끝내고 전체 Throughput을 높이는 데 초점을 둡니다.

### G1 GC

Heap을 여러 Region으로 나누고 필요한 Region을 선택적으로 수집합니다.

Young Region만 수집하는 경우도 있고, Young Region과 일부 Old Region을 함께 수집하는 Mixed GC도 수행할 수 있습니다.

처리량과 Pause Time 사이의 균형을 추구하는 Collector입니다.

### ZGC

GC 작업의 많은 부분을 Application과 동시에 수행해 매우 짧은 Pause Time을 목표로 합니다.

큰 Heap이나 낮은 Latency가 중요한 환경에서 고려할 수 있습니다.

Collector의 세부 동작과 기본값은 Java Version에 따라 달라질 수 있으므로 실제 사용하는 JDK의 문서를 확인하는 것이 좋습니다.

---

# GC 문제는 어떻게 나타날까

GC 문제가 있다고 항상 `OutOfMemoryError`가 발생하는 것은 아닙니다.

다음과 같은 형태로 먼저 나타날 수 있습니다.

- GC 실행 횟수 증가
- GC에 사용하는 CPU 증가
- Stop-The-World 시간 증가
- Request Latency 증가
- Throughput 감소
- Old 영역 사용량이 잘 줄어들지 않음
- 결국 Heap 공간을 확보하지 못해 `OutOfMemoryError` 발생

따라서 GC 문제는 Memory 사용량뿐 아니라 CPU, Latency, Throughput과 함께 확인해야 합니다.

---

# GC Log

GC 동작을 분석할 때 대표적으로 GC Log를 사용합니다.

GC Log에서는 다음과 같은 정보를 확인할 수 있습니다.

- 어떤 GC가 발생했는지
- GC가 얼마나 자주 발생하는지
- GC 전후 Heap 사용량
- 얼마나 많은 Memory를 회수했는지
- GC에 걸린 시간
- Pause Time
- Promotion이나 Old 영역 변화

GC가 자주 발생하더라도 매번 짧게 끝나고 충분한 Memory를 회수한다면 반드시 문제라고 볼 수는 없습니다.

반대로 GC 이후에도 Heap 사용량이 거의 줄지 않고 긴 Pause가 반복된다면 오래 살아 있는 객체나 Memory Leak을 의심해볼 수 있습니다.
