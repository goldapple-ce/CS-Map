import { useState } from "react"
import { CheckCircle2, Circle, XCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { QuizQuestion } from "@/domain/content-types"
import { cn } from "@/lib/utils"

type QuizPanelProps = {
  questions: readonly QuizQuestion[]
}

export function QuizPanel({ questions }: QuizPanelProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [revealed, setRevealed] = useState<ReadonlySet<string>>(new Set())

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
          답을 고른 뒤 정답과 해설을 확인해 보세요. 결과는 저장되지 않습니다.
        </p>
      </div>

      {questions.map((question, questionIndex) => {
        const selectedOptionId = answers[question.id]
        const isRevealed = revealed.has(question.id)
        const isCorrect = selectedOptionId === question.correctOptionId

        return (
          <fieldset
            key={question.id}
            className="space-y-4 rounded-xl border border-border p-5"
          >
            <legend className="px-1 text-base font-semibold">
              {questionIndex + 1}. {question.prompt}
            </legend>

            <div className="space-y-2">
              {question.options.map((option) => {
                const selected = selectedOptionId === option.id
                const correct = option.id === question.correctOptionId
                const showCorrect = isRevealed && correct
                const showIncorrect = isRevealed && selected && !correct

                return (
                  <label
                    key={option.id}
                    className={cn(
                      "flex cursor-pointer items-start gap-3 rounded-lg border border-border px-4 py-3 text-sm leading-6 transition-colors hover:bg-muted/50 has-focus-visible:ring-3 has-focus-visible:ring-ring/50",
                      selected && "border-foreground bg-muted/40",
                      showCorrect && "border-foreground",
                      showIncorrect && "border-destructive"
                    )}
                  >
                    <input
                      type="radio"
                      name={`quiz-${question.id}`}
                      value={option.id}
                      checked={selected}
                      className="peer sr-only"
                      onChange={() => {
                        setAnswers((current) => ({
                          ...current,
                          [question.id]: option.id,
                        }))
                        setRevealed((current) => {
                          if (!current.has(question.id)) return current
                          const next = new Set(current)
                          next.delete(question.id)
                          return next
                        })
                      }}
                    />
                    {showCorrect ? (
                      <CheckCircle2
                        className="mt-0.5 size-5 shrink-0"
                        aria-hidden="true"
                      />
                    ) : showIncorrect ? (
                      <XCircle
                        className="mt-0.5 size-5 shrink-0 text-destructive"
                        aria-hidden="true"
                      />
                    ) : (
                      <Circle
                        className="mt-0.5 size-5 shrink-0 text-muted-foreground"
                        aria-hidden="true"
                      />
                    )}
                    <span className="min-w-0 flex-1">{option.label}</span>
                    {showCorrect ? (
                      <span className="shrink-0 text-xs font-medium">정답</span>
                    ) : showIncorrect ? (
                      <span className="shrink-0 text-xs font-medium text-destructive">
                        선택한 답
                      </span>
                    ) : selected ? (
                      <span className="shrink-0 text-xs font-medium">
                        선택됨
                      </span>
                    ) : null}
                  </label>
                )
              })}
            </div>

            <Button
              type="button"
              variant="outline"
              disabled={!selectedOptionId}
              onClick={() =>
                setRevealed((current) => new Set(current).add(question.id))
              }
            >
              정답 확인
            </Button>

            {isRevealed ? (
              <div
                role="status"
                className="rounded-lg bg-muted/50 px-4 py-3 text-sm leading-6"
              >
                <p className="font-semibold">
                  {isCorrect ? "정답입니다." : "정답이 아닙니다."}
                </p>
                <p className="mt-1 text-muted-foreground">
                  {question.explanation}
                </p>
              </div>
            ) : null}
          </fieldset>
        )
      })}
    </div>
  )
}
