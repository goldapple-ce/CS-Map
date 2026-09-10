# 한눈에 보기

RESP(Redis Serialization Protocol)는 Client가 Redis Server에 Command를 보내고 응답을 받을 때 사용하는 프로토콜입니다.

---

# 왜 별도의 Protocol을 만들었을까?

HTTP 같은 기존 프로토콜을 사용할 수도 있지만, Redis가 주고받는 데이터는 대부분 GET, SET, INCR처럼 짧고 정형화된 Command입니다.

그래서 Redis는 Command를 단순하게 표현하고, 빠르게 Parsing할 수 있는 전용 Protocol인 RESP를 사용합니다.

RESP의 설계 목표도 명확합니다.

- Simple to implement
- Fast to parse
- Human readable

즉 범용적인 기능을 제공하기보다, Redis Command를 단순하고 `적은 비용으로 주고받는 것에 집중`한 Protocol입니다.

---

# 어떤 형식일까?

RESP는 첫 번째 문자(Prefix)로 데이터의 타입을 구분합니다. 타입은 다음처럼 5개가 존재합니다.

- `+` : Simple String
- `-` : Error
- `:` : Integer
- `$` : Bulk String
- `*` : Array

Simple

---

# 실제 Command는 어떻게 표현될까?

예를 들어 다음과 같은 명령을 실행한다고 해보겠습니다.

```
SET hello world
```

해당 Command는 다음과 같이 전달됩니다.

```
*3\r\n
$3\r\nSET\r\n
$5\r\nhello\r\n
$5\r\nworld\r\n
```

여기서 *3은 3개의 요소를 가진 Array를 의미하며, $3, $5는 $는 Bulk String을 의미하고, 뒤의 숫자는 이어지는 데이터의 Byte 길이를 나타냅니다.

---

# 왜 Length를 먼저 전달할까?

Bulk String은 다음에 있는 데이터의 Byte 길이를 전달합니다. 왜그럴까요?

만약 구분자를 기준으로 데이터를 나눈다면 Parser는 Payload를 읽으면서 데이터가 어디에서 끝나는지 찾아야 합니다.

```
SET, hello, world
```

이 경우 Parser는 ,가 나올 때까지 데이터를 탐색해야 합니다. 또한 실제 데이터에 ,가 포함된다면 이를 구분하기 위한 별도의 Escape 규칙도 필요합니다.

반면 데이터 Length를 알고 있다면 $5를 읽는 순간 다음 5 Byte가 데이터라는 것을 알 수 있습니다.
따라서 Payload 내부에서 끝을 찾기 위한 탐색이 필요 없고, 데이터 안에 어떤 문자가 들어있는지도 신경 쓸 필요가 없습니다. 결과적으로 Parsing 과정이 단순해지고 처리 비용도 줄어듭니다.

---

# 참고 자료

- [Redis — RESP protocol specification](https://redis.io/docs/latest/develop/reference/protocol-spec/)
- [Redis — Pipelining](https://redis.io/docs/latest/develop/using-commands/pipelining/)
