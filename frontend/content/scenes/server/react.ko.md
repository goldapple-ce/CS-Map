# 한눈에 보기

React는 사용자 화면을 Component 단위로 구성하는 JavaScript Library입니다.

화면의 데이터가 바뀌면 React가 변경된 내용에 맞춰 화면을 다시 구성합니다. 개발자는 화면 전체를 직접 다시 만드는 대신 Component와 상태에 따라 어떤 화면을 보여줄지 작성합니다.

---

# 현재 흐름에서의 React

이 Map에서는 Browser에서 실행되는 React SPA를 가정합니다.

React를 Build하면 HTML, JavaScript와 CSS 정적 파일이 만들어집니다. 이 파일을 NGINX가 Browser에 제공하고, Browser에서 실행된 React는 필요한 데이터를 Spring API에 요청합니다.

```text
React Build 결과 → NGINX가 정적 파일 제공 → Browser에서 실행
Browser의 React → NGINX → Spring API
```

---

# 개발자가 개입하는 지점

개발자는 React Component로 화면을 작성하고, Build 결과물을 NGINX가 제공할 수 있도록 배포합니다.

---

# 나중에 추가할 내용

Component, Props, State, Hook, Rendering과 Routing 같은 React 내부 내용은 이후 React 하위 Scene을 만들 때 자세히 다룹니다.

---

# 참고 자료

- [React — Quick Start](https://react.dev/learn)
- [Vite — Deploying a Static Site](https://vite.dev/guide/static-deploy.html)
