# 한눈에 보기

I/O Multiplexing은 하나의 Event Loop가 여러 Client Connection을 지켜보다가, 읽거나 쓸 준비가 된 Connection만 처리하는 방식입니다.

Redis는 Socket을 Non-blocking으로 사용하므로 응답이 없는 Connection 하나를 기다리느라 다른 Connection의 요청까지 멈추지 않습니다.

---

# 여러 Connection을 다루는 방법

```text
Client A ─┐
Client B ─┼─ I/O Multiplexing ─ 준비된 Connection의 요청 처리
Client C ─┘
```

Blocking I/O에서는 한 Connection의 입력을 기다리는 동안 실행 흐름이 멈출 수 있습니다. Non-blocking I/O는 지금 처리할 데이터가 없으면 기다리지 않고 돌아옵니다.

I/O Multiplexing은 여러 Connection 가운데 현재 처리할 수 있는 Connection을 한 번에 확인합니다. 덕분에 Connection마다 Command 실행 Thread를 하나씩 만들지 않고도 많은 Client를 다룰 수 있습니다.

---

# epoll과의 관계

`epoll`은 Linux가 제공하는 I/O Multiplexing 기능입니다. Redis는 운영체제에 맞는 기능을 사용하며, macOS나 BSD 계열에서는 `kqueue` 같은 다른 기능을 사용할 수 있습니다.

따라서 Redis의 구조를 설명할 때는 상위 개념인 `I/O Multiplexing`과 `Non-blocking I/O`를 사용하고, `epoll`은 Linux에서의 구현 예시로 이해하면 됩니다.

---

# 빠른 이유

Redis는 아무 요청도 보내지 않는 Connection을 붙잡고 기다리지 않습니다. 준비된 요청을 빠르게 찾아 Command 처리로 넘기므로 적은 수의 Thread로도 많은 Connection을 효율적으로 다룰 수 있습니다.

다만 I/O가 효율적이라는 것이 느린 Command의 실행 시간까지 줄여 주는 것은 아닙니다. 큰 데이터를 순회하는 Command가 실행되면 뒤의 Command는 기다릴 수 있습니다.

---

# 개발자가 개입하는 지점

개발자가 Redis Server의 `epoll`을 직접 호출하거나 I/O Multiplexing을 구현할 일은 거의 없습니다.

그럼에도 이 구조를 알면 Connection 수를 무작정 늘리는 것이 곧 처리 성능을 높이는 것은 아니며, 큰 요청과 응답이나 느린 Command가 지연을 만들 수 있다는 점을 이해할 수 있습니다. Client의 Connection 관리, Timeout과 Pipelining 크기는 개발자가 조정할 수 있습니다.

---

# 참고 자료

- [Redis — Client Handling](https://redis.io/docs/latest/develop/reference/clients/)
- [Redis — Latency](https://redis.io/docs/latest/operate/oss_and_stack/management/optimization/latency/)
- [Redis — Benchmarking](https://redis.io/docs/latest/operate/oss_and_stack/management/optimization/benchmarks/)
