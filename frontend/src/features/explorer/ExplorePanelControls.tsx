import { Button } from "@/components/ui/button"
import {
  Maximize2,
  Minimize2,
  PanelRightClose,
  PanelRightOpen,
} from "lucide-react"

type ExplorerPanelControlsProps = {
  collapsed: boolean
  readingMode: boolean
  onToggleVisibility: () => void
  onToggleReadingMode: () => void
}

/** Explanation Panel의 읽기 모드와 표시 여부를 우측 상단에서 제어한다. */
export function ExplorerPanelControls({
  collapsed,
  readingMode,
  onToggleVisibility,
  onToggleReadingMode,
}: ExplorerPanelControlsProps) {
  return (
    <div>
      {!collapsed ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={readingMode ? "분할 화면으로 돌아가기" : "읽기 모드 열기"}
          onClick={onToggleReadingMode}
        >
          {readingMode ? (
            <Minimize2 aria-hidden="true" />
          ) : (
            <Maximize2 aria-hidden="true" />
          )}
        </Button>
      ) : null}

      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={collapsed ? "설명 패널 열기" : "설명 패널 닫기"}
        onClick={onToggleVisibility}
      >
        {collapsed ? (
          <PanelRightOpen aria-hidden="true" />
        ) : (
          <PanelRightClose aria-hidden="true" />
        )}
      </Button>
    </div>
  )
}
