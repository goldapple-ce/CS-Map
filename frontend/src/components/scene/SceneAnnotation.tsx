import type { SceneElement } from "@/domain/content-types"

type SceneAnnotationProps = {
  element: SceneElement
}

export function SceneAnnotation({ element }: SceneAnnotationProps) {
  const { x, y, width = 240, height = 60 } = element.geometry

  return (
    <foreignObject x={x} y={y} width={width} height={height}>
      <p className="m-0 rounded-lg border border-border bg-muted/60 px-3 py-2 text-xs leading-5 text-muted-foreground">
        {element.label}
      </p>
    </foreignObject>
  )
}
