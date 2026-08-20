import { RouterProvider } from "react-router-dom"

import { router } from "@/app/router"
import { ThemeProvider } from "./theme-provider"

/** 애플리케이션 전역 Router를 React 트리에 연결한다. */
export function App() {
  console.log(
    "%cCS-MAP에 당도한 것을 환영하오, 낯선 이여%c\n오신 김에 작은 비밀 하나를 알려드릴게요.\n헤더의 테마 버튼을 눌러보셨나요?",
    "font-size:18px;font-weight:bold;color:#facc15;",
    "font-size:12px;"
  )
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  )
}

export default App
