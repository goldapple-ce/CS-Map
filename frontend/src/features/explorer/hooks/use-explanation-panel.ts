import { useCallback, useRef, useState } from "react"
import { usePanelRef } from "react-resizable-panels"

export type PanelMode = "split" | "reading"

/** Explorer의 분할 패널 상태와 사용자 명령을 관리한다. */
export function useExplanationPanel() {
  const viewportPanelRef = usePanelRef()
  const explanationPanelRef = usePanelRef()

  const lastExpandedSizeRef = useRef(38)

  const [collapsed, setCollapsed] = useState(false)
  const [mode, setMode] = useState<PanelMode>("split")

  /** Explanation Panel을 연다. */
  const open = useCallback(() => {
    setCollapsed(false)
    explanationPanelRef.current?.expand()
  }, [explanationPanelRef])

  /** Explanation Panel을 접고 읽기 모드라면 Viewport를 함께 복원한다. */
  const collapse = useCallback(() => {
    setCollapsed(true)

    if (mode === "reading") {
      setMode("split")
      viewportPanelRef.current?.expand()

      requestAnimationFrame(() => {
        explanationPanelRef.current?.collapse()
      })
      return
    }

    explanationPanelRef.current?.collapse()
  }, [explanationPanelRef, mode, viewportPanelRef])

  /** 분할 화면과 Explanation 읽기 모드를 전환한다. */
  const toggleReadingMode = useCallback(() => {
    if (mode === "reading") {
      setMode("split")
      viewportPanelRef.current?.expand()
      explanationPanelRef.current?.resize(`${lastExpandedSizeRef.current}%`)
      return
    }
    setMode("reading")
    explanationPanelRef.current?.expand()
    requestAnimationFrame(() => viewportPanelRef.current?.collapse())
  }, [explanationPanelRef, viewportPanelRef, mode])

  /** 패널 크기와 접힘 상태를 최신 값으로 유지한다. */
  const handleResize = useCallback(
    (size: number) => {
      const nextCollapsed = size === 0
      setCollapsed(nextCollapsed)

      if (mode === "split" && !nextCollapsed) {
        lastExpandedSizeRef.current = size
      }
    },
    [mode]
  )

  /** Explanation Panel의 열림과 접힘 상태를 전환한다. */
  const toggleVisibility = useCallback(() => {
    if (collapsed) {
      open()
      return
    }

    collapse()
  }, [collapse, collapsed, open])

  return {
    viewportPanelRef,
    explanationPanelRef,
    collapsed,
    mode,
    open,
    toggleVisibility,
    toggleReadingMode,
    handleResize,
  }
}
