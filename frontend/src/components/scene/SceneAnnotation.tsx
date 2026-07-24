import type { LayoutBox } from "@/components/scene/scene-layout"
import type { SceneAnnotationElement } from "@/domain/content-types"

type SceneAnnotationProps = {
  element: SceneAnnotationElement
  layout: LayoutBox
}

export function SceneAnnotation({ element, layout }: SceneAnnotationProps) {
  const { x, y, width, height } = layout

  return (
    <foreignObject x={x} y={y} width={width} height={height}>
      <p className="m-0 rounded-lg border border-border bg-muted/60 px-3 py-2 text-xs leading-5 text-muted-foreground">
        {element.label}
      </p>
    </foreignObject>
  )
}
