# 개요

WebSocket은 최초 HTTP handshake 이후 하나의 연결에서 서버와 클라이언트가 양방향으로 message를 주고받는 protocol입니다. 매 message마다 새로운 HTTP 요청·응답을 만드는 방식과 다릅니다.

Servlet 기반 애플리케이션에서는 handshake 요청이 Servlet Container와 보안 Filter를 통과할 수 있습니다. 하지만 upgrade가 완료된 뒤의 WebSocket message가 매번 `DispatcherServlet`을 호출하는 것은 아닙니다.

Spring Framework는 낮은 수준의 `WebSocketHandler`와, STOMP를 이용한 message 처리 모델을 제공합니다. WebSocket 인증에서는 handshake 시점의 HTTP principal을 활용할 수 있지만, message 단위 인가는 별도의 messaging 보안 규칙을 함께 고려해야 합니다.

# 참고 자료

- [Spring Framework — WebSockets](https://docs.spring.io/spring-framework/reference/web/websocket.html)
- [Spring Security — WebSocket Security](https://docs.spring.io/spring-security/reference/servlet/integrations/websocket.html)
