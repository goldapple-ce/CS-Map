# 한눈에 보기

`SecurityContextHolder`는 현재 요청에서 사용할 SecurityContext와 Authentication을 보관하고 접근하게 합니다.

JWT가 유효하면 Custom JWT Filter는 검증 결과로 만든 Authentication을 현재 요청의 SecurityContext에 등록합니다. JWT 문자열 자체를 SecurityContextHolder에 저장하는 것이 아닙니다.

JWT 방식에서는 다음 요청이 올 때 Token을 다시 검증해 새로운 요청의 SecurityContext를 구성합니다. 요청 처리가 끝난 뒤 Context 정리는 Spring Security Filter Chain의 책임과 함께 다뤄져야 합니다.
