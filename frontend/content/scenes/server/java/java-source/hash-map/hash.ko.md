# 한눈에 보기

HashMap은 Key의 `hashCode()`를 바탕으로 내부 Hash를 만들고, 그 값으로 확인할 Bucket Index를 계산합니다.

---

# hash()란

HashMap의 `hash()`는 Key의 해시값에 Hash Spreading을 적용해 Bucket에 데이터가 고르게 분포하도록 돕는 메서드입니다.
HashMap의 Capacity는 2의 거듭제곱으로 유지되며, Bucket Index는 `(capacity - 1) & hash` 연산으로 계산합니다.
예를 들어 Capacity가 16이라면 하위 4비트만 사용하므로, 상위 비트가 달라도 하위 4비트가 같다면 동일한 Bucket에 배치됩니다.
이를 완화하기 위해 `hash()`는 상위 비트의 정보를 하위 비트에 반영합니다.

---

# 동작 원리

```java
static final int hash(Object key) {
    int h;
    return (key == null) ? 0 : (h = key.hashCode()) ^ (h >>> 16);
}
```

- `hashCode()`: Key의 해시값을 계산합니다.
- `h >>> 16`: 상위 16비트를 하위 16비트 위치로 이동합니다.
- `^`: 원본의 하위 16비트와 이동한 상위 16비트를 XOR합니다.

결과적으로 상위 16비트는 유지되고, 하위 16비트에는 상위 비트의 정보가 반영됩니다.
또한 key가 null이면 hash 리턴값은 0입니다.

---

# 항상 고르게 분포할까?

그렇지는 않습니다. Hash Spreading은 모든 해시값의 분포를 개선하는 것이 아니라, 특정한 비트 패턴에서 발생하는 Bucket 충돌을 완화합니다.

예를 들어 `hashCode()`가 61이라면 다음과 같습니다.

- 원본: `0x0000003D` (61)
- Shift: `0x00000000`
- XOR 결과: `0x0000003D` (61)

상위 16비트가 모두 0이므로 결과가 변하지 않습니다. 이는 0부터 65,535까지의 해시값에서 동일하게 나타납니다.

이번에는 65,537을 살펴보겠습니다.

- 원본: `0x00010001` (65,537)
- Shift: `0x00000001`
- XOR 결과: `0x00010000` (65,536)

상위 16비트의 정보가 하위 비트에 반영되면서 결과가 달라졌습니다.
Capacity가 16이라면 Bucket Index도 달라집니다.

- Spreading 이전: `65,537 & 15 = 1`
- Spreading 이후: `65,536 & 15 = 0`

즉, 기존에는 사용하지 않았던 상위 비트의 정보를 이용해 다른 Bucket에 배치할 수 있게 된 것입니다.
다만 Spreading이 항상 충돌을 줄이는 것은 아닙니다. 해시값이 이미 고르게 분포되어 있다면 효과가 작고, 일부 경우에는 오히려 Bucket 충돌이 발생할 수도 있습니다.

---

# 왜 16비트일까?

Java의 `hashCode()`는 32비트 정수인 `int`를 반환합니다.
HashMap은 상위 16비트를 오른쪽으로 이동시켜 하위 16비트와 XOR함으로써, 상위 비트의 정보를 하위 비트에 반영합니다.
반드시 16비트여야 하는 것은 아니지만, Java HashMap은 연산 비용과 비트 분산 효과를 고려해 이 방식을 사용합니다.
즉, `hash()`는 완벽하게 균일한 분포를 만드는 것이 아니라, 적은 연산으로 특정한 Bucket 충돌을 완화하기 위한 최적화입니다.

---

# 참고 자료

- [OpenJDK 21 HashMap Source](https://github.com/openjdk/jdk/blob/jdk-21%2B35/src/java.base/share/classes/java/util/HashMap.java)
- [Java 21 API — Object.hashCode](<https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/Object.html#hashCode()>)
