# 한눈에 보기

Spring Batch는 정해진 양의 Record를 읽고 처리한 뒤 결과를 쓰는 Batch Application을 만들기 위한 Framework입니다.

Transaction 관리, Chunk 기반 처리, 작업 상태 기록, 재시작과 Skip·Retry 같은 반복적인 기반 기능을 제공합니다. 사용자의 HTTP 요청을 즉시 처리하는 Web 흐름과 목적이 다릅니다.

Spring Batch는 작업을 특정 시각에 시작하는 Scheduler 자체가 아닙니다. 필요하면 Scheduler나 외부 실행 환경이 Spring Batch Job을 시작하도록 구성합니다.

---

# 개발자가 개입하는 지점

개발자는 Job과 Step을 구성하고, 데이터를 읽는 Reader, 처리하는 Processor와 쓰는 Writer를 작성합니다. 처리 단위, Transaction 범위와 실패 정책도 정합니다.

---

# 참고 자료

- [Spring Batch](https://spring.io/projects/spring-batch/)
- [Spring Batch — Introduction](https://docs.spring.io/spring-batch/reference/spring-batch-intro.html)
