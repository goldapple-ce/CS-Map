# 한눈에 보기

Key Object는 HashMap이 데이터를 구분하고 다시 찾을 때 사용하는 기준입니다.

---

# Key 객체란?

HashMap은 Key 객체의 `hashCode()`와 `equals()`를 이용해 데이터를 저장하고 식별합니다.
Node에는 Key 객체의 참조와 삽입 당시 계산한 해시값이 함께 저장됩니다.

---

# hashCode()

`hashCode()`는 객체의 해시값을 반환하는 메서드입니다.
HashMap은 이 값을 이용해 Bucket Index를 결정하고, 조회 시에도 저장된 해시값과 비교합니다.
따라서 Key의 해시값은 저장된 이후에도 일관되게 유지되어야 합니다.

## Hash Collision

서로 다른 Key가 동일한 해시값을 갖는 현상을 해시 충돌(Hash Collision)이라고 합니다.
해시값의 크기는 제한되어 있기 때문에 충돌을 완전히 피할 수는 없습니다.

- Hash Collision: 서로 다른 Key가 동일한 해시값을 갖는 현상
- Bucket Collision: 해시값이 다르더라도 동일한 Bucket에 배치되는 현상

충돌이 많아지면 동일한 Bucket에서 비교해야 하는 Key가 증가해 탐색 성능이 저하될 수 있습니다.
따라서 `hashCode()`는 해시값이 가능한 한 고르게 분포하도록 구현하는 것이 중요합니다.
HashMap은 이러한 충돌을 Chaining과 Treeification으로 처리합니다.

---

# equals()

`equals()`는 두 객체가 논리적으로 동일한지 판단하는 메서드입니다.
해시값이 같더라도 서로 다른 Key일 수 있기 때문에 HashMap은 실제 Key를 추가로 비교해야 합니다.

- 참조가 동일하다면 `==` 비교만으로 동일성을 판단합니다.
- 참조가 다르다면 `equals()`를 통해 논리적 동일성을 판단합니다.

즉, `hashCode()`는 탐색할 위치를 결정하고, `equals()`는 실제 Key의 동일성을 판단하는 역할을 합니다.

---

# 오버라이딩하지 않으면?

사용자 정의 객체에서 두 메서드를 재정의하지 않으면 Object 클래스의 기본 구현을 사용합니다.

- hashCode(): 객체의 식별에 기반한 해시값을 반환합니다.
- equals(): `==` 연산과 동일하게 참조 동일성을 비교합니다.

따라서 내부 필드값이 같더라도 서로 다른 인스턴스라면 다른 Key로 취급됩니다.
논리적으로 동일한 객체를 같은 Key로 사용하려면 `hashCode()`와 `equals()`를 함께 재정의해야 합니다.

## String의 hashCode()와 equals()

String은 `hashCode()`와 `equals()`를 이미 오버라이딩한 클래스입니다.

- hashCode(): 문자열의 문자 값을 이용해 해시값을 계산합니다.
- equals(): 객체의 참조가 아닌 문자열의 내용을 비교합니다.

예를 들어 서로 다른 String 인스턴스라도 모두 `"hello"`라는 문자열을 가지고 있다면 동일한 해시값을 반환하며, `equals()`도 true를 반환합니다.
또한 String은 불변 객체이므로 생성 이후 문자열 내용이 변경되지 않아 HashMap의 Key로 사용하기 적합합니다.

---

# hashCode()와 equals()의 규약

Java에서는 두 메서드가 일관된 동일성 기준을 갖도록 다음 규약을 지켜야 합니다.

- `equals()`가 true라면 두 객체의 `hashCode()`는 반드시 같아야 합니다.
- `hashCode()`가 같더라도 `equals()`는 false일 수 있습니다.
- 동일성 판단에 사용되는 정보가 변경되지 않는다면 두 메서드의 결과도 일관되어야 합니다.

이 규약을 위반하면 논리적으로 동일한 Key를 조회하지 못하거나 중복 저장하는 문제가 발생할 수 있습니다.
따라서 두 메서드를 일관된 기준으로 구현하고, Key는 가능한 한 불변 객체로 사용하는 것이 좋습니다.

---

# 참고 자료

- [Java 21 API — Object.equals](<https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/Object.html#equals(java.lang.Object)>)
- [Java 21 API — Object.hashCode](<https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/Object.html#hashCode()>)
- [Java 21 API — HashMap](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/HashMap.html)
