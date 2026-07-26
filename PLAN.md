# PLAN

## 현재 상태

**3단계 Spring MVC 참고 배치 정정 완료 — 사용자 확인 대기**

## 이번 목표

기존 “구글 검색 요청” 콘텐츠를 “브라우저 주소창에 `google.com`을 입력하면 어떤 일이 발생하는가?” 시나리오로 교체하고, 사용자·DNS·Router·Server를 클릭해 내부로 확대할 수 있는 학습 경로를 만든다.

## 포함한 요청

- 루트 주제를 구글 검색 과정이 아니라 브라우저에서 `google.com`을 입력했을 때 발생하는 일로 변경한다.
- 루트 주요 흐름은 `사용자 → DNS → Router → Server` 순서로 표시한다.
- 브라우저 응답 처리와 렌더링 과정은 이번 콘텐츠에서 제외한다.
- 사용자 영역 안에서 브라우저와 서버가 함께 보이고, 서버 인증서 제공과 브라우저 인증서 검증 흐름을 설명한다.
- 요청·응답 방향을 구분할 수 있도록 화살표 위에 흐름 라벨을 표시한다.
- DNS에는 로컬/재귀 DNS, Root DNS, `.com` TLD DNS, 권한 DNS 등을 포함한다.
- Router는 DNS 뒤에 배치하고 기본 게이트웨이, 공유기/NAT, ISP와 인터넷 라우팅을 설명한다.
- Server는 Proxy Server, Application Server, Database로 구성하고 NGINX, Spring, SQL/NoSQL을 하위 학습 대상으로 둔다.
- Spring 기반 애플리케이션 아래에서 Tomcat, Spring Security, Spring MVC와 Spring Container의 역할을 더 깊게 탐색한다.

## 범위 결정

- 루트의 왼쪽에서 오른쪽 주요 흐름은 다음으로 고정한다.

```text
사용자/브라우저 → DNS → Router → Server
```

- 사용자 Scene은 전체 시간 순서를 다시 표현하는 장면이 아니라 브라우저와 원격 서버가 TLS 인증 과정에서 맡는 역할을 확대해 보여주는 장면으로 구성한다.
- `TLS 연결`을 별도 Topic으로 만들지 않는다. 브라우저와 원격 서버를 같은 Scene에 두고 다음 방향을 화살표와 라벨로 표시한다.

```text
브라우저 ── ClientHello ──→ 원격 서버
브라우저 ←─ 인증서 체인 제공 ── 원격 서버
브라우저: 인증서 체인·도메인·유효기간 검증
```

- 인증서 검증의 주체는 브라우저이며, 서버는 인증서 체인을 제공하는 역할로 구분한다.
- 화살표 라벨의 위치는 renderer가 선분을 기준으로 자동 계산하며 콘텐츠 작성자가 좌표를 입력하지 않는다.
- DNS Scene은 재귀 Resolver가 Root DNS, `.com` TLD DNS, 권한 DNS를 거쳐 IP 주소를 얻는 과정을 왼쪽에서 오른쪽으로 표시한다.
- Router Scene은 DNS 이후 실제 목적지로 패킷이 이동하는 학습 흐름으로 배치한다.
- Server Scene은 다음 구조를 사용한다.

```text
Proxy Server → Application Server → Database
     ↓                 ↓                 ↓
   NGINX             Spring          SQL / NoSQL
```

- NGINX, Spring, SQL/NoSQL은 이 학습 시나리오에서 사용하는 일반적인 서버 구성 가정이다. Google의 공개적으로 확인된 실제 내부 구현이라고 표현하지 않는다.
- SQL과 NoSQL은 특정 제품명이 아니라 데이터 저장 방식의 대표 분류로 설명한다.
- Spring 기반 애플리케이션은 Tomcat과 Spring 생태계로 나누고, Tomcat의 요청이 Servlet FilterChain을 거쳐 Spring MVC로 전달되는 경로를 설명한다.
- Spring 생태계 Scene은 Spring Security → Spring MVC 요청 흐름과 두 영역에 Bean을 제공하는 Spring Container의 지원 관계를 구분한다.
- Spring Container는 요청 흐름이 아니라 애플리케이션 시작 시 BeanDefinition, Bean 생성, 의존성 주입과 초기화가 일어나는 흐름으로 설명한다.
- Spring MVC Scene은 Controller 처리 뒤 논리적인 View 이름과 Model을 반환하고 ViewResolver가 실제 View를 찾아 HTML을 렌더링하는 서버 측 View 경로까지 다룬다.
- Spring MVC Scene은 DispatcherServlet을 중심으로 HandlerMapping, HandlerAdapter와 ViewResolver가 갈라지는 구조로 배치하고, 조회·호출은 실선, 선택·처리 결과 반환은 점선으로 구분한다.
- REST의 `@ResponseBody`, HttpMessageConverter, HTTP 전송과 브라우저 렌더링은 Spring MVC View 경로와 구분하고 이번 확장에서는 제외한다.
- 검색 결과 생성, 검색 색인 처리와 브라우저 응답 렌더링은 이번 PLAN에서 제외한다.
- 현재 퀴즈 데이터는 새 루트 흐름에 맞는 문항으로 교체한다.

