# 한눈에 보기

`View / HTML 렌더링`은 선택된 View가 Model 데이터를 이용해 HTTP 응답에 담을 결과를 만드는 단계입니다.  
JSP나 Thymeleaf 같은 서버 측 template을 사용하면 결과로 HTML 문자열이 만들어집니다.

---

# 동작 방식

1. ViewResolver가 실제 View를 선택합니다.
2. DispatcherServlet이 View에 Model을 전달해 렌더링을 요청합니다.
3. View가 template에 Model 데이터를 적용합니다.
4. 만들어진 결과가 HTTP response에 작성됩니다.

HTML을 네트워크로 전송하는 일은 Servlet Container가 담당하고, 받은 HTML을 화면에 그리는 일은 브라우저가 담당합니다.

---

# 개발자가 개입하는 지점

개발자는 template 파일과 View에 전달할 Model 데이터를 작성합니다.  
template 문법 오류, 존재하지 않는 attribute와 잘못된 View 경로는 렌더링 실패로 이어질 수 있습니다.  
redirect View처럼 HTML 문서를 만들지 않는 View도 있으므로 모든 View 결과가 HTML인 것은 아닙니다.

---

# 헷갈리기 쉬운 점

서버의 HTML 렌더링과 브라우저의 화면 렌더링은 다른 단계입니다. 이 Topic은 서버가 response content를 만드는 지점까지를 뜻합니다.

---

# 참고 자료

- [Spring Framework — View Technologies](https://docs.spring.io/spring-framework/reference/web/webmvc-view.html)
