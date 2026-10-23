# 한눈에 보기

Bucket은 HashMap 내부 Table Array의 한 Slot이며, 같은 Index로 계산된 Entry를 담는 위치입니다.

---

# Bucket이란?

Bucket은 HashMap에서 Node가 저장되는 배열의 각 위치를 의미합니다.
HashMap은 여러 Bucket으로 구성된 배열을 사용하며, 해시값을 통해 데이터가 저장될 Bucket을 결정합니다.

---

# Capacity

Capacity는 HashMap의 Bucket 개수를 의미하며, 기본값은 16입니다.
HashMap은 생성자를 통해 초기 Capacity와 Load Factor를 지정할 수 있습니다.

```java
public HashMap(int initialCapacity, float loadFactor) {
    // 인자 검증 생략
    this.loadFactor = loadFactor;
    this.threshold = tableSizeFor(initialCapacity);
}
```

여기서 `threshold`는 일반적으로 Resize 임계값을 의미하지만, 아직 Bucket 배열이 생성되지 않았다면 초기 Capacity를 임시로 저장하는 용도로 사용됩니다.
HashMap의 Capacity는 항상 2의 거듭제곱으로 유지됩니다.
이를 위해 `tableSizeFor()`는 지정한 값 이상의 가장 작은 2의 거듭제곱을 계산합니다.

```java
static final int tableSizeFor(int cap) {
    int n = -1 >>> Integer.numberOfLeadingZeros(cap - 1);
    return (n < 0) ? 1 :
           (n >= MAXIMUM_CAPACITY) ? MAXIMUM_CAPACITY : n + 1;
}
```

예를 들어 초기 Capacity를 10으로 지정했다면 `threshold`에는 먼저 16이 저장됩니다. 이후 첫 번째 데이터를 삽입할 때 Capacity가 16인 배열이 생성되고, 기본 Load Factor가 0.75라면 `threshold`는 12로 변경됩니다.
Capacity를 2의 거듭제곱으로 유지하는 이유는 Indexing과 Resize를 효율적으로 처리하기 위해서입니다.

---

# Indexing

해시값은 32비트 정수이지만 Bucket 개수는 제한되어 있습니다. 따라서 해시값을 배열의 Index로 변환하는 과정이 필요합니다.

```java
index = (capacity - 1) & hash;
```

예를 들어 Capacity가 16이고 해시값이 61이라면 다음과 같습니다.

- Capacity: 16
- Capacity - 1: 15 (`0x0F`)
- Hash: 61 (`0x3D`)
- Index: `15 & 61 = 13`

Capacity가 2의 거듭제곱이면 Capacity - 1의 하위 비트가 모두 1이 됩니다.
따라서 AND 연산을 통해 필요한 하위 비트만 추출할 수 있습니다.

## 왜 AND 연산자를 사용할까?

나머지 연산자인 `%`로도 Bucket Index를 계산할 수 있습니다.
하지만 Capacity가 2의 거듭제곱이라면 비트 AND 연산으로 동일한 나머지를 구할 수 있습니다. (음수가 아닌 해시값 기준)

- `61 % 16 = 13`
- `61 & 15 = 13`

AND 연산은 단순한 비트 연산이므로 Index 계산을 효율적으로 처리할 수 있습니다.
또한 해시값이 음수여도 유효한 Index를 얻을 수 있습니다.

예를 들어 해시값이 -61이라면 다음과 같습니다.

- Hash: -61 (`0xFFFFFFC3`)
- Capacity - 1: 15 (`0x0000000F`)
- Index: `15 & -61 = 3`

AND 연산에서는 Capacity - 1에 해당하는 비트만 남으므로 결과는 항상 0 이상 Capacity 미만입니다.
한편 HashMap의 최대 Capacity는 2³⁰입니다. `int`로 표현할 수 있는 양수 범위와 Capacity를 두 배씩 확장하는 구조를 고려한 제한입니다.

---

# Bucket Collision

서로 다른 해시값이라도 동일한 Bucket에 배치될 수 있습니다. 이를 Bucket Collision이라고 합니다.

예를 들어 Capacity가 16이라면 다음과 같습니다.

