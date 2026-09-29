import { useState } from "react"
import { ArrowRight, ChevronDown, ChevronUp } from "lucide-react"
import { Link } from "react-router-dom"

import { Button, buttonVariants } from "@/components/ui/button"
import { contentData } from "@/content/generated/content-data"
import { buildQuizBank } from "@/features/quiz/quiz-bank"
import { cn } from "@/lib/utils"

/** 기존 Quiz Bank의 첫 문제로 독립 퀴즈 경험을 짧게 소개한다. */
export function QuizPreview() {
  const [answerRevealed, setAnswerRevealed] = useState(false)
  const representativeQuestion = buildQuizBank(contentData)[0]

  if (!representativeQuestion) return null

  return (
    <section
      aria-labelledby="quiz-preview-title"
      className="mt-12 grid w-full gap-6 rounded-2xl border border-border bg-card p-6 sm:p-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center"
    >
      <div>
        <p className="text-sm font-medium text-muted-foreground">이해 확인</p>
        <h2
          id="quiz-preview-title"
          className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl"
        >
          읽은 내용을 문제로 확인해보세요.
        </h2>
        <p className="mt-3 leading-7 text-muted-foreground">
          원하는 Scene 범위를 골라 기존 확인 문제를 하나씩 풀 수 있어요. 점수
          대신 다시 보고 싶은 문제만 모아드립니다.
        </p>
        <Link to="/quiz" className={cn(buttonVariants({ size: "lg" }), "mt-6")}>
          전체 퀴즈 시작하기
          <ArrowRight aria-hidden="true" />
        </Link>
      </div>

      <article className="rounded-xl border border-border bg-background p-5 sm:p-6">
        <p className="text-sm font-medium text-muted-foreground">
          {representativeQuestion.sceneTitle}
        </p>
        <h3 className="mt-3 text-lg leading-7 font-semibold">
          {representativeQuestion.question}
        </h3>
        <Button
          type="button"
          variant="outline"
          className="mt-5"
          aria-expanded={answerRevealed}
          aria-controls="quiz-preview-answer"
          onClick={() => setAnswerRevealed((current) => !current)}
        >
          {answerRevealed ? (
            <ChevronUp aria-hidden="true" />
          ) : (
            <ChevronDown aria-hidden="true" />
          )}
          {answerRevealed ? "답변 숨기기" : "정답 보기"}
        </Button>
        {answerRevealed ? (
          <p
            id="quiz-preview-answer"
            role="status"
            className="mt-4 rounded-lg bg-muted/60 px-4 py-3 text-sm leading-7 whitespace-pre-line"
          >
            {representativeQuestion.answer}
          </p>
        ) : null}
      </article>
    </section>
  )
}
