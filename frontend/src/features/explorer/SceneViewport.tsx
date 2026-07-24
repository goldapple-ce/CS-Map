import { useEffect, useState } from "react"

import { SceneRenderer } from "@/components/scene/SceneRenderer"
import { FileContentRepository } from "@/content/file-repository"
import type { Scene } from "@/domain/content-types"

const contentRepository = new FileContentRepository()

type SceneLoadState =
  | { status: "loading" }
  | { status: "loaded"; scene: Scene }
  | { status: "error"; message: string }

export function SceneViewport() {
  const [loadState, setLoadState] = useState<SceneLoadState>({
    status: "loading",
  })

  useEffect(() => {
    let active = true

    contentRepository
      .loadScene("google-search-root")
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
  }, [])

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
            {scene?.title ?? "구글 검색"}
          </h1>
        </div>
        <p className="rounded-md border border-border bg-background px-2.5 py-1 text-xs text-muted-foreground">
          {scene ? `${scene.elements.length}개 요소` : "불러오는 중"}
        </p>
      </div>

      <div className="min-h-0 flex-1">
        {loadState.status === "loading" ? (
          <div className="flex size-full items-center justify-center text-sm text-muted-foreground">
            장면 데이터를 불러오는 중입니다.
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
        {scene ? <SceneRenderer scene={scene} /> : null}
      </div>
    </section>
  )
}
