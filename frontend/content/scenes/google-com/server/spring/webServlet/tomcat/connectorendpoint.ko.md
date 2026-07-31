# 개요

Tomcat Connector는 외부 network 요청을 받아 Container의 request processing으로 연결합니다. Endpoint는 socket을 열고 connection을 수신하며, 설정된 thread와 I/O 방식으로 data를 읽습니다.

Connector는 HTTP/1.1, HTTP/2 같은 protocol configuration과 port, timeout, 최대 connection 수 등의 server 경계를 가집니다. Endpoint가 받은 byte는 다음 단계의 Protocol Processor가 HTTP message로 해석합니다.

port bind 실패, TLS 설정 오류와 connection 제한 문제는 Spring ApplicationContext나 Controller보다 이 계층에서 발생합니다.

# 참고 자료

- [Apache Tomcat — Connectors](https://tomcat.apache.org/tomcat-11.0-doc/config/http.html)
- [Apache Tomcat — Architecture Overview](https://tomcat.apache.org/tomcat-11.0-doc/architecture/index.html)
