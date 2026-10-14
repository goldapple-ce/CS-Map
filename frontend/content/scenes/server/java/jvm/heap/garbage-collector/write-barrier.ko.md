# 한눈에 보기

Barrier는 Application Thread가 Object의 Reference를 변경할 때 GC에 필요한 정보를 기록하거나 갱신하는 장치입니다.
Concurrent Marking에서는 Reference 변경을 추적해 살아 있는 Object가 누락되지 않도록 돕습니다.
또한 `Card Table / RSet`과 연계해 세대 및 영역 간 Reference를 효율적으로 관리합니다.

---

# Barrier란?

Concurrent Marking에서는 Application Thread가 실행되는 동안 Reference가 변경될 수 있습니다. GC가 이러한 변경을 놓치면 살아 있는 Object를 Garbage로 판단할 위험이 있습니다.
이를 방지하기 위해 JVM은 Reference를 변경하는 코드에 추가 작업을 수행하도록 합니다. 이러한 장치를 `Barrier`라고 합니다.
Barrier는 Reference 변경 자체를 막는 것이 아니라, GC가 필요한 정보를 기록하거나 갱신하도록 돕습니다.

## Barrier는 어떻게 동작하나요?

Barrier는 별도의 Thread가 Reference 변경을 감시하는 방식이 아닙니다. JVM이 Reference를 변경하는 명령에 추가 작업을 삽입해 실행하는 방식입니다.
예를 들어 다음과 같은 코드가 있다고 가정하겠습니다.

```java
a.child = b;
```

JVM은 이 Reference를 저장하는 과정에서 GC가 필요로 하는 추가 작업을 수행합니다. 실행 시점에 따라 다음과 같이 구분할 수 있습니다.

- `Pre-Write Barrier`: Reference를 변경하기 전에 실행합니다.
- `Post-Write Barrier`: Reference를 변경한 후에 실행합니다.

이때 Barrier가 수행하는 작업은 목적에 따라 달라집니다.

## Barrier는 어떤 정보를 기록하나요?

Barrier는 크게 두 가지 목적으로 사용됩니다.

1. Concurrent Marking의 정확성 유지
2. 세대 및 영역 간 Reference 관리

Concurrent Marking에서는 Reference 변경으로 살아 있는 Object가 누락되지 않도록 필요한 정보를 기록하거나 Mark 상태를 갱신합니다. 대표적인 방식이 `SATB / Incremental Update`이며, 구체적인 동작은 별도의 주제에서 살펴보겠습니다.
세대 및 영역 간 Reference 관리에서는 Reference 변경이 발생한 메모리 영역을 Card Table에 표시합니다. GC는 이 정보를 활용해 다른 영역에서 들어오는 Reference를 효율적으로 확인할 수 있습니다.
G1 GC에서는 Card Table의 변경 정보를 처리해 RSet을 갱신하며, CMS GC에서도 Card Table을 활용합니다.
즉, Barrier는 Reference 변경 시 실행되는 장치이고, Card Table과 RSet은 GC에 필요한 정보를 관리하는 자료구조입니다.

## Barrier가 기록한 정보는 언제 처리하나요?

Barrier가 실행된다고 해서 Application Thread가 Object Graph 전체를 다시 탐색하는 것은 아닙니다. Barrier는 필요한 정보를 기록하고, GC가 이후 해당 정보를 처리하도록 합니다.
Concurrent Marking과 관련된 정보는 Concurrent Mark와 Remark에서 처리할 수 있으며, Card Table과 RSet 관련 정보는 Young GC나 별도의 갱신 작업에서 활용됩니다.
이처럼 Barrier는 Reference 변경 시점과 GC가 해당 정보를 처리하는 시점을 분리해, Application Thread의 부담을 줄이면서도 정확한 GC를 수행하도록 돕습니다.

---

# 참고 자료

- [OpenJDK G1 GC Tuning Guide](https://docs.oracle.com/en/java/javase/21/gctuning/garbage-first-garbage-collector-tuning.html)
