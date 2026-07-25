# Spring MVC 요청 처리

## 개요

Spring MVC는 중앙 `DispatcherServlet`이 요청 처리의 공통 절차를 조정하는 front controller 구조를 사용합니다. 실제 요청 처리는 매핑된 handler와 Controller 같은 구성 요소가 담당합니다.

## 필요한 이유

요청 경로 확인, handler 선택, 인자 변환, 예외 처리와 응답 변환을 공통 진입점에서 조정하면 애플리케이션 코드는 개별 비즈니스 동작에 집중할 수 있습니다.

## 동작 과정

1. HTTP 요청이 `DispatcherServlet`에 들어옵니다.
2. Spring MVC가 요청에 맞는 handler를 찾습니다.
3. 선택된 Controller와 관련 interceptor가 실행됩니다.
4. Controller가 필요하면 Service와 Data Access 계층을 호출합니다.
5. 반환값은 message converter나 view 처리 등을 거쳐 HTTP 응답이 됩니다.

## 내부 구조

화면의 Service와 Data Access는 흔히 사용하는 애플리케이션 구성 예시이며 Spring MVC가 강제하는 고정 계층은 아닙니다. WebFlux는 별도의 reactive stack이므로 이 Scene의 Servlet 기반 흐름과 구분해야 합니다.

## 실패 상황

- 요청에 맞는 handler가 없을 수 있습니다.
- 입력 변환이나 validation이 실패할 수 있습니다.
- Controller, Service 또는 Data Access 실행 중 예외가 발생할 수 있습니다.
- 응답을 원하는 media type으로 변환하지 못할 수 있습니다.

## 실무 맥락

문제를 확인할 때는 요청 URI와 method, 선택된 handler, 예외 resolver의 처리 결과, downstream 호출 시간과 최종 응답 상태를 함께 추적합니다.

## 출처

- Spring Framework, _DispatcherServlet_
- Spring Framework, _DispatcherServlet Processing_
