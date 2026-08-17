import { useCallback, useEffect, useRef, useState } from "react"
import { usePanelRef } from "react-resizable-panels"
import { getSceneSnapshot } from "../exploration-memory"

export type PanelMode = "split" | "reading"

export function useExplanationPanel(sceneId?: string) {
  const mapPanelRef = usePanelRef()
  const explanationPanelRef = usePanelRef()

  const lastExpandedSizeRef = useRef(38)
  const explanationScrollTopRef = useRef(0)

  const [collapsed, setCollapsed] = useState(false)
  const [mode, setMode] = useState<PanelMode>("split")
  const [restoreScrollTop, setRestoreScrollTop] = useState(0)

  /** 진입한 Scene의 저장된 Panel 상태와 크기를 복원한다. */
  useEffect(() => {
    const scrollTop = sceneId
      ? (getSceneSnapshot(sceneId)?.explanationScrollTop ?? 0)
      : 0

    explanationScrollTopRef.current = scrollTop
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRestoreScrollTop(scrollTop)
  }, [sceneId])

  /** Explanation Panel을 접는다. */
  const collapse = useCallback(() => {
    setCollapsed(true)
    explanationPanelRef.current?.collapse()
  }, [explanationPanelRef])

  /** Explanation Panel을 연다. */
  const open = useCallback(() => {
    setCollapsed(false)
    explanationPanelRef.current?.expand()
  }, [explanationPanelRef])

  /** 분할 화면과 Explanation 읽기 모드를 전환한다. */
  const toggleReadingMode = useCallback(() => {
    if (mode === "reading") {
      setMode("split")
      mapPanelRef.current?.expand()
      explanationPanelRef.current?.resize(`${lastExpandedSizeRef.current}%`)
      return
    }
    // panelModeRef.current = "reading"
    setMode("reading")
    explanationPanelRef.current?.expand()
    // setPanelMode("reading")
    requestAnimationFrame(() => mapPanelRef.current?.collapse())
  }, [explanationPanelRef, mapPanelRef, mode])

  /** 패널 크기와 접힘 상태를 최신 값으로 유지한다. */
  const handleResize = useCallback((size: number) => {
    const nextCollapsed = size === 0
    setCollapsed(nextCollapsed)

    if (!nextCollapsed) {
      lastExpandedSizeRef.current = size
    }
  }, [])

  /** 현재 Scene 설명의 스크롤 위치를 저장한다. */
  const handleScroll = useCallback((scrollTop: number) => {
    explanationScrollTopRef.current = scrollTop
  }, [])

  /** Scene snapshot에 저장할 현재 설명 스크롤 위치를 반환한다. */
  const getScrollTop = useCallback(() => explanationScrollTopRef.current, [])

  return {
    mapPanelRef,
    explanationPanelRef,
    collapsed,
    mode,
    restoreScrollTop,
    collapse,
    open,
    toggleReadingMode,
    handleResize,
    handleScroll,
    getScrollTop,
  }
}
