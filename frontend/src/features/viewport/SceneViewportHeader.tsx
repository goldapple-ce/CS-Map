/** 표시 방식에 맞는 Scene 제목과 확대 비율을 렌더링한다. */
export function SceneViewportHeader({
  title,
  relativeZoom,
}: {
  title: string
  relativeZoom: number
}) {
  return (
    <div className="flex items-center justify-between border-b border-border px-5 py-3">
      <div className="flex min-w-0 flex-col">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          World viewport
        </p>
        <h1 id="scene-title" className="text-lg font-semibold">
          {title}
        </h1>
      </div>
      <p className="mr-8 text-xs text-muted-foreground">{relativeZoom}%</p>
    </div>
  )
}
