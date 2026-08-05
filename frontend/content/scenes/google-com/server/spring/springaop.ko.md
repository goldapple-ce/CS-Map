# 한눈에 보기

Spring AOP는 여러 Bean에 반복되는 공통 기능을 핵심 로직과 분리해 적용하는 기능입니다.

로깅, transaction과 method security가 대표적인 예입니다. Spring AOP는 일반적으로 대상 Bean 앞에 Proxy를 만들고, 외부에서 들어오는 method 호출을 가로채 공통 기능을 실행한 뒤 실제 객체를 호출합니다.

---

# 구성 요소

- `Aspect`: 공통 기능과 적용 조건을 하나로 모은 모듈입니다.
- `Join Point`: 공통 기능이 끼어들 수 있는 실행 지점입니다. Spring AOP에서는 Bean의 method 실행을 뜻합니다.
- `Pointcut`: 어떤 method 실행에 적용할지를 고르는 조건입니다.
- `Advice`: 선택된 method의 전후 또는 주변에서 실제로 실행할 코드입니다.
- `Target`: 공통 기능이 적용되는 원본 Bean입니다.
- `Proxy`: 호출을 먼저 받아 Advice를 실행한 뒤 Target으로 넘기는 객체입니다.

```text
호출자 → Proxy → Advice → Target method
```

`@Before`, `@AfterReturning`, `@AfterThrowing`, `@After`와 `@Around`처럼 실행 시점에 따라 여러 Advice를 사용할 수 있습니다.

---

# Proxy란

Proxy는 Target과 같은 역할을 대신 노출하면서 method 호출 앞뒤에 추가 동작을 넣는 객체입니다. AOP가 적용된 Bean을 주입받으면 실제로는 원본 Target이 아니라 Proxy를 받을 수 있습니다.

- `JDK Dynamic Proxy` : Target이 구현한 interface를 기반으로 Proxy를 만듭니다.
- `CGLIB Proxy` : Target class를 상속한 하위 class를 runtime에 만들어 Proxy로 사용합니다.
  - 상속과 method override를 이용하므로 `final` class, `final` method와 `private` method에는 적용할 수 없습니다.

일반적인 Spring Boot 애플리케이션에서는 spring.aop.proxy-target-class의 기본값이 true이므로 `CGLIB Proxy를 사용`합니다. 따라서 Target이 `interface를 구현했는지 여부만으로 Proxy 종류가 바뀌지 않습니다.`

---

# 개발자가 개입하는 지점

직접 공통 기능을 만들 때는 Aspect, Pointcut과 Advice를 작성합니다.

```java
@Aspect
@Component
class LoggingAspect {

    @Around("execution(* com.example.service..*(..))")
    Object log(ProceedingJoinPoint joinPoint) throws Throwable {
        System.out.println("호출 전");
        try {
            return joinPoint.proceed();
        } finally {
            System.out.println("호출 후");
        }
    }
}
```

`execution(...)` Pointcut이 적용할 method를 고르고, `@Around` method가 Advice가 됩니다. `joinPoint.proceed()`를 호출해야 실제 Target method가 실행됩니다.

직접 Aspect를 작성하지 않더라도 `@Transactional`, method security와 caching annotation을 사용하면 Spring이 준비한 Advisor와 Advice를 통해 Proxy를 적용할 수 있습니다.

---

# 꼭 알아둘 점

## private method에는 Proxy 기반 AOP가 적용되지 않습니다

private method는 외부에서 Proxy를 통해 호출할 수 없고 CGLIB에서도 override할 수 없습니다. AOP를 적용할 동작은 외부에서 Proxy를 통해 호출 가능한 method로 설계해야 합니다.

## Self-invocation은 Proxy를 거치지 않습니다

같은 객체의 method가 `this`를 통해 다른 method를 호출하면 호출이 Proxy 밖으로 나갔다가 다시 들어오지 않습니다. 따라서 내부 호출 대상에 붙은 `@Transactional` 같은 Advice가 실행되지 않을 수 있습니다.

```java
void outer() {
    this.inner(); // Proxy를 거치지 않음
}
```

가장 명확한 해결 방법은 AOP가 필요한 method를 별도 Bean으로 분리해, 다른 Bean에 주입된 Proxy를 통해 호출하는 것입니다.

## 모든 Bean이 Proxy가 되는 것은 아닙니다

등록된 Advisor의 Pointcut 조건에 맞는 Bean만 Proxy 적용 대상이 됩니다.

---

# 참고 자료

- [Spring Framework — Aspect Oriented Programming](https://docs.spring.io/spring-framework/reference/core/aop.html)
- [Spring Framework — AOP Concepts](https://docs.spring.io/spring-framework/reference/core/aop/introduction-defn.html)
- [Spring Framework — Proxying Mechanisms](https://docs.spring.io/spring-framework/reference/core/aop/proxying.html)
- [Spring Boot — Aspect-Oriented Programming](https://docs.spring.io/spring-boot/reference/features/aop.html)
