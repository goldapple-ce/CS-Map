type ExplanationHeaderProps = {
  title: string
  kind: "topic" | "explanation" | "quiz"
}

/** 현재 설명 종류와 Panel 제어 버튼을 표시한다. */
export function ExplanationHeader({ title, kind }: ExplanationHeaderProps) {
  const label = {
    topic: "Topic",
    explanation: "Explanation",
    quiz: "Quiz",
  }[kind]
  return (
    <div className="flex items-center justify-between border-b border-border px-5 py-3">
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {label}
        </p>
        <h1 id="explanation-title" className="text-lg font-semibold">
          {title}
        </h1>
      </div>
    </div>
  )
}
