import { useEffect, useMemo, useRef, useState } from "react"
import { BookOpenText, ListChecks } from "lucide-react"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { contentRepository } from "@/content/content-repository"
import { QuizPanel } from "@/features/explanation/QuizPanel"
import { SceneExplanationContent } from "./SceneExplanationContent"
import { TopicExplanationContent } from "./TopicExplanationContent"
import { ExplanationHeader } from "./ExplanationPanelHeader"

export type TopicSelection = {
  sceneId: string
  elementId: string
  label: string
}

type ExplanationPanelProps = {
  sceneId: string
  topicSelection?: TopicSelection
  onClearTopic: () => void
}

/** 선택된 Scene 또는 Topic의 설명과 퀴즈를 패널에 표시한다. */
export function ExplanationPanel({
  sceneId,
  topicSelection,
  onClearTopic,
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
  }, [topicSelection, sceneId])

  const explanation = useMemo(() => {
    const { scene, markdown } = contentRepository.getScene(sceneId)

    const concepts = scene.conceptRefs.map((usage) => {
      const { concept, markdown: conceptMarkdown } =
        contentRepository.getConcept(usage.conceptId)

      const context = scene.contexts.find(({ id }) => id === usage.contextId)

      return {
        concept,
        markdown: conceptMarkdown,
        contextSummary:
          context?.summary ?? "현재 장면에서 사용되는 공통 개념입니다.",
        occurrenceId: usage.occurrenceId,
      }
    })

    return {
      scene,
      markdown,
      concepts,
    }
  }, [sceneId])

  const topicMarkdown = useMemo(() => {
    if (!topicSelection) return undefined

    return contentRepository.getTopicExplanation(
      topicSelection.sceneId,
      topicSelection.elementId
    )
  }, [topicSelection])

  const panelTitle = topicSelection?.label ?? explanation.scene.title

  return (
    <aside
      aria-labelledby="explanation-title"
      className="flex size-full min-h-0 flex-col bg-background"
    >
      <ExplanationHeader
        title={panelTitle}
        kind={topicSelection ? "topic" : activeTab}
      />
      <Tabs
        value={topicSelection ? "explanation" : activeTab}
        onValueChange={(value) => {
          if (value === "explanation" || value === "quiz") {
            setActiveTab(value)
          }
        }}
        className="min-h-0 flex-1"
      >
        {!topicSelection ? (
          <div className="shrink-0 border-b border-border px-5 py-2.5">
            <TabsList aria-label="Topic 콘텐츠">
              <TabsTrigger value="explanation">
                <BookOpenText aria-hidden="true" />
                설명
              </TabsTrigger>
              <TabsTrigger value="quiz">
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
                {topicSelection ? (
                  <TopicExplanationContent
                    selection={topicSelection}
                    markdown={topicMarkdown}
                    onBack={() => {
                      setActiveTab("explanation")
                      onClearTopic()
                    }}
                  />
                ) : (
                  <SceneExplanationContent explanation={explanation} />
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
