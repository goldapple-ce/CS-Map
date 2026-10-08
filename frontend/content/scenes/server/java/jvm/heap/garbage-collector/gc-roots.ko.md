# 한눈에 보기

GC Roots는 객체의 생존 여부를 판단하기 위해 Reference 탐색을 시작하는 지점입니다.
Java GC는 GC Roots에서 객체까지 도달할 수 있는지를 나타내는 `Reachability`를 기준으로 객체의 생존 여부를 판단합니다.

---

# GC Roots

Garbage Collector는 현재 실행 중인 프로그램에서 계속 사용될 가능성이 있는 특정 Reference를 시작점으로 삼아 객체를 탐색합니다.
이 시작점을 `GC Roots`라고 합니다. 대표적인 GC Roots에는 다음과 같은 Reference가 있습니다.

- 실행 중인 Thread의 JVM Stack Frame에서 참조하는 객체
- Class의 `static` Field 등을 통해 참조되는 객체
- JVM 내부에서 유지하는 Reference
- JNI 같은 Native Code에서 유지하는 Reference

---

# Reachability

`Reachability`는 GC Roots에서 Reference를 따라 특정 객체까지 도달할 수 있는지를 의미합니다.  
Garbage Collector는 GC Roots에서 시작해 객체가 가진 Reference를 계속 따라가며 연결된 객체를 탐색합니다.  
GC Roots에서 도달할 수 있는 객체는 `Reachable`한 객체로 판단하고 살아 있는 객체로 취급합니다.  
반대로 어떤 GC Root에서도 도달할 수 없는 객체는 `Unreachable`한 객체가 되어 GC 대상이 될 수 있습니다.

```java
User user = new User();
user = null;
```

다른 Reference가 없다면 기존 `User` 객체로 이어지는 경로가 사라집니다.  
따라서 GC Roots에서 기존 `User` 객체에 도달할 수 없게 되고, 해당 객체는 GC 대상이 될 수 있습니다.

---

# 순환 참조와 Reference Counting

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

`a`와 `b`를 통해 두 객체에 접근할 수 없게 되었지만, 두 객체는 여전히 서로를 참조하고 있습니다.  
만약 객체를 가리키는 Reference 개수만 세는 `Reference Counting` 방식으로 생존 여부를 판단한다면, 두 객체는 서로를 참조하고 있기 때문에 Count가 0이 되지 않습니다.  
실제로는 프로그램에서 더 이상 접근할 수 없는 객체인데도 살아 있는 객체로 판단할 수 있는 것입니다.  
Java GC는 이런 문제 때문에 Reference 개수가 아니라 `Reachability`를 기준으로 판단합니다.  
두 객체가 서로를 참조하고 있더라도 GC Roots에서 두 객체까지 도달할 수 없다면 둘 다 `Unreachable`한 객체이므로 GC 대상이 될 수 있습니다.

---

# 참고 자료

- [Java Virtual Machine Specification - Heap](https://docs.oracle.com/javase/specs/jvms/se21/html/jvms-2.html#jvms-2.5.3)
