import type { Concept, Scene } from "@shared/content/types"
import { MarkdownContent } from "./MarkdownContent"

type ConceptExplanation = {
  concept: Concept
  markdown: string
  contextSummary: string
  occurrenceId: string
}

type SceneExplanation = {
  scene: Scene
  markdown: string
  concepts: ConceptExplanation[]
}

type SceneExplanationContentProps = {
  explanation: SceneExplanation
}

export function SceneExplanationContent({
  explanation,
}: SceneExplanationContentProps) {
  return (
    <>
      <MarkdownContent
        markdown={explanation.markdown}
        idPrefix={`scene-${explanation.scene.id}`}
      />

      {explanation.concepts.map(
        ({ concept, markdown, contextSummary, occurrenceId }) => (
          <section
            key={occurrenceId}
            className="space-y-5 rounded-xl border border-border bg-muted/20 p-5"
          >
            <div className="space-y-2">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                현재 맥락
              </p>
              <p className="text-sm leading-7 text-muted-foreground">
                {contextSummary}
              </p>
            </div>
            <div className="space-y-2 border-t border-border pt-5">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                공통 Concept
              </p>
              <p className="text-lg font-semibold">{concept.title}</p>
              <p className="text-sm leading-7 text-muted-foreground">
                {concept.summary}
              </p>
            </div>
            <MarkdownContent
              markdown={markdown}
              idPrefix={`concept-${concept.id}-${occurrenceId}`}
            />
          </section>
        )
      )}
    </>
  )
}
