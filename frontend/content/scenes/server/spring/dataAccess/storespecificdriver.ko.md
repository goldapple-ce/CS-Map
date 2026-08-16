# 한눈에 보기

전용 Driver는 Java 애플리케이션과 특정 NoSQL 저장소 사이의 실제 연결과 통신을 담당합니다.

MongoDB Driver나 Redis의 Lettuce·Jedis처럼 저장소의 명령과 network protocol을 이해하는 client library이며 JDBC Driver가 아닙니다.

---

# 동작 방식

1. 저장소 server와 network connection을 만듭니다.
2. Java 요청을 저장소 전용 message로 변환합니다.
3. 전용 protocol로 명령을 전송합니다.
4. 응답을 Java 값이나 저장소별 데이터 형식으로 변환합니다.

연결 관리와 Pool 방식도 Driver마다 다릅니다. 관계형 Database의 HikariCP와 DataSource 구조를 모든 저장소에 그대로 적용하면 안 됩니다.

---

# 개발자가 개입하는 지점

일반적인 Repository 코드에서는 Driver를 직접 호출하지 않지만 host, 인증, timeout, connection과 cluster 설정을 구성합니다.

이 구조를 알면 Repository 설정은 맞지만 저장소에 연결되지 않는 문제를 Spring Data module과 Driver 구간으로 나누어 확인할 수 있습니다.

---

# 참고 자료

- [MongoDB — Java Driver](https://www.mongodb.com/docs/drivers/java/sync/current/)
- [Spring Data Redis — Drivers](https://docs.spring.io/spring-data/redis/reference/redis/drivers.html)
