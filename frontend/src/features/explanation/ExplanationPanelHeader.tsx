import { Button } from "@/components/ui/button"
import { Maximize2, Minimize2, PanelRightClose } from "lucide-react"

type ExplanationHeaderProps = {
  title: string
  kind: "topic" | "explanation" | "quiz"
  readingMode: boolean
  onCollapse: () => void
  onToggleReadingMode: () => void
}

/** 현재 설명 종류와 Panel 제어 버튼을 표시한다. */
export function ExplanationHeader({
  title,
  kind,
  readingMode,
  onCollapse,
  onToggleReadingMode,
}: ExplanationHeaderProps) {
  const label = {
    topic: "Topic",
    explanation: "Explanation",
    quiz: "Quiz",
  }[kind]

  return (
    <div className="flex shrink-0 items-start gap-3 border-b border-border px-5 py-3">
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {label}
        </p>
        <h2 id="explanation-title" className="truncate text-lg font-semibold">
          {title}
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
          <Minimize2 aria-hidden="true" />
        ) : (
          <Maximize2 aria-hidden="true" />
        )}
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="설명 패널 접기"
        onClick={onCollapse}
      >
        <PanelRightClose aria-hidden="true" />
      </Button>
    </div>
  )
}
