# 개요

Spring 애플리케이션 안에서 이벤트를 발행해 해당 이벤트를 구독하는 Listener에 전달하는 인터페이스입니다. `ApplicationContext`가 이 인터페이스를 상속합니다.

```java
void publishEvent(Object event)
```

---

# 사용 흐름

```text
이벤트 발행 Bean
→ ApplicationEventPublisher
→ ApplicationEventMulticaster
→ 일치하는 ApplicationListener 또는 @EventListener
```

발행자는 Listener를 직접 알 필요가 없습니다. Listener는 이벤트 타입을 기준으로 등록되며 `ApplicationListener`를 구현하거나 Bean 메서드에 `@EventListener`를 붙일 수 있습니다.

기본 `ApplicationEventMulticaster`는 일반적으로 발행한 호출 스레드에서 Listener를 동기 실행합니다. `publishEvent()` 호출 자체가 항상 비동기 실행을 뜻하지 않습니다. 비동기 처리가 필요하다면 Multicaster의 실행기나 `@Async` 같은 별도 구성이 필요합니다.

---

# 사용할 때의 경계

Application Event는 같은 `ApplicationContext` 안의 Spring Bean들이 느슨하게 통신하는 데 적합합니다. 프로세스 밖의 다른 서비스에 전달되는 내구성 있는 메시지나 트랜잭션 메시징을 자동으로 제공하는 기능은 아닙니다.

---

# 참고 자료

- [Spring Framework - ApplicationEventPublisher API](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/context/ApplicationEventPublisher.html)
- [Spring Framework - ApplicationContext Event](https://docs.spring.io/spring-framework/reference/core/beans/context-introduction.html#context-functionality-events)
