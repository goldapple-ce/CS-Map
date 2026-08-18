import { useCallback, useEffect, useRef, useState } from "react"

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { contentRepository } from "@/content/content-repository"
import {
  ExplanationPanel,
  type TopicSelection,
} from "@/features/explanation/ExplanationPanel"
import { ExplorerHeader } from "@/features/explorer/ExplorerHeader"
import { SceneViewport } from "@/features/viewport/SceneViewport"
import { TopicOutline } from "@/features/explorer/TopicOutline"
import { useSceneNavigation } from "./hooks/use-scene-navigation"
import { useExplanationPanel } from "./hooks/use-explanation-panel"
import { useReducedMotion } from "./hooks/use-reduce-motion"

type ExplorerShellProps = {
  sceneId: string
}

/** Route와 World Viewport, Explanation Panel의 탐색 상태를 조립한다. */
export function ExplorerShell({ sceneId }: ExplorerShellProps) {
  const panel = useExplanationPanel()
  const navigation = useSceneNavigation({ sceneId })
  const reducedMotion = useReducedMotion()

  const outlineTriggerRef = useRef<HTMLButtonElement>(null)

  const [topicSelection, setTopicSelection] = useState<TopicSelection>()
  const [outlineOpen, setOutlineOpen] = useState(false)

  useEffect(() => {
    const frame = requestAnimationFrame(() => setTopicSelection(undefined))

    return () => cancelAnimationFrame(frame)
  }, [sceneId])

  const selectOutlineScene = (targetSceneId: string) => {
    setOutlineOpen(false)
    navigation.selectScene(targetSceneId)
  }

  /** 선택한 Topic 설명을 열고 접혀 있던 Panel을 펼친다. */
  const selectTopic = useCallback(
    (ownerSceneId: string, elementId: string, label: string) => {
      setTopicSelection({ sceneId: ownerSceneId, elementId, label })
    },
    []
  )

  return (
    <div className="flex h-svh min-h-0 flex-col overflow-hidden bg-background text-foreground">
      <ExplorerHeader
        panelCollapsed={panel.collapsed}
        onOpenPanel={panel.open}
      />

      <TopicOutline
        open={outlineOpen}
        routes={contentRepository.listRoutes()}
        currentSceneId={sceneId}
        navigationDisabled={navigation.navigationDisabled}
        triggerRef={outlineTriggerRef}
        onOpenChange={setOutlineOpen}
        onSelectScene={selectOutlineScene}
      />

      <main className="min-h-0 flex-1">
        <ResizablePanelGroup orientation="horizontal">
          <ResizablePanel
            id="scene-viewport"
            panelRef={panel.viewPortPanelRef}
            defaultSize="62%"
            minSize="36%"

            collapsible={panel.mode === "reading"}
            collapsedSize="0%"
          >
            <SceneViewport
              sceneId={sceneId}
              selectedSceneId={topicSelection?.sceneId}
              selectedElementId={topicSelection?.elementId}
              navigationDisabled={navigation.navigationDisabled}
              reducedMotion={reducedMotion}
              outlineTriggerRef={outlineTriggerRef}
              onOpenOutline={() => setOutlineOpen(true)}
              onEnterScene={navigation.enterScene}
              onSelectTopic={selectTopic}
              onCameraChange={navigation.handleCameraChange}
              onAnimationChange={navigation.handleAnimationChange}
            />
          </ResizablePanel>

          <ResizableHandle
            withHandle={panel.mode === "split"}
            className={
              panel.mode === "reading"
                ? "pointer-events-none opacity-0"
                : undefined
            }
          />

          <ResizablePanel
            id="explanation-panel"
            panelRef={panel.explanationPanelRef}
            defaultSize="38%"
            minSize="26%"
            maxSize={panel.mode === "reading" ? "100%" : "58%"}
            collapsible
            collapsedSize="0%"
            onResize={({ asPercentage }) => {
              panel.handleResize(asPercentage)
            }}
          >
            <ExplanationPanel
              sceneId={sceneId}
              topicSelection={topicSelection}
              readingMode={panel.mode === "reading"}
              onClearTopic={() => setTopicSelection(undefined)}
              onCollapse={panel.collapse}
              onToggleReadingMode={panel.toggleReadingMode}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </main>
    </div>
  )
}
