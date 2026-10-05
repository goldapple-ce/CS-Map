import { useMemo, useState } from "react"
import { Check, ChevronDown, RotateCcw, Undo2 } from "lucide-react"
import { Link } from "react-router-dom"

import { Button, buttonVariants } from "@/components/ui/button"
import { contentData } from "@/content/generated/content-data"
import { cn } from "@/lib/utils"
import type { GeneratedContentData } from "@shared/content/generated-contract"
import { QuizMarkdown } from "./QuizMarkdown"
import {
  buildQuizBank,
  buildQuizScopes,
  questionsForScope,
  shuffleQuestions,
  type QuizBankQuestion,
} from "./quiz-bank"

type SessionState =
  | { phase: "setup" }
  | {
      phase: "solving"
      questions: QuizBankQuestion[]
      currentIndex: number
      answerRevealed: boolean
      reviewQuestionIds: string[]
    }
  | {
      phase: "result"
      questions: QuizBankQuestion[]
      reviewQuestionIds: string[]
    }

const ALL_SCENES = "all"

type QuizPageProps = {
  content?: Pick<GeneratedContentData, "routes" | "scenes">
  random?: () => number
}

/** 기존 Scene 문제를 범위별 일회성 자기 평가 세션으로 제공한다. */
export function QuizPage({
  content = contentData,
  random = Math.random,
}: QuizPageProps = {}) {
  const quizBank = useMemo(() => buildQuizBank(content), [content])
  const scopes = useMemo(
    () => buildQuizScopes(content.routes, quizBank),
    [content.routes, quizBank]
  )
  const [selectedScope, setSelectedScope] = useState(ALL_SCENES)
  const [session, setSession] = useState<SessionState>({ phase: "setup" })

  const selectedQuestions = questionsForScope(
    quizBank,
    content.routes,
    selectedScope === ALL_SCENES ? undefined : selectedScope
  )
  const selectedScopeTitle =
    selectedScope === ALL_SCENES
      ? "전체 Scene"
      : (scopes.find((scope) => scope.sceneId === selectedScope)?.title ??
        "선택한 Scene")

  const startSession = () => {
    if (selectedQuestions.length === 0) return
    setSession({
      phase: "solving",
      questions: shuffleQuestions(selectedQuestions, random),
      currentIndex: 0,
      answerRevealed: false,
      reviewQuestionIds: [],
    })
  }

  const evaluateCurrent = (needsReview: boolean) => {
    if (session.phase !== "solving" || !session.answerRevealed) return
    const current = session.questions[session.currentIndex]
    const reviewQuestionIds = needsReview
      ? [...session.reviewQuestionIds, current.id]
      : session.reviewQuestionIds

    if (session.currentIndex === session.questions.length - 1) {
      setSession({
        phase: "result",
        questions: session.questions,
        reviewQuestionIds,
      })
      return
    }

    setSession({
      ...session,
      currentIndex: session.currentIndex + 1,
      answerRevealed: false,
      reviewQuestionIds,
    })
  }

  const resetSetup = () => setSession({ phase: "setup" })

  if (quizBank.length === 0) {
    return (
      <div className="mx-auto flex h-full w-full max-w-3xl items-center overflow-y-auto px-6 py-12">
        <section className="w-full rounded-2xl border border-dashed border-border p-8">
          <p className="text-sm font-medium text-muted-foreground">퀴즈</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            아직 풀 수 있는 문제가 없습니다.
          </h1>
          <p className="mt-3 leading-7 text-muted-foreground">
            Scene에 확인 문제가 추가되면 이곳에서 범위를 골라 풀 수 있어요.
          </p>
        </section>
      </div>
    )
  }

  if (session.phase === "setup") {
    return (
      <div className="mx-auto flex h-full w-full max-w-3xl flex-col justify-center overflow-y-auto px-6 py-12">
        <section>
          <p className="text-sm font-medium text-muted-foreground">독립 퀴즈</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight">
            어디까지 확인해볼까요?
          </h1>
          <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">
            범위를 고르면 그 안에 있는 기존 확인 문제를 모두 한 번씩 보여드려요.
            점수나 결과는 저장하지 않습니다.
          </p>
        </section>

        <section className="mt-10 rounded-2xl border border-border bg-card p-6">
          <label
            id="quiz-scope-title"
            htmlFor="quiz-scope"
            className="text-sm font-semibold"
          >
            출제 범위
          </label>
          <div className="relative mt-3">
            <select
              id="quiz-scope"
              value={selectedScope}
              onChange={(event) => setSelectedScope(event.target.value)}
              className="h-11 w-full appearance-none rounded-lg border border-input bg-background px-3 pr-10 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value={ALL_SCENES}>
                전체 Scene · {quizBank.length}문제
              </option>
              {scopes.map((scope) => (
                <option key={scope.sceneId} value={scope.sceneId}>
                  {`${"　".repeat(scope.depth)}${scope.title} · ${scope.questionCount}문제`}
                </option>
              ))}
            </select>
            <ChevronDown
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground"
            />
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            {selectedScopeTitle}의 {selectedQuestions.length}문제를 순서만 섞어
            출제합니다.
          </p>
          <Button className="mt-6 w-full" size="lg" onClick={startSession}>
            {selectedQuestions.length}문제 시작하기
          </Button>
        </section>
      </div>
    )
  }

  if (session.phase === "solving") {
    const current = session.questions[session.currentIndex]
    const answerId = `standalone-quiz-answer-${session.currentIndex}`

    return (
      <div className="mx-auto flex h-full w-full max-w-3xl flex-col overflow-y-auto px-6 py-10">
        <div className="flex items-center justify-between gap-4 text-sm text-muted-foreground">
          <span>{selectedScopeTitle}</span>
          <span aria-label="퀴즈 진행 상황">
            {session.currentIndex + 1} / {session.questions.length}
          </span>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-[width]"
            style={{
              width: `${((session.currentIndex + 1) / session.questions.length) * 100}%`,
            }}
          />
        </div>

        <article className="mt-8 flex flex-1 flex-col rounded-2xl border border-border bg-card p-6 sm:p-8">
          <Link
            to={current.scenePath}
            className="w-fit text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            {current.sceneTitle}
          </Link>
          <h1 className="mt-5 text-2xl leading-snug font-semibold tracking-tight sm:text-3xl">
            문제 {session.currentIndex + 1}
          </h1>
          <div className="mt-4">
            <QuizMarkdown markdown={current.question} variant="question" />
          </div>

          <div className="mt-auto pt-10">
            {!session.answerRevealed ? (
              <Button
                variant="outline"
                size="lg"
                aria-expanded="false"
                aria-controls={answerId}
                onClick={() => setSession({ ...session, answerRevealed: true })}
              >
                정답 보기
              </Button>
            ) : (
              <div className="space-y-6">
                <div
                  id={answerId}
                  role="status"
                  className="rounded-xl bg-muted/60 p-5"
                >
                  <QuizMarkdown markdown={current.answer} variant="answer" />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => evaluateCurrent(true)}
                  >
                    <Undo2 aria-hidden="true" />
                    다시 볼래요
                  </Button>
                  <Button size="lg" onClick={() => evaluateCurrent(false)}>
                    <Check aria-hidden="true" />
                    알겠어요
                  </Button>
                </div>
              </div>
            )}
          </div>
        </article>
      </div>
    )
  }

  const reviewIds = new Set(session.reviewQuestionIds)
  const reviewQuestions = session.questions
    .map((item, index) => ({ item, problemNumber: index + 1 }))
    .filter(({ item }) => reviewIds.has(item.id))

  return (
    <div className="mx-auto h-full w-full max-w-3xl overflow-y-auto px-6 py-12">
      <p className="text-sm font-medium text-muted-foreground">퀴즈 완료</p>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight">
        {session.questions.length}문제를 모두 확인했어요.
      </h1>
      <p className="mt-3 leading-7 text-muted-foreground">
        {reviewQuestions.length > 0
          ? `다시 볼 문제 ${reviewQuestions.length}개를 모았습니다.`
          : "다시 볼 문제 없이 모두 알겠다고 표시했어요."}
      </p>

      {reviewQuestions.length > 0 ? (
        <section aria-labelledby="review-title" className="mt-10 space-y-4">
          <h2 id="review-title" className="text-xl font-semibold">
            다시 볼 문제
          </h2>
          {reviewQuestions.map(({ item, problemNumber }) => (
            <article
              key={item.id}
              className="rounded-xl border border-border bg-card p-5"
            >
              <Link
                to={item.scenePath}
                className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                {item.sceneTitle}
              </Link>
              <h3 className="mt-3 font-semibold">문제 {problemNumber}</h3>
              <div className="mt-2">
                <QuizMarkdown markdown={item.question} variant="question" />
              </div>
              <div className="mt-3 rounded-lg bg-muted/60 px-4 py-3">
                <QuizMarkdown markdown={item.answer} variant="answer" />
              </div>
            </article>
          ))}
        </section>
      ) : null}

      <div className="mt-10 flex flex-wrap gap-3">
        <Button onClick={startSession}>
          <RotateCcw aria-hidden="true" />
          같은 범위 다시 풀기
        </Button>
        <Button variant="outline" onClick={resetSetup}>
          범위 다시 선택하기
        </Button>
        <Link to="/" className={cn(buttonVariants({ variant: "ghost" }))}>
          홈으로
        </Link>
      </div>
    </div>
  )
}
