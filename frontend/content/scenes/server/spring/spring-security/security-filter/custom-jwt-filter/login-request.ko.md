# 한눈에 보기

Login Request는 사용자가 자격 증명을 보내 인증을 시작하는 요청입니다.

이 요청을 처리하는 인증 Filter는 자격 증명을 검증하고, 성공하면 AuthenticationSuccessHandler를 호출합니다. JWT는 로그인 요청을 받자마자 만드는 것이 아니라 인증 성공이 확인된 뒤 발급해야 합니다.

---

# 개발자가 정하는 것

개발자는 로그인 URL, 자격 증명의 형식과 성공·실패 응답을 정합니다. Password를 사용한다면 TLS로 보호된 HTTPS를 사용하고 Server에는 원문 Password를 저장하지 않아야 합니다.
