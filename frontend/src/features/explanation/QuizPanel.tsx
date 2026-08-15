import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { SelfCheckQuestion } from "@shared/content/types"

type QuizPanelProps = {
  questions: readonly SelfCheckQuestion[]
}

/** Topic 퀴즈와 사용자가 개별 답변을 여닫는 상태를 표시한다. */
export function QuizPanel({ questions }: QuizPanelProps) {
  const [revealed, setRevealed] = useState<ReadonlySet<number>>(new Set())

  if (questions.length === 0) {
    return (
      <section className="rounded-xl border border-dashed border-border p-6">
        <h3 className="font-semibold">아직 준비된 퀴즈가 없습니다.</h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          이 Topic의 설명은 읽을 수 있지만 확인 문제는 아직 작성되지 않았습니다.
        </p>
      </section>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-medium text-muted-foreground">이해 확인</p>
        <h3 className="mt-1 text-2xl font-semibold tracking-tight">
          현재 Topic 퀴즈
        </h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          질문을 생각해 본 뒤 답변을 확인해 보세요. 결과는 저장되지 않습니다.
        </p>
      </div>

      {questions.map((item, index) => {
        const isRevealed = revealed.has(index)
        const answerId = `quiz-answer-${index}`
        return (
          <section
            key={`${index}-${item.question}`}
            className="space-y-4 rounded-xl border border-border p-5"
          >
            <h4 className="text-base font-semibold">
              {index + 1}. {item.question}
            </h4>
            <Button
              type="button"
              variant="outline"
              aria-expanded={isRevealed}
              aria-controls={answerId}
              onClick={() =>
                setRevealed((current) => {
                  const next = new Set(current)
                  if (next.has(index)) next.delete(index)
                  else next.add(index)
                  return next
                })
              }
            >
              {isRevealed ? (
                <ChevronUp aria-hidden="true" />
              ) : (
                <ChevronDown aria-hidden="true" />
              )}
              {isRevealed ? "답변 숨기기" : "정답 보기"}
            </Button>
            {isRevealed ? (
              <div
                id={answerId}
                role="status"
                className="rounded-lg bg-muted/50 px-4 py-3 text-sm leading-7 text-muted-foreground"
              >
                {item.answer}
              </div>
            ) : null}
          </section>
        )
      })}
    </div>
  )
}
