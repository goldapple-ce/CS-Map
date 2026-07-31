# 개요

Spring의 Data Access 영역은 애플리케이션이 관계형 데이터베이스와 다른 저장소를 일관된 방식으로 사용할 수 있도록 돕습니다.

Spring Framework는 JDBC 지원, transaction 추상화와 ORM 통합을 제공합니다. Spring Data 프로젝트는 Repository 추상화를 더해 저장소별 반복 코드를 줄입니다. 예를 들어 Spring Data JPA는 Repository interface를 바탕으로 구현 객체를 만들고, 이 객체를 Spring Bean으로 등록할 수 있습니다.

Data Access는 웹 계층의 하위 단계가 아닙니다. HTTP 요청에서 Service가 호출할 수도 있지만 batch 작업이나 message 처리에서도 같은 transaction과 Repository를 사용할 수 있습니다.

# 참고 자료

- [Spring Framework — Data Access](https://docs.spring.io/spring-framework/reference/data-access.html)
- [Spring Data — Introduction](https://docs.spring.io/spring-data/commons/reference/repositories/introduction.html)
