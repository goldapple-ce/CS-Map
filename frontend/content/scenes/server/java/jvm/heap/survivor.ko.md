# 한눈에 보기

Survivor는 Young Generation의 Garbage Collection에서 살아남은 객체를 임시로 보관하는 영역입니다. 전통적인 세대별 구조에서는 이를 `S0`와 `S1`이라는 두 공간으로 나눠 번갈아 사용합니다.

`S0`가 항상 출발 공간이고 `S1`이 항상 도착 공간인 것은 아닙니다. 한 번의 Garbage Collection에서 한쪽이 `From Survivor`, 다른 쪽이 `To Survivor`가 되고, 다음 Garbage Collection에서는 두 역할이 바뀝니다.

```text
첫 번째 GC:  Eden + From(S0) → To(S1)
다음 GC:    Eden + From(S1) → To(S0)
```

수집이 끝나면 From 공간은 비워지고, 살아남은 객체는 To 공간에 모입니다. 내부적으로는 객체 내용을 새 위치에 복사하고 참조를 갱신하지만 같은 객체를 두 개 유지하지는 않습니다. 결과적으로 객체가 이동한 것처럼 이해할 수 있습니다.

이 이동을 반복하면서 JVM은 객체가 Garbage Collection에서 살아남은 횟수를 관리할 수 있습니다.

---

# 왜 두 공간이 필요한가

Young GC가 시작될 때 From Survivor에는 이전 GC에서 살아남은 객체가 들어 있습니다. Garbage Collector는 Eden과 From Survivor에서 여전히 살아 있는 객체만 골라 비어 있는 To Survivor로 옮깁니다.

```text
GC 전
From: 생존 후보 객체들
To:   비어 있음

GC 후
From: 비움
To:   이번에도 살아남은 객체만 모임
```

출발 공간과 도착 공간을 분리하면 살아 있는 객체와 정리할 객체가 섞인 공간 안에서 빈칸을 하나씩 관리할 필요가 없습니다. 생존 객체를 To 공간에 촘촘히 모은 뒤 기존 From 공간 전체를 비울 수 있어 남은 빈 공간이 잘게 나뉘는 현상도 줄일 수 있습니다.

GC가 끝나면 방금 객체를 받은 To가 다음 GC의 From이 되고, 비워진 기존 From이 다음 To가 됩니다. 이 때문에 S0와 S1의 역할이 계속 교대합니다.

하나의 Survivor 공간 안에서 읽기와 쓰기를 동시에 처리하는 구현도 이론적으로 가능하지만, 전통적인 copying 방식에서는 출발지와 목적지를 분리한 두 공간이 생존 객체 이동과 공간 회수를 단순하게 만듭니다.

---

# Promotion으로 이어지는 과정

S0 또는 S1에서 여러 번의 Garbage Collection을 견딘 객체는 Old Generation으로 Promotion될 수 있습니다. Survivor 공간이 부족하거나 객체의 크기와 Collector 정책에 따라 더 일찍 Promotion될 수도 있습니다.

따라서 `정확히 몇 번 생존하면 무조건 Old로 이동한다`고 고정해서 이해하면 안 됩니다. 기준은 실행 환경과 JVM의 판단에 따라 달라질 수 있습니다.

---

# 개발자가 개입하는 지점

일반적인 개발자는 객체의 Survivor 이동을 직접 명령하지 않습니다. GC log를 통해 객체의 생존, Promotion 양과 Young Generation 정리 결과를 관찰할 수 있습니다.

Old Generation으로 너무 많은 객체가 빠르게 이동한다면 객체가 필요 이상으로 오래 참조되고 있지는 않은지와 Young Generation 크기가 적절한지 확인합니다.

모든 Garbage Collector가 물리적인 S0와 S1 공간을 동일하게 사용하는 것은 아닙니다. 사용하는 Collector의 구조와 GC log를 기준으로 실제 동작을 확인해야 합니다.

---

# 참고 자료

- [Oracle Java — Garbage Collector Implementation](https://docs.oracle.com/en/java/javase/21/gctuning/garbage-collector-implementation.html)
