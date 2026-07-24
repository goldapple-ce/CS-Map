import { Map } from "lucide-react"

export function SceneViewport() {
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
            구글 검색
          </h1>
        </div>
        <p className="rounded-md border border-border bg-background px-2.5 py-1 text-xs text-muted-foreground">
          전체 흐름
        </p>
      </div>

      <div className="flex min-h-0 flex-1 items-center justify-center p-8">
        <div className="flex max-w-md flex-col items-center gap-4 rounded-xl border border-dashed border-border bg-background p-10 text-center shadow-sm">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Map aria-hidden="true" />
          </div>
          <div className="space-y-2">
            <h2 className="font-medium">지도 Viewport</h2>
            <p className="text-sm leading-6 text-muted-foreground">
              장면 렌더러가 연결되기 전에도 탐색 화면과 설명 영역의 공간을
              유지합니다.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
