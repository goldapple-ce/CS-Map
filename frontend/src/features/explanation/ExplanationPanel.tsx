import { useEffect, useMemo, useRef, useState } from "react"
import { BookOpenText, ListChecks } from "lucide-react"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { contentRepository } from "@/content/content-repository"
import { QuizPanel } from "@/features/explanation/QuizPanel"
import { MarkdownContent } from "./MarkdownContent"
import { TopicExplanationContent } from "./TopicExplanationContent"
import { ExplanationHeader } from "./ExplanationPanelHeader"
import type { ExplanationSelection } from "./explanation-selection"

type ExplanationPanelProps = {
  sceneId: string
  selection?: ExplanationSelection
  onClearSelection: () => void
}

/** 선택된 Scene 또는 Topic의 설명과 퀴즈를 패널에 표시한다. */
export function ExplanationPanel({
  sceneId,
  selection,
  onClearSelection,
}: ExplanationPanelProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const [activeTab, setActiveTab] = useState<"explanation" | "quiz">(
    "explanation"
  )

  useEffect(() => {
    const viewport = scrollAreaRef.current?.querySelector<HTMLElement>(
      '[data-slot="scroll-area-viewport"]'
    )
    if (!viewport) return

    viewport.scrollTop = 0
  }, [selection, sceneId])

  const explanation = useMemo(() => {
    const { scene, markdown } = contentRepository.getScene(sceneId)

    return {
      scene,
      markdown,
    }
  }, [sceneId])

  const selectedMarkdown = useMemo(() => {
    if (!selection) return undefined
    return selection.kind === "topic"
      ? contentRepository.getTopicExplanation(
          selection.sceneId,
          selection.elementId
        )
      : contentRepository.getAreaExplanation(
          selection.sceneId,
          selection.areaId
        )
  }, [selection])

  const panelTitle = selection?.label ?? explanation.scene.title

  return (
    <aside
      aria-labelledby="explanation-title"
      className="flex size-full min-h-0 flex-col bg-background"
    >
      <ExplanationHeader
        title={panelTitle}
        kind={selection?.kind ?? activeTab}
      />
      <Tabs
        value={selection ? "explanation" : activeTab}
        onValueChange={(value) => {
          if (value === "explanation" || value === "quiz") {
            setActiveTab(value)
          }
        }}
        className="min-h-0 flex-1"
      >
        {!selection ? (
          <div className="shrink-0 border-b border-border px-5 py-2.5">
            <TabsList aria-label="Topic 콘텐츠">
              <TabsTrigger className="gap-2" value="explanation">
                <BookOpenText aria-hidden="true" />
                설명
              </TabsTrigger>
              <TabsTrigger className="gap-2" value="quiz">
                <ListChecks aria-hidden="true" />
                퀴즈
              </TabsTrigger>
            </TabsList>
          </div>
        ) : null}

        <div ref={scrollAreaRef} className="min-h-0 flex-1">
          <ScrollArea className="size-full">
            <TabsContent
              value="explanation"
              keepMounted
              className="data-hidden:hidden"
            >
              <article className="mx-auto max-w-3xl space-y-10 px-6 py-7">
                {selection ? (
                  <TopicExplanationContent
                    selection={selection}
                    markdown={selectedMarkdown}
                    onBack={() => {
                      setActiveTab("explanation")
                      onClearSelection()
                    }}
                  />
                ) : (
                  <MarkdownContent
                    markdown={explanation.markdown}
                    idPrefix={`scene-${explanation.scene.id}`}
                  />
                )}
              </article>
            </TabsContent>

            <TabsContent
              value="quiz"
              keepMounted
              className="data-hidden:hidden"
            >
              <article className="mx-auto max-w-3xl px-6 py-7">
                <QuizPanel
                  key={explanation.scene.id}
                  questions={explanation.scene.selfCheckQuiz ?? []}
                />
              </article>
            </TabsContent>
          </ScrollArea>
        </div>
      </Tabs>
    </aside>
  )
}
