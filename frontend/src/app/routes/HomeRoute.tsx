import { useNavigate } from "react-router-dom"

import { contentRepository } from "@/content/content-repository"
import { contentData } from "@/content/generated/content-data"
import { EnterGooglePreview } from "@/features/home/EnterGooglePreview"
import { UsageGuide } from "@/features/home/UsageGuide"
import { Hero } from "@/features/home/Hero"
import { MousePointerClick } from "lucide-react"

/** Root Scene 미리보기와 Explorer 진입 안내를 시작 화면에 표시한다. */
export function HomeRoute() {
  const navigate = useNavigate()
  const rootScene = contentRepository.getScene(contentData.rootSceneId).scene
  const rootRoute = contentData.routes.find(
    ({ id }) => id === contentData.rootSceneId
  )
  if (!rootRoute) {
    throw new Error(`Root Scene route is unavailable: ${contentData.rootSceneId}`)
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col items-center space-y-6 px-8 py-8">
      <Hero />

      <section aria-labelledby="first-topic-title" className="mt-12 w-full">
        <p className="font-medium text-muted-foreground">
          가장 익숙한 질문부터 시작해볼까요?
        </p>
        <h2
          id="first-topic-title"
          className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl"
        >
          브라우저에 google.com을 입력하면 무슨 일이 발생할까요?
        </h2>
        <div className="mt-2 flex items-center gap-1">
          <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted">
            <MousePointerClick
              className="size-4 text-muted-foreground"
              aria-hidden="true"
            />
          </div>
          <p className="text-red-600 dark:text-red-400">
            아래 카드를 클릭하면, 설명을 볼 수 있어요
          </p>
        </div>
        <EnterGooglePreview
          scene={rootScene}
          onEnter={() => navigate(rootRoute.path)}
        />
      </section>

      <UsageGuide />
    </main>
  )
}
