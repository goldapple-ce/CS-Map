# 한눈에 보기

Pass By Value(값에 의한 전달)란 메서드를 호출할 때 전달하는 인자의 값을 복사하여 매개변수에 전달하는 방식입니다.  
Java는 기본형과 참조형 모두 Pass By Value 방식을 사용합니다.

여기서 핵심은 `원본 변수가 전달되는 것이 아니라, 원본 변수에 저장된 값이 복사되어 전달된다`는 것입니다.  
따라서 메서드 내부에서 매개변수에 다른 값을 할당해도 호출한 쪽의 변수에는 영향을 주지 않습니다.

---

# Pass By Value란

Pass By Value는 메서드를 호출할 때 전달하는 인자(Argument)의 값을 복사하여 매개변수(Parameter)에 전달하는 방식을 의미합니다.  
Java는 이러한 Pass By Value 방식을 사용하도록 설계된 언어입니다. 여기서 중요한 점은 `값을 복사한다`는 것입니다.

---

# 무슨 의미일까?

이 값이 복사된다는 게 실제 코드에서는 어떤 의미를 가질까요? 다음 코드를 봅시다.

```java
public class Main {
    public static void main(String[] args) {
        int number = 10;

        change(number);

        System.out.println(number);
    }

    static void change(int value) {
        value = 20;
    }
}
```

프린트에서는 어떤 값이 출력될 것으로 예상하나요?  
change() 메서드에서 전달받은 값을 20으로 변경했으니 20이 출력될까요?  
정답은 `10`입니다. Java는 Pass By Value 방식으로 인자를 전달하기 때문입니다. change(number)를 호출할 때 number라는 변수 자체가 전달되는 것이 아닙니다.  
number에 저장된 값인 10이 복사되어 value라는 매개변수에 전달됩니다. 따라서 `number와 value는 서로 독립적인 변수`입니다.  
결국 value = 20이라는 코드는 복사된 값을 변경할 뿐, 원래 변수인 number에는 영향을 주지 않습니다.

## 그렇다면 객체를 전달하면 어떨까요?

이번에는 기본형이 아닌 참조형을 전달해 보겠습니다.

```java
class Person {
    int age;

    Person(int age) {
        this.age = age;
    }
}

public class Main {
    public static void main(String[] args) {
        Person person = new Person(10);

        change(person);

        System.out.println(person.age);
    }

    static void change(Person p) {
        p.age = 20;
        p = new Person(30);
    }
}
```

이번에는 어떤 값이 출력될까요?  
정답은 `20`입니다. Java에서는 객체를 전달할 때도 Pass By Value가 적용됩니다. 다만 기본형과 달리 `객체 자체가 아니라 객체를 가리키는 참조값이 복사됩니다.`  
따라서 person과 p는 서로 다른 변수이지만, 처음에는 동일한 객체를 참조합니다. 이 때문에 p.age = 20은 원래 객체의 상태를 변경합니다.  
반면 p = new Person(30)은 복사된 참조값을 가지고 있는 변수 p가 새로운 객체를 가리키도록 변경하는 것일 뿐, person이 가리키는 객체를 변경하지는 않습니다.  
즉, `객체의 상태를 변경하는 것과 참조 변수에 새로운 객체를 할당하는 것은 서로 다른 동작`입니다.
