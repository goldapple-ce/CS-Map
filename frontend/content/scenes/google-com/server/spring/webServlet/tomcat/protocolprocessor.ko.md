# 개요

Protocol Processor는 Connector가 받은 data를 HTTP protocol에 따라 해석하고 request와 response 처리 상태를 관리합니다.

HTTP method, target, header와 body framing을 parsing하고, keep-alive나 protocol별 처리 규칙을 적용합니다. 정상적으로 해석된 요청은 Adapter를 통해 Tomcat의 Servlet 처리 영역으로 넘어갑니다.

Scene의 Protocol Processor는 특정 구현 class 하나만을 뜻하기보다 Coyote의 protocol 처리 역할을 나타냅니다. 실제 구현은 선택한 HTTP protocol과 Connector 설정에 따라 달라집니다.

# 참고 자료

- [Apache Tomcat — Architecture Overview](https://tomcat.apache.org/tomcat-11.0-doc/architecture/index.html)
