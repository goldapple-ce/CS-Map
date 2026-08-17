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
  type TopicSelection,
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

/** Scene Route의 URL segment 수로 탐색 깊이를 계산한다. */
function routeDepth(sceneId?: string) {
  if (!sceneId) return 0
  const route = contentRepository.listRoutes().find(({ id }) => id === sceneId)
  return route?.path.split("/").filter(Boolean).length ?? 0
}

/** Route와 World Viewport, Explanation Panel의 탐색 상태를 조립한다. */
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
  const [topicSelection, setTopicSelection] = useState<TopicSelection>()
  const [outlineOpen, setOutlineOpen] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    /** 운영체제의 동작 감소 설정을 현재 화면 상태에 반영한다. */
    const updatePreference = () => setReducedMotion(mediaQuery.matches)
    updatePreference()
    mediaQuery.addEventListener("change", updatePreference)
    return () => mediaQuery.removeEventListener("change", updatePreference)
  }, [])

  /** 떠나는 Scene의 Camera와 Panel 상태를 탐색 스냅샷에 저장한다. */
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
        // panelCollapsed: panelCollapsedRef.current,
        // panelMode: panelModeRef.current,
        // panelSize: panelSizeRef.current,
        explanationScrollTop: explanationScrollTopRef.current,
      })
    },
    []
  )

  /** 진입한 Scene의 저장된 Panel 상태와 크기를 복원한다. */
  const restorePanel = useCallback((targetSceneId: string) => {
    const scrollTop = getSceneSnapshot(targetSceneId)?.explanationScrollTop ?? 0

    explanationScrollTopRef.current = scrollTop
    setRestoreScrollTop(scrollTop)
  }, [])

  useEffect(() => {
    const previousSceneId = previousSceneIdRef.current
    if (previousSceneId && previousSceneId !== sceneId) {
      if (!navigationLockedRef.current) captureScene(previousSceneId)
      if (!returningRef.current) {
        returningRef.current = routeDepth(sceneId) < routeDepth(previousSceneId)
      }
    }
    const restoreFrame = requestAnimationFrame(() => {
      if (sceneId) restorePanel(sceneId)
      setTopicSelection(undefined)
    })
    previousSceneIdRef.current = sceneId
    return () => cancelAnimationFrame(restoreFrame)
  }, [captureScene, restorePanel, sceneId])

  /** Explanation Panel을 접고 현재 접힘 상태를 기록한다. */
  const collapseExplanation = () => {
    panelCollapsedRef.current = true
    explanationPanelRef.current?.collapse()
  }

  /** 접힌 Explanation Panel을 다시 연다. */
  const openExplanation = () => {
    panelCollapsedRef.current = false
    explanationPanelRef.current?.expand()
  }

  /** 분할 화면과 Explanation 읽기 모드를 전환한다. */
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

  /** 선택한 Topic의 Child Scene Route로 진입한다. */
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

  /** Outline에서 고른 Scene Route로 직접 이동한다. */
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

  /** 현재 탐색 스냅샷을 저장하고 이전 Route로 돌아간다. */
  const goBack = () => {
    if (navigationLockedRef.current) return
    navigationLockedRef.current = true
    returningRef.current = true
    setNavigationDisabled(true)
    captureScene(sceneId)
    if (routeDepth(sceneId) <= 2) navigate("/")
    else navigate(-1)
  }

  /** 준비된 Scene 제목을 Explanation Panel 제목에 반영한다. */
  const handleSceneReady = useCallback((_: string, title: string) => {
    setExplanationTitle(title)
  }, [])

  /** 최신 Camera를 다음 탐색 스냅샷 저장용 ref에 보관한다. */
  const handleCameraChange = useCallback((camera: CameraState) => {
    currentCameraRef.current = camera
  }, [])

  /** Scene 전환 잠금을 갱신하고 이동 완료 뒤 적절한 요소에 초점을 둔다. */
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

  /** Explanation Panel의 최신 스크롤 위치를 저장용 ref에 보관한다. */
  const handleExplanationScroll = useCallback((scrollTop: number) => {
    explanationScrollTopRef.current = scrollTop
  }, [])

  /** 선택한 Topic 설명을 열고 접혀 있던 Panel을 펼친다. */
  const selectTopic = useCallback(
    (ownerSceneId: string, elementId: string, label: string) => {
      setTopicSelection({ sceneId: ownerSceneId, elementId, label })
      panelCollapsedRef.current = false
      setPanelCollapsed(false)
      explanationPanelRef.current?.expand()
    },
    [explanationPanelRef]
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
              selectedSceneId={topicSelection?.sceneId}
              selectedElementId={topicSelection?.elementId}
              routeNotFound={routeNotFound}
              navigationDisabled={navigationDisabled}
              reducedMotion={reducedMotion}
              outlineTriggerRef={outlineTriggerRef}
              onOpenOutline={() => setOutlineOpen(true)}
              onEnterScene={enterScene}
              onSelectTopic={selectTopic}
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
              topicSelection={topicSelection}
              readingMode={panelMode === "reading"}
              restoreScrollTop={restoreScrollTop}
              onScrollTopChange={handleExplanationScroll}
              onClearTopic={() => setTopicSelection(undefined)}
              onCollapse={collapseExplanation}
              onToggleReadingMode={toggleReadingMode}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </main>
    </div>
  )
}
