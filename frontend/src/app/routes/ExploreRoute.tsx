import { useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"

export function ExploreRoute() {
  const navigate = useNavigate()

  return (
    <main className="flex min-h-svh items-center justify-center bg-background p-6 text-foreground">
      <div className="flex max-w-lg flex-col items-start gap-4">
        <p className="text-sm font-medium text-muted-foreground">탐색 경로</p>
        <h1 className="text-3xl font-semibold tracking-tight">구글 검색</h1>
        <p className="leading-7 text-muted-foreground">
          Semantic Zoom 지도가 이 화면에 연결될 예정입니다.
        </p>
        <Button variant="outline" onClick={() => navigate("/")}>
          시작 화면으로
        </Button>
      </div>
    </main>
  )
}
