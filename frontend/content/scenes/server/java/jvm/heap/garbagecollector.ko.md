# 한눈에 보기

Garbage Collector는 Heap에서 더 이상 도달할 수 없는 객체를 찾아 Memory를 회수하는 JVM의 Memory 관리 기능입니다.

GC를 이해하면 객체가 왜 제거되지 않는지, GC가 왜 자주 발생하는지, Stop-The-World로 인해 응답 시간이 튀는 이유를 분석할 수 있습니다.

Heap의 세대 구조는 앞에서 다뤘으므로 여기서는 `어떤 객체를 수집 대상으로 판단하는지`, `어떤 방식으로 Memory를 회수하는지`, `Collector마다 무엇이 다른지`에 집중합니다.

---

# GC 대상 기준

Garbage Collector는 단순히 `오래된 객체`나 `null이 된 객체`를 수집하지 않습니다.

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

- `Mark`: 살아 있는 객체와 수집 대상 객체를 구분합니다.
- `Sweep`: 사용하지 않는 객체가 차지한 Memory를 다시 사용할 수 있게 만듭니다.
- `Compact`: 살아 있는 객체를 한쪽으로 모아 Memory 단편화를 줄입니다.
- `Copy`: 살아 있는 객체를 다른 Memory 영역으로 복사하고 기존 영역을 비웁니다.

모든 Garbage Collector가 이 작업을 동일한 방식과 순서로 수행하는 것은 아닙니다.

Collector마다 어떤 작업을 Application과 동시에 수행하는지, 언제 Thread를 멈추는지, 객체를 어떻게 이동하는지가 다릅니다.

## Mark

먼저 GC Roots에서 Reference를 따라가며 도달 가능한 객체를 찾습니다.

도달 가능한 객체는 살아 있는 객체로 표시하고, 도달할 수 없는 객체를 Memory 회수 대상으로 판단할 수 있습니다.

이 과정이 GC의 핵심입니다.

객체가 몇 번 사용됐는지나 생성된 지 얼마나 됐는지가 아니라 `현재 Application에서 다시 접근할 수 있는가`를 보는 것입니다.

## Sweep

수집 대상으로 판단된 객체가 사용하던 Memory를 다시 사용할 수 있도록 만듭니다.

객체마다 destructor를 호출해서 하나씩 삭제하는 방식이라고 생각하면 안 됩니다.

핵심은 해당 객체가 차지하던 Memory를 JVM이 이후 객체 할당에 다시 사용할 수 있는 상태로 만드는 것입니다.

## Compact

객체가 제거되고 빈 공간이 여기저기 흩어지면 Memory Fragmentation이 발생할 수 있습니다.

이때 살아 있는 객체를 한쪽으로 이동시켜 연속된 빈 공간을 확보하는 작업을 `Compact`라고 합니다.

객체의 위치가 변경되면 해당 객체를 가리키는 Reference도 새로운 위치를 가리키도록 갱신해야 합니다.

## Copy

살아 있는 객체만 다른 Memory 영역으로 복사하고 기존 영역을 한 번에 비우는 방식입니다.

Young Generation의 Survivor 영역을 설명할 때 본 From / To 방식과 연결해서 이해할 수 있습니다.

죽은 객체를 하나씩 처리하기보다 살아 있는 객체만 옮길 수 있기 때문에 살아 있는 객체가 적은 영역에서는 효율적일 수 있습니다.

---

# Stop-The-World

GC 과정의 일부에서는 Application Thread의 실행을 멈춰야 할 수 있습니다.

이를 `Stop-The-World`라고 합니다.

Application Thread가 객체 Reference를 계속 변경하는 동안 GC가 동시에 객체 관계를 확인하면 일관된 상태를 파악하기 어려울 수 있기 때문입니다.

GC Pause가 발생하면 해당 시간 동안 Application Code가 실행되지 못할 수 있습니다.

따라서 GC는 단순한 Memory 관리 문제가 아니라 응답 시간에도 영향을 줄 수 있습니다.

예를 들어 평소 50ms 정도 걸리는 Request가 특정 순간 수백 ms 이상으로 증가한다면 GC Pause도 원인 후보 중 하나가 될 수 있습니다.

---

# Safepoint

JVM은 Thread를 아무 Instruction에서나 무조건 멈추는 것이 아니라 Thread의 실행 상태를 안전하게 확인할 수 있는 지점에서 정지시키는 방식을 사용할 수 있습니다. 이러한 지점을 `Safepoint`라고 합니다.

GC뿐 아니라 일부 JVM 작업에서도 Safepoint가 사용될 수 있습니다.

Stop-The-World가 발생했다고 해서 모든 시간이 실제 객체를 회수하는 데만 사용된 것은 아닐 수 있으며, Thread들이 Safepoint에 도달하기까지 걸린 시간도 영향을 줄 수 있습니다.

## 왜 필요할까

Java Code 한 줄도 JVM 내부에서는 여러 Bytecode나 기계어 명령으로 나뉘어 실행될 수 있습니다.  
따라서 Thread를 아무 시점에서나 강제로 멈추면 객체 Reference가 변경되는 중간 상태처럼 JVM이 현재 상태를 정확하게 해석하기 어려운 순간에 멈출 수 있습니다.

예를 들어 다음 코드도 실제로는 여러 단계의 명령으로 실행됩니다.

```java
user.address = new Address();
```

