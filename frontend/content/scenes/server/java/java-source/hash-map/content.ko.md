# 한눈에 보기

HashMap은 Map의 Key-Value 계약을 Hash Table로 구현한 Class입니다. Key의 Hash로 후보 Bucket을 빠르게 좁힌 뒤 그 안에서 같은 Key를 찾습니다.

---

# HashMap이란?

HashMap은 Java의 Map 인터페이스를 구현한 클래스로, 데이터를 Key-Value 쌍으로 저장하는 자료구조입니다.
내부적으로 Hash Table을 사용하며, Key의 해시값을 이용해 데이터가 저장될 Bucket을 결정합니다. 이를 통해 검색, 삽입, 삭제를 평균 O(1)의 시간 복잡도로 수행할 수 있습니다.

이번 글에서는 HashMap의 내부 구조와 Key가 저장되고 조회되는 과정을 중심으로 살펴보겠습니다.

## 내부 구조

HashMap은 Node 배열을 기반으로 데이터를 관리하며, 배열의 각 위치를 Bucket이라고 합니다.

- Node: Key, Value, Hash, Next를 저장하는 객체입니다.
- Bucket: 해시값을 통해 결정되는 Node의 저장 위치입니다.
- Capacity: HashMap의 전체 Bucket 개수입니다.
- Chaining: 동일한 Bucket에 여러 Node가 배치되면 연결 리스트로 관리하는 방식입니다.
- Red-Black Tree: 특정 Bucket에 Node가 많이 집중되면 탐색 성능을 개선하기 위해 사용하는 균형 이진 탐색 트리입니다.

## 조회 과정

HashMap은 `get()`을 통해 데이터를 조회하며, 다음 과정을 거칩니다.

1. Hashing: Key의 `hashCode()`를 호출하고, Hash Spreading을 적용합니다.
2. Indexing: 해시값과 `(capacity - 1)`을 AND 연산하여 Bucket Index를 계산합니다.
3. Bucket Lookup: 해당 Bucket에 접근해 Node를 탐색합니다.
4. Key Comparison: 저장된 해시값과 실제 Key를 비교합니다.
5. Return: 일치하는 Key가 있다면 Value를, 없다면 null을 반환합니다.

## 저장 과정

HashMap은 `put()`을 통해 데이터를 저장하며, 조회와 동일한 방식으로 Bucket Index를 계산합니다.

- Bucket이 비어 있다면 새로운 Node를 저장합니다.
- 동일한 Key가 존재한다면 기존 Node의 Value를 갱신합니다.
- 다른 Key가 존재한다면 Chaining을 통해 새로운 Node를 연결합니다.
- 특정 조건에서 Node가 많이 쌓이면 Red-Black Tree로 변환합니다.

---

# 참고 자료

- [Java 21 API — HashMap](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/HashMap.html)
- [OpenJDK 21 HashMap Source](https://github.com/openjdk/jdk/blob/jdk-21%2B35/src/java.base/share/classes/java/util/HashMap.java)
