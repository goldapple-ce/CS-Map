# 개요

사용 가능한 Bean은 생성, 의존성 주입, 후처리와 초기화 Callback을 마치고 애플리케이션에서 조회하거나 주입받을 수 있는 상태의 객체입니다.

필요한 경우 이 객체는 원본 instance가 아니라 `BeanPostProcessor`가 만든 AOP Proxy일 수 있습니다. 호출자는 일반적으로 Container가 노출한 최종 Bean을 사용해야 transaction이나 method security 같은 부가 기능을 적용받을 수 있습니다.

singleton Bean은 보통 ApplicationContext가 종료될 때 destruction callback도 실행합니다. prototype처럼 scope가 다르면 생성과 종료 관리 범위도 달라질 수 있습니다.

# 참고 자료

- [Spring Framework — Bean Lifecycle](https://docs.spring.io/spring-framework/reference/core/beans/factory-nature.html)
