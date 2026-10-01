import { useCallback, useEffect, useMemo } from "react"
import { useLocation, useNavigate } from "react-router-dom"

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { ExplanationPanel } from "@/features/explanation/ExplanationPanel"
import type { ExplanationSelection } from "@/features/explanation/explanation-selection"
import {
  explanationBaseUrl,
  explanationSelectionUrl,
  parseExplanationHash,
} from "@/features/explanation/explanation-url"
import { contentRepository } from "@/content/content-repository"
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
  const { open: openExplanationPanel } = panel
  const navigation = useSceneNavigation({ sceneId })
  const reducedMotion = useReducedMotion()
  const location = useLocation()
  const navigate = useNavigate()
  const parsedHash = useMemo(
    () => parseExplanationHash(location.hash),
    [location.hash]
  )
  const selection: ExplanationSelection | undefined = useMemo(
    () =>
      parsedHash.kind === "selection"
        ? contentRepository.findExplanationTarget(
            sceneId,
            parsedHash.selectionId
          )
        : undefined,
    [parsedHash, sceneId]
  )
  const selectionKey = selection
    ? `${selection.sceneId}:${selection.kind === "topic" ? selection.elementId : selection.areaId}`
    : undefined
  const invalidHash =
    parsedHash.kind === "invalid" ||
    (parsedHash.kind === "selection" && !selection)

  useEffect(() => {
    if (!invalidHash) return
    const route = contentRepository.findSceneRoute(sceneId)
    if (!route) return
    navigate(explanationBaseUrl(route.path, location.search), { replace: true })
  }, [invalidHash, location.search, navigate, sceneId])

  useEffect(() => {
    if (selectionKey) openExplanationPanel()
  }, [openExplanationPanel, selectionKey])

  /** 선택한 Topic 설명을 열고 접혀 있던 Panel을 펼친다. */
  const selectTopic = useCallback(
    (ownerSceneId: string, elementId: string) => {
      const route = contentRepository.findSceneRoute(ownerSceneId)
      if (!route) return
      openExplanationPanel()
      navigate(
        explanationSelectionUrl(
          route.path,
          elementId,
          ownerSceneId === sceneId ? location.search : ""
        )
      )
    },
    [location.search, navigate, openExplanationPanel, sceneId]
  )
  /** 선택한 Area 설명을 열고 접혀 있던 Panel을 펼친다. */
  const selectArea = useCallback(
    (ownerSceneId: string, areaId: string) => {
      const route = contentRepository.findSceneRoute(ownerSceneId)
      if (!route) return
      openExplanationPanel()
      navigate(
        explanationSelectionUrl(
          route.path,
          areaId,
          ownerSceneId === sceneId ? location.search : ""
        )
      )
    },
    [location.search, navigate, openExplanationPanel, sceneId]
  )

  const clearSelection = useCallback(() => {
    const route = contentRepository.findSceneRoute(sceneId)
    if (!route) return
    navigate(explanationBaseUrl(route.path, location.search))
  }, [location.search, navigate, sceneId])
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
              selectedSceneId={selection?.sceneId}
              selectedElementId={
                selection?.kind === "topic" ? selection.elementId : undefined
              }
              selectedAreaId={
                selection?.kind === "area" ? selection.areaId : undefined
              }
              navigationDisabled={navigation.navigationDisabled}
              reducedMotion={reducedMotion}
              onEnterScene={navigation.enterScene}
              onSelectTopic={selectTopic}
              onSelectArea={selectArea}
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
              selection={selection}
              onClearSelection={clearSelection}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </main>
    </div>
  )
}
