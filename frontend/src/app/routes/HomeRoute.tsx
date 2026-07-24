import { useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"

export function HomeRoute() {
  const navigate = useNavigate()

  return (
    <main className="flex min-h-svh items-center justify-center bg-background p-6 text-foreground">
      <div className="flex max-w-lg flex-col items-start gap-4">
        <p className="text-sm font-medium text-muted-foreground">CS Zoom Map</p>
        <h1 className="text-3xl font-semibold tracking-tight">
          컴퓨터공학 지식을 맥락 속에서 탐색하세요.
        </h1>
        <p className="leading-7 text-muted-foreground">
          하나의 화면에서 실제 시스템의 동작을 단계별로 확대해 살펴봅니다.
        </p>
        <Button onClick={() => navigate("/explore/google-search")}>
          구글 검색 흐름 열기
        </Button>
      </div>
    </main>
  )
}
