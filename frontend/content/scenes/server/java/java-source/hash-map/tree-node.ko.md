# 한눈에 보기

HashMap은 한 Bucket의 Node Chain이 지나치게 길어지면 Red-Black Tree로 바꾸어 최악의 탐색 비용을 줄일 수 있습니다. 이를 Treeification이라고 합니다.

---

# TreeNode란?

HashMap은 해시 충돌이나 Bucket 충돌이 발생하면 동일한 Bucket의 Node들을 Linked List로 연결합니다.
하지만 Linked List는 탐색할 Node가 많아질수록 조회 비용이 증가하며, 최악 O(n)의 시간 복잡도를 가집니다.

이를 개선하기 위해 HashMap은 특정 조건을 만족하면 Linked List를 Red-Black Tree로 변환합니다. 이때 사용되는 Node가 TreeNode입니다.

---

# 내부 구조

TreeNode는 Red-Black Tree를 구성하기 위한 추가 필드를 가지고 있습니다.

```java
static final class TreeNode<K,V> extends LinkedHashMap.Entry<K,V> {
    TreeNode<K,V> parent;
    TreeNode<K,V> left;
    TreeNode<K,V> right;
    TreeNode<K,V> prev;
    boolean red;
}
```

- parent: 부모 노드 참조
- left, right: 왼쪽과 오른쪽 자식 노드 참조
- prev: 동일한 Bucket에서 이전 Node 참조
- red: 노드의 색상 관리 (true = Red)

TreeNode는 `LinkedHashMap.Entry`를 상속하고, 이는 다시 `HashMap.Node`를 상속합니다. 따라서 기존 Node의 `hash`, `key`, `value`, `next` 필드도 가지고 있습니다.

## 왜 next와 prev가 필요할까?

TreeNode는 Red-Black Tree이면서 Linked List 구조도 함께 유지합니다.

- left, right: 트리 탐색에 사용
- next: Bucket 내부 순회와 Resize 시 Node 분리에 사용
- prev: Linked List에서 Node를 삭제할 때 이전 Node와의 연결에 사용

즉, 탐색에는 Tree 구조를 사용하지만, 순회와 데이터 재배치에는 Linked List 구조도 활용합니다.

## LinkedHashMap.Entry는 왜 상속할까?

LinkedHashMap은 HashMap을 상속하며, 데이터의 순서를 관리하기 위해 `before`, `after` 필드를 추가로 사용합니다.

```java
static class Entry<K,V> extends HashMap.Node<K,V> {
    Entry<K,V> before, after;
}
```

- before: LinkedHashMap의 순서상 이전 Entry
- after: LinkedHashMap의 순서상 다음 Entry

이 필드들은 동일한 Bucket 내부가 아니라 LinkedHashMap 전체의 순서를 관리합니다.
TreeNode가 이를 상속하는 이유는 HashMap뿐 아니라 LinkedHashMap에서도 Treeification을 지원하기 위해서입니다.
일반 HashMap에서는 `before`, `after`를 이용해 삽입 순서를 관리하지 않습니다.

---

# Red-Black Tree란?

Red-Black Tree는 노드의 색상과 몇 가지 규칙을 이용해 균형을 유지하는 자가 균형 이진 탐색 트리입니다.
규칙은 다음과 같습니다.

1. 모든 노드는 Red 또는 Black입니다.
2. Root는 Black입니다.
3. 모든 NIL Leaf는 Black입니다.
4. Red 노드의 자식은 반드시 Black입니다. (No Double Red)
5. 각 노드에서 하위 NIL Leaf까지의 모든 경로는 Black 노드 수가 동일합니다. (Black Height)

이러한 규칙을 통해 트리가 한쪽으로 지나치게 치우치는 것을 방지합니다.

## 저장 과정

Red-Black Tree에 새로운 Node를 삽입하면 다음 과정을 거칩니다.

1. 기존 노드들과 비교해 삽입 위치를 결정합니다.
2. 새로운 Node를 Red로 삽입합니다.
3. Red-Black Tree의 규칙을 위반했는지 확인합니다.
4. 규칙을 위반했다면 Recoloring 또는 Rotation을 수행합니다.

HashMap은 기본적으로 해시값을 이용해 트리의 탐색 방향을 결정합니다.

- 해시값이 다르면: 해시값의 대소 관계로 비교
- 해시값이 같으면: Key가 비교 가능할 경우 `compareTo()` 사용
- 비교할 수 없다면: 추가적인 순서 결정 방식 사용

다만 Key의 대소 관계를 이용할 수 없는 경우에는 조회 시 양쪽 서브트리를 탐색해야 할 수도 있습니다.

## 왜 Red-Black Tree를 사용할까?

HashMap은 조회뿐 아니라 삽입과 삭제도 빈번하게 수행하는 자료구조입니다.
Red-Black Tree는 AVL Tree보다 균형 조건이 상대적으로 느슨하므로 구조 변경 비용을 줄일 수 있습니다.

