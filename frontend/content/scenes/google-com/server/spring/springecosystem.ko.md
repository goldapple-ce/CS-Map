# 한눈에 보기

Spring 생태계는 Spring Framework와 그 위에서 특정 문제를 해결하는 여러 Spring 프로젝트를 함께 가리킵니다. 하나의 library나 실행 중인 Container를 뜻하는 말은 아닙니다.

---

# 주요 프로젝트

- `Spring Framework`: IoC Container, AOP, transaction, data access, Spring MVC와 WebFlux 같은 기반 기능을 제공합니다.
- `Spring Boot`: 자동 설정, starter와 내장 server를 이용해 Spring 애플리케이션을 빠르게 구성하고 실행하도록 돕습니다.
- `Spring Security`: 인증, 인가와 여러 보안 기능을 제공합니다.
- `Spring Data`: Repository 추상화와 저장소별 통합 기능을 제공합니다.
- `Spring Batch`: 대량 데이터를 일정한 단위로 처리하는 batch 작업을 지원합니다.

프로젝트마다 역할은 다르지만, 필요한 구성 요소를 Spring Bean으로 등록하고 의존성 주입과 생명주기 관리를 함께 활용할 수 있습니다.

---

# 개발자가 개입하는 지점

개발자는 애플리케이션에 필요한 Spring 프로젝트와 module만 선택해 조합합니다. 예를 들어 일반적인 웹 API라면 Spring Boot와 Spring MVC를 사용하고, 로그인에는 Spring Security, 데이터베이스 접근에는 Spring Data JPA를 추가할 수 있습니다.

모든 Spring 프로젝트를 배워야 애플리케이션을 만들 수 있는 것은 아닙니다. 현재 해결하려는 문제에 필요한 프로젝트부터 선택하는 것이 좋습니다.

---

# 헷갈리기 쉬운 점

## Spring은 하나의 제품만 가리키지 않을 수 있습니다

문맥에 따라 핵심 기반인 Spring Framework를 뜻하기도 하고, Spring Boot와 여러 프로젝트를 포함한 전체 생태계를 뜻하기도 합니다.

## Spring Boot가 Spring Framework를 대체하는 것은 아닙니다

Spring Boot 애플리케이션도 내부에서는 Spring Framework의 Container, Bean과 Web 기능을 사용합니다. Spring Boot는 이 구성과 실행을 편리하게 만드는 역할입니다.

---

# 참고 자료

- [Spring — Projects](https://spring.io/projects)
- [Spring Framework — Overview](https://docs.spring.io/spring-framework/reference/overview.html)
- [Spring Boot — Reference Documentation](https://docs.spring.io/spring-boot/index.html)
