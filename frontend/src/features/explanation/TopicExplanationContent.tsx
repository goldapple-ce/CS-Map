import { MarkdownContent } from "./MarkdownContent"
import type { ExplanationSelection } from "./explanation-selection"

type TopicExplanationContentProps = {
  selection: ExplanationSelection
  markdown?: string
}
/** 선택한 Topic 또는 Area의 설명을 렌더링한다. */
export function TopicExplanationContent({
  selection,
  markdown,
}: TopicExplanationContentProps) {
  return (
    <section className="space-y-5">
      {markdown ? (
        <MarkdownContent
          markdown={markdown}
          idPrefix={
            selection.kind === "topic"
              ? `topic-${selection.sceneId}-${selection.elementId}`
              : `area-${selection.sceneId}-${selection.areaId}`
          }
        />
      ) : (
        <p className="text-sm leading-7 text-muted-foreground">
          이 {selection.kind === "topic" ? "Topic" : "Area"}에는 아직 작성된
          상세 설명이 없습니다.
        </p>
      )}
    </section>
  )
}
