import { useCallback, useEffect, useRef, useState } from "react"
import { usePanelRef } from "react-resizable-panels"
import { useNavigate } from "react-router-dom"

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { contentRepository } from "@/content/content-repository"
import {
  ExplanationPanel,
  type PlannedSelection,
} from "@/features/explanation/ExplanationPanel"
import type { CameraState } from "@/features/explorer/camera"
import { ExplorerHeader } from "@/features/explorer/ExplorerHeader"
import {
  getSceneSnapshot,
  saveSceneSnapshot,
  type SceneNavigationRequest,
} from "@/features/explorer/exploration-memory"
import { SceneViewport } from "@/features/explorer/SceneViewport"
import { TopicOutline } from "@/features/explorer/TopicOutline"

type PanelMode = "split" | "reading"

type ExplorerShellProps = {
  sceneId?: string
  routeNotFound: boolean
}

const DEFAULT_CAMERA: CameraState = { centerX: 640, centerY: 360, scale: 1 }

function routeDepth(sceneId?: string) {
  if (!sceneId) return 0
  const route = contentRepository.listRoutes().find(({ id }) => id === sceneId)
  return route?.path.split("/").filter(Boolean).length ?? 0
}

export function ExplorerShell({ sceneId, routeNotFound }: ExplorerShellProps) {
  const navigate = useNavigate()
  const mapPanelRef = usePanelRef()
  const explanationPanelRef = usePanelRef()
  const previousSceneIdRef = useRef(sceneId)
  const navigationLockedRef = useRef(false)
  const returningRef = useRef(false)
  const panelModeRef = useRef<PanelMode>("split")
  const panelCollapsedRef = useRef(false)
  const panelSizeRef = useRef(38)
  const explanationScrollTopRef = useRef(0)
  const currentCameraRef = useRef(DEFAULT_CAMERA)
  const outlineTriggerRef = useRef<HTMLButtonElement>(null)
  const [panelCollapsed, setPanelCollapsed] = useState(false)
  const [panelMode, setPanelMode] = useState<PanelMode>("split")
  const [navigationDisabled, setNavigationDisabled] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [restoreScrollTop, setRestoreScrollTop] = useState(0)
  const [explanationTitle, setExplanationTitle] = useState("google.com 접속")
  const [plannedSelection, setPlannedSelection] = useState<PlannedSelection>()
  const [outlineOpen, setOutlineOpen] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    const updatePreference = () => setReducedMotion(mediaQuery.matches)
    updatePreference()
    mediaQuery.addEventListener("change", updatePreference)
    return () => mediaQuery.removeEventListener("change", updatePreference)
  }, [])

  const captureScene = useCallback(
    (
      targetSceneId: string | undefined,
      camera = currentCameraRef.current,
      focusedElementId?: string
    ) => {
      if (!targetSceneId) return
      saveSceneSnapshot(targetSceneId, {
        focusedElementId,
        camera,
        panelCollapsed: panelCollapsedRef.current,
        panelMode: panelModeRef.current,
        panelSize: panelSizeRef.current,
        explanationScrollTop: explanationScrollTopRef.current,
      })
    },
    []
  )

  const restorePanel = useCallback(
    (targetSceneId: string) => {
      const snapshot = getSceneSnapshot(targetSceneId)
      const restoredMode = snapshot?.panelMode ?? "split"
      const restoredCollapsed = snapshot?.panelCollapsed ?? false
      const restoredSize = snapshot?.panelSize ?? 38
      panelModeRef.current = restoredMode
      panelCollapsedRef.current = restoredCollapsed
      panelSizeRef.current = restoredSize
      explanationScrollTopRef.current = snapshot?.explanationScrollTop ?? 0
      setPanelMode(restoredMode)
      setPanelCollapsed(restoredCollapsed)
      setRestoreScrollTop(snapshot?.explanationScrollTop ?? 0)

      if (restoredMode === "reading") {
        explanationPanelRef.current?.expand()
        requestAnimationFrame(() => mapPanelRef.current?.collapse())
      } else {
        mapPanelRef.current?.expand()
        if (restoredCollapsed) explanationPanelRef.current?.collapse()
        else {
          explanationPanelRef.current?.expand()
          explanationPanelRef.current?.resize(`${restoredSize}%`)
        }
      }
    },
    [explanationPanelRef, mapPanelRef]
  )

  useEffect(() => {
    const previousSceneId = previousSceneIdRef.current
    if (previousSceneId && previousSceneId !== sceneId) {
      if (!navigationLockedRef.current) captureScene(previousSceneId)
      if (!returningRef.current) {
        returningRef.current = routeDepth(sceneId) < routeDepth(previousSceneId)
      }
    }
    if (sceneId) restorePanel(sceneId)
    setPlannedSelection(undefined)
    previousSceneIdRef.current = sceneId
  }, [captureScene, restorePanel, sceneId])

  const collapseExplanation = () => {
    panelCollapsedRef.current = true
    explanationPanelRef.current?.collapse()
  }

  const openExplanation = () => {
    panelCollapsedRef.current = false
    explanationPanelRef.current?.expand()
  }

  const toggleReadingMode = () => {
    if (panelModeRef.current === "reading") {
      panelModeRef.current = "split"
      setPanelMode("split")
      mapPanelRef.current?.expand()
      explanationPanelRef.current?.resize("38%")
      panelSizeRef.current = 38
      return
    }
    panelModeRef.current = "reading"
    setPanelMode("reading")
    requestAnimationFrame(() => mapPanelRef.current?.collapse())
  }

  const enterScene = (request: SceneNavigationRequest) => {
    if (navigationLockedRef.current) return
    const targetRoute = contentRepository
      .listRoutes()
      .find(({ id }) => id === request.sceneId)
    if (!targetRoute) return
    navigationLockedRef.current = true
    returningRef.current = false
    setNavigationDisabled(true)
    captureScene(sceneId, request.camera, request.elementId)
    navigate(targetRoute.path)
  }

  const selectOutlineScene = (targetSceneId: string) => {
    setOutlineOpen(false)
    if (navigationLockedRef.current || targetSceneId === sceneId) return
    const targetRoute = contentRepository
      .listRoutes()
      .find(({ id }) => id === targetSceneId)
    if (!targetRoute) return
    navigationLockedRef.current = true
    returningRef.current = false
    setNavigationDisabled(true)
    captureScene(sceneId)
    navigate(targetRoute.path)
  }

  const goBack = () => {
    if (navigationLockedRef.current) return
    navigationLockedRef.current = true
    returningRef.current = true
    setNavigationDisabled(true)
    captureScene(sceneId)
    if (routeDepth(sceneId) <= 2) navigate("/")
    else navigate(-1)
  }

  const handleSceneReady = useCallback((_: string, title: string) => {
    setExplanationTitle(title)
  }, [])

  const handleCameraChange = useCallback((camera: CameraState) => {
    currentCameraRef.current = camera
  }, [])

  const handleAnimationChange = useCallback(
    (animating: boolean) => {
      setNavigationDisabled(animating)
      if (animating) return
      navigationLockedRef.current = false
      if (returningRef.current && sceneId) {
        const focusedElementId = getSceneSnapshot(sceneId)?.focusedElementId
        if (focusedElementId) {
          document
            .querySelector<HTMLElement>(
              `[data-world-scene-id="${sceneId}"] [data-scene-node-id="${focusedElementId}"]`
            )
            ?.focus()
        }
      } else {
        document.querySelector<HTMLElement>("#scene-title")?.focus()
      }
      returningRef.current = false
    },
    [sceneId]
  )

  const handleExplanationScroll = useCallback((scrollTop: number) => {
    explanationScrollTopRef.current = scrollTop
  }, [])

  const showPlanned = useCallback(
    (elementId: string, label: string) => {
      if (!sceneId) return
      setPlannedSelection({ sceneId, elementId, label })
      panelCollapsedRef.current = false
      setPanelCollapsed(false)
      explanationPanelRef.current?.expand()
    },
    [explanationPanelRef, sceneId]
  )

  return (
    <div className="flex h-svh min-h-0 flex-col overflow-hidden bg-background text-foreground">
      <ExplorerHeader
        panelCollapsed={panelCollapsed}
        navigationDisabled={navigationDisabled}
        onBack={goBack}
        onOpenPanel={openExplanation}
      />

      <TopicOutline
        open={outlineOpen}
        routes={contentRepository.listRoutes()}
        currentSceneId={sceneId}
        navigationDisabled={navigationDisabled}
        triggerRef={outlineTriggerRef}
        onOpenChange={setOutlineOpen}
        onSelectScene={selectOutlineScene}
      />

      <main className="min-h-0 flex-1">
        <ResizablePanelGroup orientation="horizontal">
          <ResizablePanel
            id="scene-viewport"
            panelRef={mapPanelRef}
            defaultSize="62%"
            minSize="36%"
            collapsible={panelMode === "reading"}
            collapsedSize="0%"
          >
            <SceneViewport
              sceneId={sceneId}
              routeNotFound={routeNotFound}
              navigationDisabled={navigationDisabled}
              reducedMotion={reducedMotion}
              outlineTriggerRef={outlineTriggerRef}
              onOpenOutline={() => setOutlineOpen(true)}
              onEnterScene={enterScene}
              onShowPlanned={showPlanned}
              onSceneReady={handleSceneReady}
              onCameraChange={handleCameraChange}
              onAnimationChange={handleAnimationChange}
            />
          </ResizablePanel>

          <ResizableHandle
            withHandle={panelMode === "split"}
            className={
              panelMode === "reading"
                ? "pointer-events-none opacity-0"
                : undefined
            }
          />

          <ResizablePanel
            id="explanation-panel"
            panelRef={explanationPanelRef}
            defaultSize="38%"
            minSize="26%"
            maxSize={panelMode === "reading" ? "100%" : "58%"}
            collapsible
            collapsedSize="0%"
            onResize={({ asPercentage }) => {
              const collapsed = asPercentage === 0
              panelCollapsedRef.current = collapsed
              setPanelCollapsed(collapsed)
              if (!collapsed) panelSizeRef.current = asPercentage
            }}
          >
            <ExplanationPanel
              sceneId={sceneId}
              title={explanationTitle}
              plannedSelection={plannedSelection}
              readingMode={panelMode === "reading"}
              restoreScrollTop={restoreScrollTop}
              onScrollTopChange={handleExplanationScroll}
              onClearPlanned={() => setPlannedSelection(undefined)}
              onCollapse={collapseExplanation}
              onToggleReadingMode={toggleReadingMode}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </main>
    </div>
  )
}
