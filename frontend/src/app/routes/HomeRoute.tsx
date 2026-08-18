import {
  ArrowRight,
  BookOpenText,
  MousePointerClick,
  ZoomIn,
} from "lucide-react"
import { useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { contentRepository } from "@/content/content-repository"
import type { SceneNavigationRequest } from "@/features/explorer/exploration-memory"
import { SceneViewport } from "@/features/explorer/SceneViewport"

const usageSteps = [
  {
    icon: MousePointerClick,
    title: "궁금한 Topic을 클릭하세요",
    description: "흐름 속 요소를 선택하면 그 위치로 카메라가 이동합니다.",
  },
  {
    icon: ZoomIn,
    title: "안쪽 구조를 확대하세요",
    description: "가까이 갈수록 이전에는 보이지 않던 세부 흐름이 나타납니다.",
  },
  {
    icon: BookOpenText,
    title: "설명을 함께 읽으세요",
    description: "지도 옆 설명 패널에서 원리와 현재 맥락을 확인할 수 있습니다.",
  },
]

function requireRootRoute() {
  const rootSceneId = contentRepository.getRootSceneId()
  const route = contentRepository
    .listRoutes()
    .find(({ id }) => id === rootSceneId)

  if (!route) {
    throw new Error(`Root Scene Route is missing: ${rootSceneId}`)
  }

  return route
}

/** Root Scene 미리보기와 Explorer 진입 안내를 시작 화면에 표시한다. */
export function HomeRoute() {
  const navigate = useNavigate()
  const rootRoute = requireRootRoute()
  const rootPath = rootRoute?.path ?? "/explore/google-com"

  /** 미리보기에서 선택한 Scene의 전체 Explorer 경로로 이동한다. */
  const enterScene = ({ sceneId }: SceneNavigationRequest) => {
    const targetRoute = contentRepository
      .listRoutes()
      .find(({ id }) => id === sceneId)
    if (targetRoute) navigate(targetRoute.path)
  }

  return (
    <main className="min-h-svh bg-background text-foreground">
      <header className="mx-auto flex w-full max-w-6xl items-center px-6 py-6 lg:px-8">
        <p className="text-sm font-semibold tracking-wide">CS Map</p>
      </header>

      <div className="mx-auto flex w-full max-w-6xl flex-col items-center px-6 pt-10 pb-16 text-center lg:px-8 lg:pt-16 lg:pb-24">
        <p className="rounded-full border border-border bg-muted/40 px-4 py-1.5 text-sm text-muted-foreground">
          연결해서 이해하는 컴퓨터공학 지도
        </p>
        <h1 className="mt-7 max-w-4xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
          하나의 요청 안에서 흩어진 CS 지식을 연결하세요.
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
          CS Map은 새로운 페이지를 넘기는 대신 하나의 지식 공간을 확대하며
          탐색하는 서비스입니다. 큰 처리 흐름에서 시작해 네트워크, 운영체제,
          서버의 내부까지 자연스럽게 들어가 보세요.
        </p>

        <section aria-labelledby="first-topic-title" className="mt-12 w-full">
          <div className="flex flex-col gap-5 text-left sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                첫 번째 탐색 주제
              </p>
              <h2
                id="first-topic-title"
                className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl"
              >
                브라우저에 google.com을 입력하면 무슨 일이 발생할까요?
              </h2>
              <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">
                아래 흐름에서 궁금한 Topic을 클릭하면 해당 위치부터 바로 탐색할
                수 있습니다.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              className="shrink-0"
              onClick={() => navigate(rootPath)}
            >
              전체 화면으로 탐색
              <ArrowRight aria-hidden="true" />
            </Button>
          </div>

          <div className="mt-5 h-40 w-full overflow-hidden">
            <SceneViewport
              sceneId={rootRoute.id}
              navigationDisabled={false}
              reducedMotion
              presentation="embedded"
              onEnterScene={enterScene}
              onSelectTopic={() => navigate(rootPath)}
              onCameraChange={() => undefined}
              onAnimationChange={() => undefined}
            />
          </div>
        </section>

        <section aria-labelledby="how-to-use-title" className="mt-16 w-full">
          <div className="text-left">
            <p className="text-sm font-medium text-muted-foreground">
              이용 방법
            </p>
            <h2
              id="how-to-use-title"
              className="mt-2 text-2xl font-semibold tracking-tight"
            >
              클릭하고, 확대하고, 연결해서 이해하세요.
            </h2>
          </div>
          <ol className="mt-7 grid gap-4 text-left md:grid-cols-3">
            {usageSteps.map(({ icon: Icon, title, description }, index) => (
              <li
                key={title}
                className="rounded-2xl border border-border bg-card p-6"
              >
                <div className="flex items-center justify-between">
                  <Icon
                    className="size-5 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <span className="text-sm font-medium text-muted-foreground">
                    {index + 1}
                  </span>
                </div>
                <h3 className="mt-8 font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {description}
                </p>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </main>
  )
}