- Hash 13 → Bucket 13
- Hash 29 → Bucket 13
- Hash 45 → Bucket 13

모두 하위 4비트가 같기 때문에 동일한 Bucket에 배치됩니다.
HashMap은 이러한 충돌을 Chaining으로 처리하며, 특정 조건에서 Red-Black Tree로 변환합니다.
하지만 하나의 Bucket에 Node가 지나치게 집중되면 탐색 성능이 저하될 수 있습니다.

---

# Resize

HashMap은 데이터가 증가하면 Bucket 배열의 크기를 확장하는 Resize를 수행합니다.
Bucket 수가 증가하면 서로 다른 해시값을 가진 Node들이 여러 Bucket으로 분산될 가능성이 높아집니다.
다만 Resize 자체에도 배열 생성과 Node 재배치 비용이 발생합니다.

## Load Factor

그렇다면 언제 Resize를 수행할까요? HashMap은 Load Factor를 이용해 Resize 시점을 결정합니다.

- Capacity: 전체 Bucket 개수
- Size: 저장된 Key-Value 개수
- Load Factor: Resize를 결정하는 적재율 기준
- Threshold: `Capacity × Load Factor`

기본 Load Factor는 0.75입니다.

예를 들어 Capacity가 16이라면 Threshold는 12입니다. 새로운 Node를 삽입해 Size가 13이 되면 Resize를 수행합니다.
Load Factor에 따른 차이는 다음과 같습니다.

- 높을 때: 메모리 효율은 좋아지지만 충돌 가능성이 증가합니다.
- 낮을 때: 충돌 가능성은 줄지만 메모리 사용량과 Resize 횟수가 증가할 수 있습니다.

참고로 Chaining을 사용하기 때문에 Size가 Capacity보다 많아지는 것 자체는 문제가 아닙니다.

## 기존 Node는 어떻게 이동할까?

Resize가 발생하면 Capacity는 일반적으로 2배로 증가합니다. 다만 기존 Node가 무조건 새로운 위치로 이동하는 것은 아닙니다.
기존 Index를 유지하거나, 기존 Index에 이전 Capacity를 더한 위치로 이동합니다.
이때 다음 조건을 사용합니다.

```java
if ((node.hash & oldCapacity) == 0) {
    newIndex = oldIndex;
} else {
    newIndex = oldIndex + oldCapacity;
}
```

예를 들어 Capacity가 16에서 32로 증가한다고 가정해 보겠습니다.

Hash가 61인 Node는 다음과 같이 이동합니다.

- 기존 Index: `61 & 15 = 13`
- 새로운 Index: `61 & 31 = 29`

따라서 13번 Bucket에서 29번 Bucket으로 이동합니다. 반면 Hash가 13이라면 Resize 이후에도 13번 Bucket에 남아 있습니다.
이처럼 Capacity가 2배로 증가하면 Index 계산에 사용하는 비트가 하나 추가됩니다.
따라서 기존 해시값을 다시 계산하지 않고도 Node의 새로운 위치를 결정할 수 있습니다.

## Resize 중 새로운 데이터가 삽입된다면?

여기서 동시성 문제가 발생할 수 있습니다.
HashMap은 Thread-Safe하지 않기 때문에 한 Thread가 Resize를 수행하는 동안 다른 Thread가 데이터를 삽입하면 내부 구조의 일관성이 깨질 수 있습니다.

- Thread A: 새로운 Bucket 배열을 생성하고 기존 Node를 이동합니다.
- Thread B: 동시에 새로운 Node를 삽입합니다.
- Thread A: 데이터 이동 과정에서 Thread B의 변경 사항을 덮어쓸 수 있습니다.

그 결과 서로 다른 Key인데도 데이터가 유실될 수 있습니다.
따라서 여러 Thread가 동시에 HashMap을 수정해야 한다면 외부 동기화나 ConcurrentHashMap을 사용해야 합니다.

---

# 참고 자료

- [OpenJDK 21 HashMap Source](https://github.com/openjdk/jdk/blob/jdk-21%2B35/src/java.base/share/classes/java/util/HashMap.java)
