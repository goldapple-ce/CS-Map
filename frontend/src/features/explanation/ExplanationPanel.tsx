import { useEffect, useRef, useState } from "react"
import {
  BookOpen,
  BookOpenText,
  Columns2,
  ListChecks,
  PanelRightClose,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { contentRepository } from "@/content/content-repository"
import type { Concept, Scene } from "@/domain/content-types"
import { MarkdownContent } from "@/features/explanation/MarkdownContent"
import { QuizPanel } from "@/features/explanation/QuizPanel"

export type TopicSelection = {
  sceneId: string
  elementId: string
  label: string
}

type ConceptExplanation = {
  concept: Concept
  markdown: string
  contextSummary: string
  occurrenceId: string
}

type ExplanationState =
  | { status: "idle" | "loading" }
  | {
      status: "loaded"
      scene: Scene
      markdown: string
      concepts: ConceptExplanation[]
    }
  | { status: "error"; message: string }

type ExplanationPanelProps = {
  sceneId?: string
  title: string
  topicSelection?: TopicSelection
  readingMode: boolean
  restoreScrollTop: number
  onScrollTopChange: (scrollTop: number) => void
  onClearTopic: () => void
  onCollapse: () => void
  onToggleReadingMode: () => void
}

export function ExplanationPanel({
  sceneId,
  title,
  topicSelection,
  readingMode,
  restoreScrollTop,
  onScrollTopChange,
  onClearTopic,
  onCollapse,
  onToggleReadingMode,
}: ExplanationPanelProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const explanationScrollTopRef = useRef(restoreScrollTop)
  const [state, setState] = useState<ExplanationState>({ status: "idle" })
  const [activeTab, setActiveTab] = useState<"explanation" | "quiz">(
    "explanation"
  )

  useEffect(() => {
    if (!sceneId) {
      setState({ status: "idle" })
      return
    }
    let active = true
    setState({ status: "loading" })
    contentRepository
      .loadScene(sceneId)
      .then(async ({ scene, markdown }) => {
        const conceptLoads = new Map<
          string,
          ReturnType<typeof contentRepository.loadConcept>
        >()
        const concepts = await Promise.all(
          scene.conceptRefs.map(async (usage) => {
            let loaded = conceptLoads.get(usage.conceptId)
            if (!loaded) {
              loaded = contentRepository.loadConcept(usage.conceptId)
              conceptLoads.set(usage.conceptId, loaded)
            }
            const { concept, markdown: conceptMarkdown } = await loaded
            const context = scene.contexts.find(
              ({ id }) => id === usage.contextId
            )
            return {
              concept,
              markdown: conceptMarkdown,
              contextSummary:
                context?.summary ?? "현재 장면에서 사용되는 공통 개념입니다.",
              occurrenceId: usage.occurrenceId,
            }
          })
        )
        if (active) setState({ status: "loaded", scene, markdown, concepts })
      })
      .catch((error: unknown) => {
        if (!active) return
        setState({
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "설명 콘텐츠를 불러오지 못했습니다.",
        })
      })
    return () => {
      active = false
    }
  }, [sceneId])

  useEffect(() => {
    explanationScrollTopRef.current = restoreScrollTop
  }, [restoreScrollTop, sceneId])

  useEffect(() => {
    if (topicSelection) setActiveTab("explanation")
  }, [topicSelection])

  useEffect(() => {
    const viewport = scrollAreaRef.current?.querySelector<HTMLElement>(
      '[data-slot="scroll-area-viewport"]'
    )
    if (!viewport) return

    viewport.scrollTop =
      topicSelection || activeTab === "quiz"
        ? 0
        : explanationScrollTopRef.current
    const handleScroll = () => {
      if (topicSelection || activeTab !== "explanation") return
      explanationScrollTopRef.current = viewport.scrollTop
      onScrollTopChange(viewport.scrollTop)
    }
    viewport.addEventListener("scroll", handleScroll, { passive: true })
    return () => viewport.removeEventListener("scroll", handleScroll)
  }, [activeTab, onScrollTopChange, topicSelection, sceneId])

  const panelTitle = topicSelection?.label ?? title

  return (
    <aside
      aria-labelledby="explanation-title"
      className="flex size-full min-h-0 flex-col bg-background"
    >
      <div className="flex shrink-0 items-start gap-3 border-b border-border px-5 py-4">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {topicSelection
              ? "Topic"
              : activeTab === "quiz"
                ? "Quiz"
                : "Explanation"}
          </p>
          <h2 id="explanation-title" className="truncate text-lg font-semibold">
            {panelTitle}
          </h2>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={readingMode ? "분할 화면으로 돌아가기" : "읽기 모드 열기"}
          onClick={onToggleReadingMode}
        >
          {readingMode ? (
            <Columns2 aria-hidden="true" />
          ) : (
            <BookOpen aria-hidden="true" />
          )}
        </Button>
        {!readingMode ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="설명 패널 접기"
            onClick={onCollapse}
          >
            <PanelRightClose aria-hidden="true" />
          </Button>
        ) : null}
      </div>

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
                  <section className="space-y-5">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">
                        Topic 설명
                      </p>
                      <h3 className="text-2xl font-semibold tracking-tight">
                        {topicSelection.label}
                      </h3>
                    </div>
                    <p className="text-sm leading-7 text-muted-foreground">
                      이 Topic에는 아직 작성된 상세 설명이 없습니다. 현재 Scene의
                      흐름과 연결 관계는 지도에서 계속 확인할 수 있습니다.
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onClearTopic}
                    >
                      현재 Scene 설명으로 돌아가기
                    </Button>
                  </section>
                ) : state.status === "loading" || state.status === "idle" ? (
                  <p className="text-sm text-muted-foreground">
                    설명을 불러오는 중입니다.
                  </p>
                ) : state.status === "error" ? (
                  <p className="text-sm text-destructive">{state.message}</p>
                ) : (
                  <>
                    <MarkdownContent
                      markdown={state.markdown}
                      idPrefix={`scene-${state.scene.id}`}
                    />

                    {state.concepts.map(
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
                            <p className="text-lg font-semibold">
                              {concept.title}
                            </p>
                            <p className="text-sm leading-7 text-muted-foreground">
                              {concept.summary}
                            </p>
                          </div>
                          <MarkdownContent
                            markdown={markdown}
                            idPrefix={`concept-${concept.id}-${occurrenceId}`}
                            compact
                          />
                        </section>
                      )
                    )}
                  </>
                )}
              </article>
            </TabsContent>

            <TabsContent
              value="quiz"
              keepMounted
              className="data-hidden:hidden"
            >
              <article className="mx-auto max-w-3xl px-6 py-7">
                {state.status === "loading" || state.status === "idle" ? (
                  <p className="text-sm text-muted-foreground">
                    퀴즈를 불러오는 중입니다.
                  </p>
                ) : state.status === "error" ? (
                  <p className="text-sm text-destructive">{state.message}</p>
                ) : (
                  <QuizPanel
                    key={state.scene.id}
                    questions={state.scene.selfCheckQuiz ?? []}
                  />
                )}
              </article>
            </TabsContent>
          </ScrollArea>
        </div>
      </Tabs>
    </aside>
  )
}
