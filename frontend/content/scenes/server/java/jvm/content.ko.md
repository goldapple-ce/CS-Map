# 한눈에 보기

JVM(Java Virtual Machine)은 Java Bytecode를 실행하는 가상 머신입니다.

JVM의 핵심 역할 중 하나는 Java Application과 OS 사이에서 중간 계층 역할을 하여 플랫폼에 독립적으로 프로그램을 실행할 수 있도록 하는 것입니다.  
또한 Application 실행에 필요한 Memory를 관리하고 Garbage Collection과 같은 기능을 제공합니다.

---

# 구성 요소

JVM은 크게 Class Loader, Runtime Data Area, Execution Engine으로 나눠 볼 수 있습니다.

- `Class Loader`: 실행에 필요한 Class를 찾아 JVM에 불러오고 사용할 수 있는 상태로 준비합니다.
- `Runtime Data Area`: Java Application을 실행하면서 필요한 데이터를 저장하고 관리하는 Memory 영역입니다.
  - `Method Area`: Class 구조, Method Bytecode, Static Field 등 Class 단위 정보를 여러 Thread가 공유합니다.
  - `Heap`: 객체와 배열이 생성되는 영역으로 여러 Thread가 공유하며 Garbage Collector의 주요 관리 대상입니다.
  - `PC Register`: 각 Thread가 현재 실행 중인 JVM 명령의 위치를 추적합니다.
  - `JVM Stack`: 각 Thread의 Java Method 호출에 필요한 Stack Frame을 관리합니다.
  - `Native Method Stack`: 각 Thread의 Native Method 실행을 지원합니다.
- `Execution Engine`: Runtime Data Area에 적재된 Bytecode를 실제로 실행합니다.
  - `Interpreter`: Java Bytecode 명령을 하나씩 해석하여 실행합니다.
  - `JIT Compiler`: Application 실행 중 자주 실행되는 Method나 Code 구간을 현재 CPU가 직접 실행할 수 있는 기계어로 컴파일합니다.
  - `Garbage Collector`: Heap에서 더 이상 사용할 수 없는 객체가 차지한 Memory를 찾아 회수합니다.

---

# JVM 구성 요소를 이해해야 하는 이유

JVM을 이해하면 Memory 사용, GC, 성능 저하, 동시성 문제, Runtime 오류가 왜 발생하는지 더 깊게 분석할 수 있습니다.

- `Class Loader`: Runtime Class Loading 문제나 의존성 충돌 문제를 분석하는 데 도움이 됩니다.
- `Runtime Data Area`: `OutOfMemoryError`, `StackOverflowError`, 과도한 Heap 사용 같은 Memory 문제를 분석하는 데 도움이 됩니다.
- `Interpreter`: Bytecode가 실행되는 과정을 파악해 Java Code가 Runtime에서 실제로 어떻게 수행되는지 추적하는 데 도움이 됩니다.
- `JIT Compiler`: Warm-up 전후의 성능 차이, Benchmark 결과 편차, 특정 Code 구간의 Runtime 최적화 문제를 분석하는 데 도움이 됩니다.
- `Garbage Collector`: GC로 인한 응답 지연, CPU 사용량 증가, Heap 사용량 증가 같은 성능 문제를 분석하는 데 도움이 됩니다.

---

# Heap, JVM Stack, Method Area 비교

Heap, JVM Stack, Method Area는 모두 Java Application 실행에 필요한 데이터를 저장하지만 역할이 다릅니다.  
같은 코드라도 Class 정보는 Method Area, 실제 객체는 Heap, Method 실행 중 사용하는 Local Variable과 호출 정보는 JVM Stack에서 관리됩니다.

이 차이를 이해하면 `Class Variable`, `Instance Variable`, `Local Variable`이 왜 서로 다르게 동작하는지와 상속·다형성이 Runtime에서 어떻게 연결되는지 이해하기 쉬워집니다.

## 기본 비교

- `Method Area`: Class의 구조, Field, Method, Bytecode 같은 Class 단위 정보를 관리합니다.
- `Heap`: `new`로 생성된 객체와 배열을 저장합니다.
- `JVM Stack`: 각 Thread의 Method 호출과 Local Variable, Operand Stack 같은 실행 정보를 관리합니다.

가장 단순하게 보면 다음과 같습니다.

- Class 자체에 대한 정보 → `Method Area`
- 실제 생성된 객체 → `Heap`
- 지금 실행 중인 Method의 정보 → `JVM Stack`

## Class Variable, Instance Variable, Local Variable

다음 Class가 있다고 가정합니다.

```java
class Cat {
    static int count = 0;
    int age;

    void grow() {
        int nextAge = age + 1;
        age = nextAge;
    }
}
```

`count`, `age`, `nextAge`는 모두 변수지만 존재하는 단위가 다릅니다.

- `count`: Class에 속하는 Class Variable입니다.
- `age`: 각각의 Cat 객체에 속하는 Instance Variable입니다.
- `nextAge`: `grow()`가 실행되는 동안만 사용하는 Local Variable입니다.

따라서 개념적으로 다음과 같이 연결할 수 있습니다.

- Class Variable → Class 단위 정보
- Instance Variable → Heap의 객체 내부
- Local Variable → JVM Stack의 Stack Frame

실제 HotSpot JVM에서 `static` Field 값의 물리적 저장 위치는 구현 세부사항이 있으므로, 여기서는 `Class 단위로 관리된다`는 점에 집중하는 것이 좋습니다.

## 객체를 생성하면 어떻게 될까

다음 코드를 보겠습니다.

