import type {
  GeneratedContentData,
  RouteIndexEntry,
} from "@shared/content/generated-contract"
import type { ContentId } from "@shared/content/types"

export type QuizBankQuestion = {
  id: string
  sceneId: ContentId
  sceneTitle: string
  scenePath: string
  question: string
  answer: string
}

export type QuizScope = {
  sceneId: ContentId
  title: string
  questionCount: number
  depth: number
}

type QuizContent = Pick<GeneratedContentData, "routes" | "scenes">

/** generated Scene 퀴즈에 출처와 경로를 붙여 하나의 문제 목록으로 만든다. */
export function buildQuizBank(content: QuizContent): QuizBankQuestion[] {
  return content.routes.flatMap((route) => {
    const questions = content.scenes[route.id]?.scene.selfCheckQuiz ?? []

    return questions.map((item, index) => ({
      id: `${route.id}:${index}`,
      sceneId: route.id,
      sceneTitle: route.title,
      scenePath: route.path,
      question: item.question,
      answer: item.answer,
    }))
  })
}

function childIdsByParent(routes: readonly RouteIndexEntry[]) {
  const children = new Map<ContentId, ContentId[]>()

  for (const route of routes) {
    if (!route.parentId) continue
    const siblings = children.get(route.parentId) ?? []
    siblings.push(route.id)
    children.set(route.parentId, siblings)
  }

  return children
}

/** 선택한 Scene 자신과 모든 하위 Scene ID를 반환한다. */
export function sceneBranchIds(
  routes: readonly RouteIndexEntry[],
  sceneId: ContentId
): ReadonlySet<ContentId> {
  const children = childIdsByParent(routes)
  const branch = new Set<ContentId>()
  const pending = [sceneId]

  while (pending.length > 0) {
    const current = pending.pop()!
    if (branch.has(current)) continue
    branch.add(current)
    pending.push(...(children.get(current) ?? []))
  }

  return branch
}

/** 퀴즈가 한 문제 이상 포함된 Scene 가지와 문제 수를 Route 순서대로 만든다. */
export function buildQuizScopes(
  routes: readonly RouteIndexEntry[],
  questions: readonly QuizBankQuestion[]
): QuizScope[] {
  const routeById = new Map(routes.map((route) => [route.id, route]))

  return routes.flatMap((route) => {
    const branch = sceneBranchIds(routes, route.id)
    const questionCount = questions.filter((item) =>
      branch.has(item.sceneId)
    ).length
    if (questionCount === 0) return []

    let depth = 0
    let current = route
    while (current.parentId) {
      depth += 1
      const parent = routeById.get(current.parentId)
      if (!parent) break
      current = parent
    }

    return [{ sceneId: route.id, title: route.title, questionCount, depth }]
  })
}

/** 전체 또는 선택한 Scene 가지에 포함되는 문제만 원래 순서로 고른다. */
export function questionsForScope(
  questions: readonly QuizBankQuestion[],
  routes: readonly RouteIndexEntry[],
  sceneId?: ContentId
): QuizBankQuestion[] {
  if (!sceneId) return [...questions]
  const branch = sceneBranchIds(routes, sceneId)
  return questions.filter((item) => branch.has(item.sceneId))
}

/** Fisher-Yates 방식으로 복사한 배열만 섞어 원본과 세션 순서를 분리한다. */
export function shuffleQuestions(
  questions: readonly QuizBankQuestion[],
  random: () => number = Math.random
): QuizBankQuestion[] {
  const shuffled = [...questions]

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1))
    ;[shuffled[index], shuffled[target]] = [shuffled[target], shuffled[index]]
  }

  return shuffled
}