## 완료 조건

### 루트와 홈페이지

- 홈페이지와 Explorer의 첫 주제가 `google.com` 주소 입력 시나리오로 표시된다.
- 루트 World Viewport에 `사용자/브라우저 → DNS → Router → Server` 흐름과 화살표가 표시된다.
- 네 주요 Topic은 모두 클릭해 게시된 하위 Scene으로 진입할 수 있다.
- 기존 검색 요청·검색 결과·브라우저 렌더링 요소가 루트 흐름에 남지 않는다.
- 새 콘텐츠 URL과 홈페이지 진입 링크가 일치하고 깨진 참조가 남지 않는다.

### 사용자와 TLS

- 사용자 Topic을 클릭하면 브라우저와 원격 서버가 같은 Scene에 바로 보인다.
- 브라우저에서 서버로 향하는 화살표에는 `ClientHello`, 서버에서 브라우저로 돌아오는 화살표에는 `인증서 체인 제공` 라벨이 화면에 보인다.
- 서버의 인증서 체인 제공과 브라우저의 인증서 체인·도메인·유효기간 검증 역할이 구분된다.
- 화살표 라벨은 진행 방향과 리턴 방향 모두 선과 겹치지 않게 자동 배치되고 보조 기술에서도 의미를 확인할 수 있다.
- DNS와 네트워크 경로가 준비된 뒤 TLS가 진행된다는 시간 관계를 설명에서 명확히 한다.

### DNS와 Router

- DNS Scene에 브라우저/OS 캐시, 로컬 또는 재귀 Resolver, Root DNS, `.com` TLD DNS, 권한 DNS와 IP 응답이 표시된다.
- Root DNS가 Google IP를 직접 반환하는 것이 아니라 다음 DNS 위치를 안내한다는 점을 설명한다.
- 기존 UDP 질의와 Socket/Kernel 콘텐츠는 새 DNS 경로 아래에서 의미가 유지되는 범위만 재사용한다.
- Router Scene에 기본 게이트웨이, ARP/NDP, 공유기·NAT, ISP, 인터넷 라우팅이 표시된다.

### Server 학습 구조

- Server Scene에서 Proxy Server, Application Server, Database가 주요 흐름으로 표시된다.
- Proxy Server 아래에서 NGINX의 reverse proxy와 전달 역할을 확인할 수 있다.
- Application Server 아래에서 Spring 기반 요청 처리 예시를 확인할 수 있다.
- Database 아래에서 SQL과 NoSQL의 차이와 사용 예시를 확인할 수 있다.
- 각 설명은 학습용 일반 서버 구성과 Google의 확인된 내부 구현을 구분한다.
- Spring Topic에서 Tomcat과 Spring 생태계가 보이고 각각 게시된 하위 Scene으로 진입할 수 있다.
- Tomcat Scene은 Connector·Protocol Processor·CoyoteAdapter·Servlet 처리·FilterChain을 거쳐 Spring MVC로 요청을 전달한다.
- Spring 생태계 Scene은 Spring Security, Spring MVC와 Spring Container를 구분하고 Container 지원 관계를 점선으로 표시한다.
- Spring Security Scene은 Servlet FilterChain에서 SecurityFilterChain의 인증·인가를 거쳐 DispatcherServlet로 전달되는 요청 흐름을 표시한다.
- Spring MVC Scene은 DispatcherServlet을 중심으로 HandlerMapping·HandlerAdapter·ViewResolver가 분기되고, Controller가 반환한 Model·View 이름에서 View·HTML 렌더링으로 이어지는 서버 측 View 흐름을 표시한다.
- Spring Container Scene은 설정 정보에서 BeanDefinition·Bean 생성·의존성 주입·초기화로 이어지는 시작 흐름을 표시한다.
- Spring MVC Scene에는 ViewResolver와 View 렌더링을 표시하되 HttpMessageConverter, HTTP 전송과 브라우저 렌더링은 표시하지 않는다.

### 콘텐츠 품질

- 게시 콘텐츠마다 작성자, 검토 상태, 수정일과 공식 또는 1차 출처가 있다.
- 새 루트 흐름에 맞는 퀴즈가 표시되고 기존 검색 결과 중심 문항은 남지 않는다.
- 콘텐츠 작성자가 좌표를 입력하지 않으며 기존 결정적 자동 레이아웃을 사용한다.

## 작업 순서

### 1단계 — 루트 시나리오와 영구 문서 정정

- [x] `REQUIREMENTS.md`와 `TECHNICAL_DESIGN.md`의 MVP 시작 시나리오를 `google.com` 주소 입력으로 변경한다.
- [x] 기존 영구 ID 유지, 새 `google-com` slug·URL과 콘텐츠 트리를 확정하고 홈페이지 진입 경로를 갱신한다.
- [x] 루트 Scene을 `사용자/브라우저 → DNS → Router → Server` 흐름으로 교체한다.

