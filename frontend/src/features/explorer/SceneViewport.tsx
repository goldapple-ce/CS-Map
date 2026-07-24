import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import { SceneRenderer } from "@/components/scene/SceneRenderer"
import { Button } from "@/components/ui/button"
import { contentRepository } from "@/content/content-repository"
import type { Scene } from "@/domain/content-types"

type SceneLoadState =
  | { status: "loading" }
  | { status: "loaded"; scene: Scene }
  | { status: "error"; message: string }
  | { status: "not-found" }

type SceneViewportProps = {
  sceneId?: string
  routeNotFound: boolean
  navigationDisabled: boolean
  onEnterScene: (sceneId: string) => void
}

export function SceneViewport({
  sceneId,
  routeNotFound,
  navigationDisabled,
  onEnterScene,
}: SceneViewportProps) {
  const navigate = useNavigate()
  const [loadState, setLoadState] = useState<SceneLoadState>({
    status: routeNotFound ? "not-found" : "loading",
  })

  useEffect(() => {
    if (routeNotFound || !sceneId) {
      return
    }

    let active = true

    contentRepository
      .loadScene(sceneId)
      .then(({ scene }) => {
        if (active) setLoadState({ status: "loaded", scene })
      })
      .catch((error: unknown) => {
        if (!active) return
        setLoadState({
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "장면을 불러오지 못했습니다.",
        })
      })

    return () => {
      active = false
    }
  }, [routeNotFound, sceneId])

  const scene = loadState.status === "loaded" ? loadState.scene : undefined

  return (
    <section
      aria-labelledby="scene-title"
      className="flex size-full min-h-0 flex-col bg-muted/20"
    >
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <div>
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Scene viewport
          </p>
          <h1 id="scene-title" className="text-lg font-semibold">
            {scene?.title ??
              (loadState.status === "not-found"
                ? "장면을 찾을 수 없음"
                : "장면 로딩")}
          </h1>
        </div>
        <p className="rounded-md border border-border bg-background px-2.5 py-1 text-xs text-muted-foreground">
          {scene ? `${scene.elements.length}개 요소` : loadState.status}
        </p>
      </div>

      <div className="min-h-0 flex-1">
        {loadState.status === "loading" ? (
          <div className="flex size-full items-center justify-center text-sm text-muted-foreground">
            장면 데이터를 불러오는 중입니다.
          </div>
        ) : null}
        {loadState.status === "not-found" ? (
          <div className="flex size-full items-center justify-center p-8">
            <div className="flex max-w-md flex-col items-start gap-4 rounded-xl border border-border bg-background p-6">
              <p className="text-sm font-medium text-muted-foreground">404</p>
              <h2 className="text-xl font-semibold">게시된 장면이 없습니다.</h2>
              <p className="text-sm leading-6 text-muted-foreground">
                주소가 잘못되었거나 아직 게시되지 않은 탐색 경로입니다.
              </p>
              <Button onClick={() => navigate("/explore/google-search")}>
                구글 검색 루트로
              </Button>
            </div>
          </div>
        ) : null}
        {loadState.status === "error" ? (
          <div className="flex size-full items-center justify-center p-8">
            <div className="max-w-md rounded-xl border border-destructive/40 bg-background p-5">
              <h2 className="font-medium text-destructive">
                장면을 표시할 수 없습니다.
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {loadState.message}
              </p>
            </div>
          </div>
        ) : null}
        {scene ? (
          <SceneRenderer
            scene={scene}
            navigationDisabled={navigationDisabled}
            onEnterScene={onEnterScene}
          />
        ) : null}
      </div>
    </section>
  )
}
