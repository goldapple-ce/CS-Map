# 한눈에 보기

이 Topic도 앞쪽의 `Servlet Filter`와 같은 일반 `jakarta.servlet.Filter`입니다. 뷰포트에서는 Spring Security 처리가 끝난 뒤 원래 Servlet FilterChain에서 계속 실행되는 위치를 보여줍니다.

두 Topic을 따로 표시한 이유는 특별한 Filter 종류를 구분하기 위해서가 아니라, `DelegatingFilterProxy` 앞뒤에 일반 Filter가 존재할 수 있음을 보여주기 위해서입니다.
