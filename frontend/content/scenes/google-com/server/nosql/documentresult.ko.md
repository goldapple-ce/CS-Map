# 한눈에 보기

Document 결과는 query filter를 만족한 BSON document 또는 변경 작업의 처리 결과입니다.

MongoDB Driver는 BSON을 Java의 Document, domain 객체나 projection type으로 변환할 수 있습니다.

---

# 결과 읽기

```java
FindIterable<Document> results = collection.find(
    Filters.eq("status", "ACTIVE")
);

for (Document document : results) {
    String email = document.getString("email");
}
```

많은 결과를 한 번에 memory에 올리지 않도록 Driver는 보통 cursor와 batch 단위로 document를 가져옵니다. cursor 수명과 timeout, batch 크기는 Driver와 Server 설정의 영향을 받습니다.

projection을 사용하면 필요한 field만 반환하여 network 전송량과 객체 변환 비용을 줄일 수 있습니다.

---

# 개발자가 개입하는 지점

개발자는 필요한 field와 document 수만 반환하도록 projection, sort와 limit을 지정합니다.

이 Topic 자체에 별도의 저장소 구성 지점은 없습니다. 그래도 결과 크기, cursor와 BSON 변환 비용을 알면 query 실행 뒤 애플리케이션에서 생기는 지연을 분석하는 데 도움이 됩니다.

---

# 헷갈리기 쉬운 점

## query 실행이 빠르면 응답도 항상 빠른 것은 아닙니다

큰 document를 많이 반환하면 network 전송, BSON decoding과 Java 객체 생성에 더 많은 시간이 들 수 있습니다.

## Driver 결과 객체가 Database에 계속 연결된 Entity는 아닙니다

JPA의 managed Entity와 달리 일반적인 MongoDB Driver 결과는 Persistence Context가 변경을 추적하지 않습니다. 값을 바꿨다면 별도의 update 또는 replace 작업을 요청해야 합니다.

---

# 참고 자료

- [MongoDB Java Driver — Find Operations](https://www.mongodb.com/docs/drivers/java/sync/current/crud/query-documents/find/)
- [MongoDB — Project Fields](https://www.mongodb.com/docs/manual/tutorial/project-fields-from-query-results/)
