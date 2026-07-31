# 개요

Spring MVC의 Model은 View가 rendering할 때 사용할 attribute를 담는 구조입니다. Controller는 domain 객체나 표시용 값을 이름과 함께 Model에 추가할 수 있습니다.

Model은 HTML 그 자체가 아니며 HTTP response body와도 다릅니다. DispatcherServlet이 선택한 View에 Model을 전달하면, View가 template 규칙에 따라 attribute를 읽어 결과를 rendering합니다.

request에 민감한 정보나 불필요하게 큰 객체를 그대로 넣으면 의도하지 않은 노출이나 성능 문제로 이어질 수 있으므로 View에 필요한 data만 제공하는 것이 좋습니다.

# 참고 자료

- [Spring Framework — Model API](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/ui/Model.html)
