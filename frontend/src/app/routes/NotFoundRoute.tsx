import { useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"

export function NotFoundRoute() {
  const navigate = useNavigate()

  return (
    <main className="flex min-h-svh items-center justify-center bg-background p-6 text-foreground">
      <div className="flex max-w-lg flex-col items-start gap-4">
        <p className="text-sm font-medium text-muted-foreground">404</p>
        <h1 className="text-3xl font-semibold tracking-tight">
          경로를 찾을 수 없습니다.
        </h1>
        <Button onClick={() => navigate("/")}>시작 화면으로</Button>
      </div>
    </main>
  )
}