- AVL Tree: 높이 차이를 엄격하게 유지하므로 탐색에 유리할 수 있습니다.
- Red-Black Tree: 어느 정도 불균형을 허용해 Rotation 횟수를 줄일 수 있습니다.

특히 삭제 과정에서 AVL Tree는 최악 O(log n)회의 Rotation이 발생할 수 있지만, Red-Black Tree는 최대 3회의 Rotation으로 균형을 복구할 수 있습니다.
두 자료구조 모두 탐색·삽입·삭제의 시간 복잡도는 O(log n)이지만, Red-Black Tree는 균형 유지에 따른 구조 변경 비용을 절충한 선택입니다.

---

# 언제 Treeification이 발생할까?

HashMap에는 Treeification과 관련된 두 가지 상수가 존재합니다.

- TREEIFY_THRESHOLD = 8: 트리화 검토 기준
- MIN_TREEIFY_CAPACITY = 64: 트리화를 허용하는 최소 Capacity

일반적인 `putVal()`의 코드를 살펴보겠습니다.

```java
if ((e = p.next) == null) {
    p.next = newNode(hash, key, value, null);
    if (binCount >= TREEIFY_THRESHOLD - 1)
        treeifyBin(tab, hash);
    break;
}
```

이 코드에서는 기존 Bucket에 Node가 8개 존재할 때 9번째 Node를 삽입하면 `treeifyBin()`을 호출합니다.
그런데 호출했다고 무조건 트리화되는 것은 아닙니다.

```java
if (tab == null || (n = tab.length) < MIN_TREEIFY_CAPACITY)
    resize();
```

Capacity가 64 미만이라면 Treeification 대신 Resize를 수행합니다.
그 이유는 Bucket 수가 부족해서 충돌이 발생했을 가능성이 있기 때문입니다.
Resize로 Node들을 분산시킬 수 있다면 추가적인 메모리와 균형 유지 비용이 필요한 Red-Black Tree를 사용할 필요가 없습니다.

## Treeification 과정

실제 `treeifyBin()`은 다음 과정을 수행합니다.

1. 기존 Bucket의 Linked List를 순회합니다.
2. 각 Node를 새로운 TreeNode 객체로 교체합니다.
3. TreeNode들을 `next`, `prev`로 연결합니다.
4. `treeify()`를 호출해 Red-Black Tree를 구성합니다.
5. Rotation과 Recoloring으로 균형을 유지합니다.

기존 Node를 TreeNode로 교체하지만 Key와 Value 객체 자체를 복제하지는 않습니다.

---

# Treeification은 계속 유지될까?

한 번 Treeification이 발생했다고 영원히 Tree 구조를 유지하는 것은 아닙니다.
Node 수가 줄어들면 다시 Linked List로 변환될 수 있습니다. 이를 Untreeification이라고 합니다.

## Resize 시

Resize가 발생하면 기존 Tree Bucket을 두 그룹으로 나눕니다.

- Low Group: 기존 Bucket Index 유지
- High Group: 기존 Index + 이전 Capacity로 이동

분리된 각 그룹의 Node 수가 `UNTREEIFY_THRESHOLD = 6` 이하라면 Linked List로 변환합니다.

```java
if (lc <= UNTREEIFY_THRESHOLD)
    tab[index] = loHead.untreeify(map);
```

예를 들어 10개의 Node가 존재하는 Tree Bucket이 Resize되었다고 가정해 보겠습니다.

- 7개 / 3개: 한쪽은 Tree, 다른 쪽은 Linked List
- 5개 / 5개: 양쪽 모두 Linked List
- 10개 / 0개: 기존 Tree 유지

따라서 Resize 이후에도 모든 Bucket이 반드시 Tree를 유지하는 것은 아닙니다.

## Node 삭제 시

Untreeification은 Resize뿐 아니라 `remove()` 과정에서도 발생할 수 있습니다.
HashMap의 `removeTreeNode()`는 Node를 제거한 뒤 Tree가 지나치게 작아졌다고 판단하면 Linked List로 변환합니다.
다만 삭제 시에는 단순히 Node 수가 6개 이하인지 계산하는 것이 아니라 트리의 구조를 이용해 판단합니다.
따라서 Resize 시에는 `UNTREEIFY_THRESHOLD`를 기준으로, 삭제 시에는 트리 구조를 기준으로 Untreeification이 발생할 수 있습니다.
또한 `clear()`는 모든 Bucket 참조를 제거하므로 별도의 Untreeification을 수행하지 않습니다.

---

# 참고 자료

- [OpenJDK 21 HashMap Source](https://github.com/openjdk/jdk/blob/jdk-21%2B35/src/java.base/share/classes/java/util/HashMap.java)
