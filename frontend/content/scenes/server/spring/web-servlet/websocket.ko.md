# 한눈에 보기

WebSocket은 서버와 클라이언트가 하나의 연결을 유지하면서 서로 message를 보낼 수 있게 하는 통신 방식입니다.

일반 HTTP처럼 클라이언트가 요청할 때만 서버가 응답하는 구조가 아니어서 채팅, 실시간 알림과 같이 양쪽이 자주 데이터를 보내야 하는 기능에 사용할 수 있습니다.

---

# 동작 방식

1. 클라이언트가 HTTP `Upgrade` header를 포함한 handshake 요청을 보냅니다.
2. 서버가 handshake를 허용하면 연결의 protocol이 WebSocket으로 전환됩니다.
3. 연결을 유지한 채 서버와 클라이언트가 양방향으로 message를 주고받습니다.
4. 어느 한쪽이 연결을 닫으면 통신이 종료됩니다.

Spring에서는 낮은 수준의 `WebSocketHandler`를 사용하거나, STOMP를 이용해 destination 단위로 message를 전달할 수 있습니다.

---

# 개발자가 개입하는 지점

개발자는 WebSocket endpoint와 message 처리 방식을 설정합니다. STOMP를 사용한다면 보통 다음과 같이 연결 주소와 message destination을 구성합니다.

```java
@Configuration
@EnableWebSocketMessageBroker
class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws");
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.setApplicationDestinationPrefixes("/app");
        registry.enableSimpleBroker("/topic");
    }
}
```

연결을 시작할 수 있는 사용자와 각 message destination에 접근할 수 있는 사용자도 함께 설계해야 합니다.

---

# 헷갈리기 쉬운 점

## WebSocket message가 매번 DispatcherServlet을 거치지는 않습니다

최초 handshake는 HTTP 요청이므로 Servlet Filter와 Spring Security의 영향을 받을 수 있습니다. 하지만 protocol 전환이 끝난 뒤 오가는 message는 일반적인 Spring MVC 요청 흐름과 별도로 처리됩니다.

## handshake 인증만으로 모든 인가가 끝나는 것은 아닙니다

handshake에서 확인한 사용자를 WebSocket session에 이어서 사용할 수 있지만, message별 destination 접근 권한은 messaging 보안 규칙으로 따로 제한해야 할 수 있습니다.

## 모든 실시간 기능에 WebSocket이 필요한 것은 아닙니다

서버에서 클라이언트로만 가끔 갱신하면 되는 기능은 SSE나 polling이 더 단순할 수 있습니다. 양방향 통신의 빈도와 연결 유지 비용을 함께 고려해야 합니다.

---

# 참고 자료

- [Spring Framework — WebSockets](https://docs.spring.io/spring-framework/reference/web/websocket.html)
- [Spring Framework — STOMP](https://docs.spring.io/spring-framework/reference/web/websocket/stomp.html)
- [Spring Security — WebSocket Security](https://docs.spring.io/spring-security/reference/servlet/integrations/websocket.html)
