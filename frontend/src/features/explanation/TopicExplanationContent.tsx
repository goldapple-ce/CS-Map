import { MarkdownContent } from "./MarkdownContent"
import { Button } from "@/components/ui/button"
import type { ExplanationSelection } from "./explanation-selection"

type TopicExplanationContentProps = {
  selection: ExplanationSelection
  markdown?: string
  onBack: () => void
}
/** 선택한 Topic의 설명과 Scene 설명 복귀 버튼을 렌더링한다. */
export function TopicExplanationContent({
  selection,
  markdown,
  onBack,
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
      <Button type="button" variant="outline" onClick={onBack}>
        현재 Scene 설명으로 돌아가기
      </Button>
    </section>
  )
}
