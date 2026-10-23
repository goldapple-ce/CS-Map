# 한눈에 보기

Node Chain은 같은 Bucket에 들어온 여러 Entry를 연결해 보관하는 Collision 처리 방식입니다.

---

# Node란?

Node는 HashMap에서 실제 Key와 Value를 저장하는 객체입니다.
각 Bucket에는 Node가 저장되며, 해시 충돌이 발생하면 여러 Node를 연결해 관리합니다.

---

# 내부 구조

Node는 다음 네 가지 필드를 가지고 있습니다.

```java
static class Node<K,V> implements Map.Entry<K,V> {
    final int hash;
    final K key;
    V value;
    Node<K,V> next;
}
```

- hash: Hash Spreading이 적용된 해시값을 저장합니다.
- key: 실제 Key 객체의 참조를 저장합니다.
- value: Key에 대응하는 Value를 저장합니다.
- next: 동일한 Bucket에 연결된 다음 Node를 참조합니다.

여기서 주목할 부분은 `hash`를 별도로 저장하고, `hash`와 `key`를 `final`로 선언했다는 점입니다.

## 왜 hash를 별도로 저장할까?

HashMap은 Node를 생성할 때 계산한 해시값을 별도로 저장합니다.
따라서 조회할 때마다 기존 Key의 `hashCode()`를 다시 호출할 필요가 없으며, 저장된 해시값을 바로 비교할 수 있습니다.
다만 Key 객체의 내부 상태가 변경되어 `hashCode()`의 결과가 달라지더라도 Node에 저장된 `hash`는 변경되지 않습니다.
이로 인해 저장 당시와 조회 당시의 해시값이 달라져 데이터를 찾지 못할 수 있습니다.

## 왜 hash와 key는 final일까?

두 필드는 데이터의 위치와 동일성을 판단하는 데 사용되므로 Node가 생성된 이후 변경되지 않도록 설계되었습니다.

- hash: 저장된 해시값의 변경 방지
- key: 저장된 Key 참조의 변경 방지
- value: 동일한 Key에 대해 갱신 가능
- next: Node의 연결 관계 변경 가능

단, `key`가 `final`이더라도 Key 객체 내부의 상태까지 변경할 수 없는 것은 아닙니다.

---

# 조회 과정

HashMap은 `get()`을 호출하면 내부적으로 `getNode()`를 통해 데이터를 탐색합니다.

```java
if (first.hash == hash &&
    ((k = first.key) == key ||
     (key != null && key.equals(k))))
    return first;
```

여기서 주목할 부분은 Key 객체의 `hashCode()`를 다시 호출하는 것이 아니라 Node에 저장된 `hash`와 비교한다는 점입니다.
동일한 Bucket에서 Key를 탐색하는 과정은 다음과 같습니다.

1. Hash Comparison: Node에 저장된 hash와 조회할 해시값을 비교합니다.
2. Reference Comparison: `==`로 동일한 객체인지 확인합니다.
3. Equals Comparison: 참조가 다르다면 `equals()`로 논리적 동일성을 확인합니다.
4. Return: 일치하는 Node를 찾으면 Value를 반환합니다.

첫 번째 Node가 일치하지 않는다면 `next`를 따라 연결된 Node를 탐색합니다. TreeNode인 경우에는 트리 탐색을 수행합니다.
또한 `==` 비교에서 동일한 객체라고 판단되면 `equals()`를 호출하지 않습니다.

---

# 저장 과정

데이터 저장은 `put()`에서 호출하는 `putVal()`을 통해 이루어집니다.

```java
if ((p = tab[i = (n - 1) & hash]) == null)
    tab[i] = newNode(hash, key, value, null);
else {
    // 기존 Node 탐색 및 Key 비교
    // 동일한 Key가 없으면 새로운 Node 연결
}
```

저장 과정은 다음과 같습니다.

1. Bucket Lookup: 해시값을 이용해 Bucket Index를 결정합니다.
2. Insert: Bucket이 비어 있다면 새로운 Node를 생성합니다.
3. Key Comparison: 이미 Node가 있다면 동일한 Key가 존재하는지 확인합니다.
4. Chaining: 다른 Key라면 Linked List에 새로운 Node를 연결합니다.
5. Treeification: 특정 조건을 만족하면 Red-Black Tree로 변환합니다.

여기서 중요한 점은 Node가 생성될 때 Key 객체의 참조와 계산된 hash가 별도의 필드로 저장된다는 것입니다.

---

# 교체 과정

동일한 Key가 존재하는 경우에도 `putVal()`에서 처리합니다.

```java
if (e != null) {
    V oldValue = e.value;
    if (!onlyIfAbsent || oldValue == null)
        e.value = value;
    afterNodeAccess(e);
    return oldValue;
}
```

여기서 주목할 부분은 기존 Node의 `value`만 갱신한다는 점입니다.

- key: 기존 Key 객체 유지
- hash: 기존 해시값 유지
- value: 새로운 Value로 변경
- size: 변경 없음
- modCount: 변경 없음

일반적인 `put()`은 `onlyIfAbsent`가 false이므로 기존 Value를 새로운 Value로 갱신합니다.
따라서 서로 다른 인스턴스라도 논리적으로 동일한 Key라면 새로운 Node를 생성하지 않고 기존 Node의 Value만 교체합니다.

---

# 참고 자료

- [Java 21 API — HashMap](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/HashMap.html)
- [OpenJDK 21 HashMap Source](https://github.com/openjdk/jdk/blob/jdk-21%2B35/src/java.base/share/classes/java/util/HashMap.java)
