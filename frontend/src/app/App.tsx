import { RouterProvider } from "react-router-dom"

import { router } from "@/app/router"
import { ThemeProvider } from "./theme-provider"

/** 애플리케이션 전역 Router를 React 트리에 연결한다. */
export function App() {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  )
}

export default App