GC는 어떤 객체가 살아 있는지 판단하기 위해 Thread가 어떤 객체를 참조하고 있는지 정확하게 알아야 합니다.  
또 객체를 이동하는 Collector라면 기존 객체를 가리키던 Reference도 올바르게 갱신해야 합니다.

그래서 JVM은 Thread가 실행 상태와 Reference 정보를 안전하게 확인할 수 있는 지점에 도달했을 때 멈추도록 합니다.

---

## Stop-The-World와의 관계

GC에서 Stop-The-World가 필요하면 JVM은 Application Thread에게 Safepoint에 도달해 멈추도록 요청할 수 있습니다.  
모든 필요한 Thread가 Safepoint에서 정지하면 JVM은 안정된 상태에서 GC 작업을 수행할 수 있습니다.

따라서 둘은 다음처럼 구분할 수 있습니다.

- `Safepoint`: Thread를 안전하게 멈출 수 있는 지점
- `Stop-The-World`: Application Thread들이 실제로 멈춰 있는 상태

GC 작업이 끝나면 멈춰 있던 Thread들은 다시 실행됩니다.

---

## Safepoint는 어디에 있을까

JVM은 모든 기계어 명령마다 Safepoint를 두지는 않습니다.  
Safepoint를 지나치게 많이 두면 실행 중 계속 Safepoint 여부를 확인해야 하므로 성능 비용이 발생할 수 있기 때문입니다.

대표적으로 Method 호출이나 반복문의 특정 지점처럼 JVM이 Thread 상태를 확인하기 적절한 위치에 Safepoint를 둘 수 있습니다.

즉 Safepoint는 `언제든 멈출 수 있게 하는 기능`이 아니라 `안전하게 멈출 수 있는 특정 지점을 마련해두는 방식`에 가깝습니다.

---

## 성능 문제와 Safepoint

Stop-The-World 시간이 길다고 해서 반드시 GC 작업 자체가 오래 걸린 것은 아닙니다.  
JVM이 정지를 요청한 뒤 모든 Thread가 Safepoint에 도달할 때까지 기다리는 시간도 영향을 줄 수 있습니다.

따라서 GC Pause나 JVM 정지 시간을 분석할 때는 실제 GC 작업 시간뿐 아니라 Thread들이 Safepoint에 도달하는 데 시간이 오래 걸렸는지도 확인할 필요가 있습니다.

---

# Allocation Rate와 GC

GC가 자주 발생한다고 반드시 Memory Leak이 있는 것은 아닙니다.

객체를 매우 빠르게 생성하고 빠르게 버리는 Application도 GC를 자주 실행할 수 있습니다.

예를 들어 Request마다 많은 임시 객체를 생성한다고 가정합니다.

```java
public Response process(Request request) {
    List<Item> items = new ArrayList<>();
    Map<Long, Item> itemMap = new HashMap<>();

    // 많은 임시 객체 생성
    return new Response();
}
```

이 객체들이 빠르게 제거되더라도 객체 생성 속도인 `Allocation Rate`가 높으면 Young 영역이 빠르게 차고 GC가 자주 발생할 수 있습니다.

따라서 GC 문제를 볼 때는 단순히 살아 있는 객체의 양뿐 아니라 `얼마나 빠르게 객체를 생성하고 있는지`도 함께 볼 필요가 있습니다.

---

# Garbage Collector 종류

HotSpot JVM에서는 목적이 다른 여러 Garbage Collector를 사용할 수 있습니다.

### Serial GC

하나의 GC Thread를 중심으로 수집 작업을 수행합니다.

구조가 단순하고 GC 자체의 부가 비용이 적지만 GC 동안 Application이 멈추기 때문에 큰 Heap이나 낮은 Latency가 필요한 Server 환경에는 불리할 수 있습니다.

대표 Option은 `-XX:+UseSerialGC`입니다.

### Parallel GC

여러 GC Thread를 사용해 GC 작업을 병렬로 수행합니다.

Stop-The-World 동안 CPU를 적극적으로 사용해 GC 작업을 빠르게 끝내고 전체 Throughput을 높이는 데 초점을 둡니다.

대표 Option은 `-XX:+UseParallelGC`입니다.

### G1 GC

Heap을 여러 Region으로 나누고 필요한 Region을 선택적으로 수집합니다.

처리량과 Pause Time 사이의 균형을 추구하며 일반적인 Server 환경에서 널리 사용됩니다.

대표 Option은 `-XX:+UseG1GC`입니다.

### ZGC

GC 작업의 많은 부분을 Application과 동시에 수행해 매우 짧은 Pause Time을 목표로 합니다.

큰 Heap이나 낮은 Latency가 중요한 환경에서 고려할 수 있지만 Concurrent 작업을 위한 CPU와 Memory 비용이 추가될 수 있습니다.

대표 Option은 `-XX:+UseZGC`입니다.

Collector의 세부 동작과 기본값은 Java Version에 따라 달라질 수 있으므로 실제 운영 JDK의 문서를 확인하는 것이 좋습니다.

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

예를 들어 GC가 자주 발생하더라도 매번 짧게 끝나고 충분한 Memory를 회수한다면 반드시 문제라고 볼 수는 없습니다.

반대로 GC 이후에도 Heap 사용량이 거의 줄지 않고 긴 Pause가 반복된다면 오래 살아 있는 객체나 Memory Leak을 의심해볼 수 있습니다.
