/** 표시 방식에 맞는 Scene 제목과 확대 비율을 렌더링한다. */
export function SceneViewportHeader({
  embedded,
  title,
  relativeZoom,
  showZoom,
}: {
  embedded: boolean
  title: string
  relativeZoom: number
  showZoom: boolean
}) {
  if (embedded) {
    return (
      <h2 id="scene-title" className="sr-only">
        {title}
      </h2>
    )
  }

  return (
    <div className="flex items-center justify-between border-b border-border px-5 py-3">
      <div>
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          World viewport
        </p>
        <h1
          id="scene-title"
          tabIndex={-1}
          className="text-lg font-semibold outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {title}
        </h1>
      </div>

      {showZoom ? (
        <p className="text-xs text-muted-foreground">{relativeZoom}%</p>
      ) : null}
    </div>
  )
}
