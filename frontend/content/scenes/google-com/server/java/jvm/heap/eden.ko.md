# 한눈에 보기

Eden은 새 객체가 일반적으로 처음 생성되는 Young Generation의 영역입니다.

```java
Order order = new Order();
```

위 코드로 만들어진 `Order` 객체는 보통 Eden에서 memory를 할당받습니다. `order` 같은 local variable은 JVM Stack에 있을 수 있지만 실제 객체는 Heap에 생성됩니다.

---

# Eden이 가득 차면

Application이 객체를 계속 만들면 Eden의 사용량이 증가합니다. Young Generation을 정리하는 Garbage Collection이 실행되면 더 이상 도달할 수 없는 객체는 정리되고, 살아남은 객체는 Survivor로 이동할 수 있습니다.

모든 객체가 반드시 Eden에 생성되는 것은 아닙니다. 큰 객체의 배치와 실제 할당 방법은 Garbage Collector와 JVM 설정에 따라 달라질 수 있습니다.

---

# 개발자가 개입하는 지점

개발자가 객체를 특정 Eden 위치에 직접 저장하지는 않습니다. 대신 profiler와 GC log를 통해 객체 할당 속도와 Young GC 빈도를 확인할 수 있습니다.

Young GC가 지나치게 자주 발생한다면 불필요하게 많은 임시 객체를 만들고 있지 않은지, Heap과 Young Generation의 크기가 실행 환경에 적절한지 살펴봅니다.

---

# 참고 자료

- [Oracle Java — Garbage Collector Implementation](https://docs.oracle.com/en/java/javase/21/gctuning/garbage-collector-implementation.html)