```java
Cat cat = new Cat();
cat.age = 3;
```

`new Cat()`으로 생성된 실제 Cat 객체는 Heap에 존재합니다.  
`age = 3`이라는 값도 해당 Cat 객체의 Instance Field이므로 객체 안에서 관리됩니다.

반면 `cat`은 객체 자체가 아니라 Heap의 Cat 객체를 가리키는 Local Reference입니다.  
따라서 `cat`은 현재 Method의 Stack Frame에서 관리될 수 있습니다.

즉 다음처럼 구분할 수 있습니다.

- `Cat`이라는 Class 정보 → Method Area
- `new Cat()` 객체 → Heap
- `cat` Reference → JVM Stack

## 같은 Class로 여러 객체를 만들면

다음 코드를 보겠습니다.

```java
Cat cat1 = new Cat();
Cat cat2 = new Cat();

cat1.age = 3;
cat2.age = 7;
```

`cat1`과 `cat2`는 서로 다른 두 객체를 가리킵니다.  
따라서 Heap에는 서로 다른 Cat 객체가 존재하고 각각 자신의 `age` 값을 가집니다.

하지만 두 객체가 사용하는 Class 구조와 `grow()` Method Bytecode는 동일합니다.  
Class 정보까지 객체마다 복사할 필요가 없기 때문에 Class 단위 정보는 공유됩니다.

이 차이 때문에 Instance Field는 객체마다 값이 다를 수 있지만 Method 정의나 Class 구조는 여러 객체가 함께 사용할 수 있습니다.

## 상속이 들어가면 어떻게 될까

다음과 같은 상속 구조가 있다고 가정합니다.

```java
class Animal {
    int age = 1;

    void sound() {
        System.out.println("animal");
    }
}

class Cat extends Animal {
    int age = 2;

    @Override
    void sound() {
        System.out.println("cat");
    }
}
```

그리고 다음 코드를 실행합니다.

```java
Animal animal = new Cat();

System.out.println(animal.age);
animal.sound();
```

결과는 다음과 같습니다.

```text
1
cat
```

같은 `animal`을 사용했지만 Field와 Method는 서로 다른 기준으로 선택됩니다.

## Field는 Reference Type을 기준으로 봅니다

```java
System.out.println(animal.age);
```

`animal`의 Reference Type은 `Animal`입니다.  
Field는 Instance Method처럼 Runtime에 실제 객체 Type을 기준으로 Override되지 않습니다.

따라서 `Animal.age`가 선택되어 `1`이 출력됩니다.

`Cat`에도 같은 이름의 `age`가 있지만 부모 Field를 Override한 것이 아니라 별도의 Field를 가린 `Field Hiding`으로 보는 것이 맞습니다.

## Instance Method는 실제 객체 Type을 기준으로 봅니다

```java
animal.sound();
```

`animal`의 Reference Type은 `Animal`이지만 실제 Heap에 존재하는 객체는 `Cat`입니다.  
`Cat`이 `sound()`를 Override했기 때문에 Runtime에는 `Cat.sound()`가 실행됩니다.

이처럼 Override된 Instance Method는 실제 객체 Type을 기준으로 선택될 수 있습니다.  
이를 Dynamic Method Dispatch와 연결해서 볼 수 있습니다.

따라서 다음처럼 구분할 수 있습니다.

- Field 접근 → Reference Type 기준
- Override된 Instance Method → 실제 객체 Type 기준

## static Method는 다르게 동작합니다

다음 코드가 있다고 가정합니다.

```java
class Animal {
    static void type() {
        System.out.println("animal");
    }
}

class Cat extends Animal {
    static void type() {
        System.out.println("cat");
    }
}
```

다음과 같이 호출하면:

```java
Animal animal = new Cat();
animal.type();
```

결과는 `animal`이 실제 Cat 객체를 가리켜도 `animal`이 출력됩니다.

`static` Method는 객체가 아니라 Class에 속하기 때문에 Instance Method처럼 Override되지 않습니다.  
같은 이름의 `static` Method를 자식 Class에 선언하면 `Method Hiding`으로 동작하며 Reference Type을 기준으로 결정됩니다.

그래서 `static` Method는 객체 Reference보다 다음처럼 Class 이름으로 호출하는 것이 더 명확합니다.

```java
Animal.type();
Cat.type();
```

## 세 영역을 같이 보면

다음 한 줄에는 세 영역이 모두 연결됩니다.

```java
Animal animal = new Cat();
```

`Animal`, `Cat`의 Class 구조와 Method 정보는 Method Area와 연결됩니다.  
`new Cat()`으로 생성된 실제 객체는 Heap에 존재합니다.  
`animal`이라는 Local Reference는 현재 Method의 JVM Stack에서 관리될 수 있습니다.

그리고 `animal.sound()`가 호출되면 JVM은 Heap의 실제 객체가 `Cat`이라는 정보와 Class 정보를 이용해 실행할 Method를 결정합니다.

즉 Runtime Data Area의 각 영역은 따로 존재하지만 실제 Application 실행에서는 서로 연결되어 동작합니다.

---

# 참고 자료

- [Java Virtual Machine Specification](https://docs.oracle.com/javase/specs/jvms/se21/html/)
- [Java Virtual Machine Specification — Run-Time Data Areas](https://docs.oracle.com/javase/specs/jvms/se21/html/jvms-2.html#jvms-2.5)
- [Oracle Java — Java HotSpot Virtual Machine Performance Enhancements](https://docs.oracle.com/en/java/javase/21/vm/java-hotspot-virtual-machine-performance-enhancements.html)