### 2단계 — 사용자·DNS·Router Scene

- [x] 사용자 Scene에 브라우저의 `ClientHello`, 서버의 인증서 체인 제공, 브라우저의 인증서 검증 흐름을 구현한다.
- [x] 진행·리턴 화살표의 라벨을 화면에 표시하고 위치를 자동 계산하도록 edge renderer를 보강한다.
- [x] DNS Scene을 Resolver → Root → TLD → 권한 DNS → IP 응답 흐름으로 재구성한다.
- [x] 기존 UDP 및 Socket/Kernel 콘텐츠를 새 DNS 경로에 맞게 연결한다.
- [x] Router Scene에 게이트웨이·NAT·ISP·인터넷 라우팅 흐름을 구현한다.

### 3단계 — Server와 구현 예시 `▶ 현재`

- [x] Server Scene에 Proxy Server → Application Server → Database 흐름을 구현한다.
- [x] NGINX와 Spring 하위 Scene을 작성하고 각 부모 Topic에 연결한다.
- [x] SQL과 NoSQL 하위 Scene을 작성하고 Database Topic에 연결한다.
- [x] 일반적인 학습용 가정과 Google 관련 사실을 구분해 설명하고 출처를 기록한다.
- [x] 기존 Spring Scene을 Tomcat과 Spring 생태계로 진입하는 상위 Scene으로 확장한다.
- [x] Tomcat의 HTTP 요청이 Servlet FilterChain과 DispatcherServlet로 이어지는 하위 Scene을 작성한다.
- [x] Spring 생태계 아래에 Spring Security, Spring MVC와 Spring Container Scene을 연결한다.
- [x] Security 요청 흐름과 Container 초기화 흐름을 작성한다.
- [x] Spring MVC의 Model·View 이름 반환, ViewResolver와 HTML View 렌더링 흐름을 작성한다.
- [x] Spring MVC를 DispatcherServlet 중심 분기 구조로 재배치하고 반환 edge를 점선으로 구분한다.
- [x] Dispatcher 주변의 불필요한 왕복 edge를 줄이고 return edge의 접속 방향을 분리한다.
- [x] Request Topic을 제거하고 View를 DispatcherServlet 아래에 배치한다.

### 4단계 — 연결 정리와 사용자 확인

- [ ] 새 흐름에 맞게 퀴즈, 홈페이지 문구, 경로 표시 문구를 갱신한다.
- [ ] 기존 검색 시나리오의 불필요한 요소와 깨진 참조를 정리한다.
- [ ] 사용자가 루트부터 각 하위 Scene의 흐름과 내용을 직접 확인한다.

## 필요한 요구사항 및 설계 변경

- `REQUIREMENTS.md`
  - MVP 시작 질문과 루트 흐름을 `google.com` 주소 입력 시나리오로 변경한다.
  - 이번 콘텐츠 범위에서 브라우저 응답 렌더링을 제외한다.
  - 학습용 일반 서버 가정과 제품별 사실을 구분하는 기준을 반영한다.
- `TECHNICAL_DESIGN.md`
  - 새 Scene 트리, canonical URL과 기존 DNS 콘텐츠 재배치 결과를 반영한다.
  - Scene·Concept·Context·Occurrence 및 자동 레이아웃 구조는 변경하지 않는다.
- 콘텐츠 데이터
  - 루트와 하위 Scene YAML·Markdown을 새 흐름으로 교체하거나 추가한다.
  - NGINX, Spring, SQL, NoSQL의 공통 설명이 여러 맥락에서 필요하면 Concept로 분리할 수 있게 ID를 설계한다.
- 애플리케이션
  - 데이터 기반 renderer와 카메라 구조는 유지한다.
  - 기존 edge `label` 데이터를 사용해 화살표 위에 보이는 라벨을 렌더링하고, 라벨 위치는 계산된 경로에서 자동으로 정한다.
  - 홈페이지 진입 URL과 알려진 경로 라벨처럼 콘텐츠 ID·slug에 의존하는 최소 연결만 수정한다.

## 검증 및 확인 방법

- AI는 자동 테스트, 콘텐츠 검증 명령, 타입 검사, 빌드와 브라우저 검증을 실행하지 않는다.
- AI는 문서 포맷, YAML 형식과 변경 범위를 정적으로 확인한다.
- 사용자는 콘텐츠 검증, 화면 표시, 클릭 탐색과 URL 동작을 직접 확인한다.
- 사용자 확인 전에는 확인 전용 체크박스를 완료 처리하지 않는다.

## 제외 범위

- 브라우저의 HTML/CSS 파싱, JavaScript 실행, Layout·Paint·Composite
- Google 검색 색인과 검색 결과 생성 과정
- Google의 비공개 서버 구현을 사실로 단정하는 설명
- 회원, 점수, 진도와 퀴즈 결과 저장
- INBOX `메모`에 있는 성능·Viewport·hover·경로 탐색 개선
