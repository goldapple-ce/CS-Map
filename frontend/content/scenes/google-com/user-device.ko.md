# 한눈에 보기

사용자 기기에서는 Browser나 OS가 이전에 확인한 Domain Name과 IP 주소의 대응 관계를 일정 시간 Cache할 수 있습니다.

```text
Domain Name의 IP 주소 필요
        ↓
사용자 기기의 Cache 확인
        ├─ Cache Hit  → 저장된 IP 주소 사용
        └─ Cache Miss → 외부 DNS에 Query
```

이 Map의 사용자 기기 Topic은 CPU나 Memory 같은 내부 Hardware 구조를 보여주기보다, 외부 DNS에 질의하기 전에 기기 내부 Cache가 사용될 수 있다는 점만 다룹니다.

---

# Cache는 어디에 있나요?

Browser가 자체적으로 이름 확인 결과를 보관할 수도 있고, 운영체제의 DNS Client나 관련 Service가 Cache할 수도 있습니다. 실제 저장 위치와 동작은 Browser와 OS에 따라 달라집니다.

여기서는 이러한 구현 차이를 하나의 `사용자 기기 Cache`로 단순화합니다.

사용자 기기에서 Cache Miss가 발생하더라도 Recursive Resolver의 Cache에는 답이 남아 있을 수 있습니다. 이 경우 Resolver는 Root DNS부터 다시 확인하지 않고 Cache된 DNS Record를 반환할 수 있습니다.

---

# TTL이 끝나면

DNS Record의 TTL이 남아 있는 동안에는 이전에 받은 IP 주소를 재사용할 수 있습니다. TTL이 끝나거나 Cache가 제거되면 외부 DNS에 다시 Query합니다.

Authoritative DNS의 Record를 변경해도 사용자 기기와 여러 Recursive Resolver에 남은 Cache가 즉시 모두 사라지는 것은 아닙니다. DNS 변경이 여러 사용자에게 점진적으로 반영될 수 있는 이유입니다.

---

# 개발자가 개입하는 지점

일반적인 Web Application 개발자가 Browser나 OS의 DNS Cache를 직접 제어하지는 않습니다.

Domain을 운영한다면 Authoritative DNS의 Record와 TTL을 설정합니다. DNS 장애나 Record 변경을 확인할 때는 사용자 기기의 Cache, Recursive Resolver의 Cache와 Authoritative DNS의 현재 응답을 구분해야 합니다.

---

# 참고 자료

- [RFC 1034 — Domain Names, Concepts and Facilities](https://www.rfc-editor.org/rfc/rfc1034.html)
- [RFC 1035 — Domain Names, Implementation and Specification](https://www.rfc-editor.org/rfc/rfc1035.html)
