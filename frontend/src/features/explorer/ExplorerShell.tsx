import { useCallback, useEffect, useState } from "react"

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import {
  ExplanationPanel,
  type TopicSelection,
} from "@/features/explanation/ExplanationPanel"
import { SceneViewport } from "@/features/viewport/SceneViewport"
import { useSceneNavigation } from "./hooks/use-scene-navigation"
import { useExplanationPanel } from "./hooks/use-explanation-panel"
import { useReducedMotion } from "./hooks/use-reduce-motion"
import { ExplorerPanelControls } from "./ExplorePanelControls"

type ExplorerShellProps = {
  sceneId: string
}

/** Route와 World Viewport, Explanation Panel의 탐색 상태를 조립한다. */
export function ExplorerShell({ sceneId }: ExplorerShellProps) {
  const panel = useExplanationPanel()
  const navigation = useSceneNavigation({ sceneId })
  const reducedMotion = useReducedMotion()

  const [topicSelection, setTopicSelection] = useState<TopicSelection>()

  useEffect(() => {
    const frame = requestAnimationFrame(() => setTopicSelection(undefined))

    return () => cancelAnimationFrame(frame)
  }, [sceneId])

  /** 선택한 Topic 설명을 열고 접혀 있던 Panel을 펼친다. */
  const selectTopic = useCallback(
    (ownerSceneId: string, elementId: string, label: string) => {
      setTopicSelection({ sceneId: ownerSceneId, elementId, label })
    },
    []
  )
  return (
    <div className="flex h-full flex-col overflow-hidden">
      <main className="relative min-h-0 flex-1">
        <div className="absolute top-4.5 right-3 z-30 flex items-center gap-1">
          <ExplorerPanelControls
            collapsed={panel.collapsed}
            readingMode={panel.mode === "reading"}
            onToggleVisibility={panel.toggleVisibility}
            onToggleReadingMode={panel.toggleReadingMode}
          />
        </div>
        <ResizablePanelGroup orientation="horizontal">
          <ResizablePanel
            id="scene-viewport"
            panelRef={panel.viewportPanelRef}
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
              onClearTopic={() => setTopicSelection(undefined)}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </main>
    </div>
  )
}
