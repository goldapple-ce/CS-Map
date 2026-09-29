import { describe, expect, it } from "vitest"

import {
  buildQuizBank,
  buildQuizScopes,
  questionsForScope,
  shuffleQuestions,
} from "../../../../src/features/quiz/quiz-bank"
import type { GeneratedContentData } from "../../../../shared/content/generated-contract"

const content = {
  routes: [
    { id: "root", title: "Root", path: "/explore/root" },
    {
      id: "child",
      title: "Child",
      path: "/explore/root/child",
      parentId: "root",
    },
    {
      id: "leaf",
      title: "Leaf",
      path: "/explore/root/child/leaf",
      parentId: "child",
    },
    {
      id: "empty",
      title: "Empty",
      path: "/explore/root/empty",
      parentId: "root",
    },
  ],
  scenes: {
    root: { scene: { selfCheckQuiz: [{ question: "R?", answer: "R!" }] } },
    child: { scene: {} },
    leaf: {
      scene: {
        selfCheckQuiz: [
          { question: "L1?", answer: "L1!" },
          { question: "L2?", answer: "L2!" },
        ],
      },
    },
    empty: { scene: {} },
  },
} as unknown as Pick<GeneratedContentData, "routes" | "scenes">

describe("Quiz Bank", () => {
  it("기존 문제에 유일한 ID와 Scene 출처를 붙이고 빈 Scene은 제외한다", () => {
    const questions = buildQuizBank(content)

    expect(questions).toHaveLength(3)
    expect(new Set(questions.map((item) => item.id)).size).toBe(3)
    expect(questions[1]).toMatchObject({
      id: "leaf:0",
      sceneId: "leaf",
      sceneTitle: "Leaf",
      scenePath: "/explore/root/child/leaf",
      question: "L1?",
      answer: "L1!",
    })
  })

  it("문제가 있는 가지와 모든 자손의 문제 수만 계산한다", () => {
    const questions = buildQuizBank(content)
    const scopes = buildQuizScopes(content.routes, questions)

    expect(
      scopes.map(({ sceneId, questionCount, depth }) => ({
        sceneId,
        questionCount,
        depth,
      }))
    ).toEqual([
      { sceneId: "root", questionCount: 3, depth: 0 },
      { sceneId: "child", questionCount: 2, depth: 1 },
      { sceneId: "leaf", questionCount: 2, depth: 2 },
    ])
    expect(scopes.some((scope) => scope.sceneId === "empty")).toBe(false)
  })

  it("전체와 선택한 Scene 가지의 문제만 선택한다", () => {
    const questions = buildQuizBank(content)

    expect(questionsForScope(questions, content.routes)).toHaveLength(3)
    expect(
      questionsForScope(questions, content.routes, "child").map(
        (item) => item.id
      )
    ).toEqual(["leaf:0", "leaf:1"])
  })

  it("난수를 주입해 모든 문제를 누락과 중복 없이 섞는다", () => {
    const questions = buildQuizBank(content)
    const shuffled = shuffleQuestions(questions, () => 0)

    expect(shuffled.map((item) => item.id)).toEqual([
      "leaf:0",
      "leaf:1",
      "root:0",
    ])
    expect(new Set(shuffled.map((item) => item.id))).toEqual(
      new Set(questions.map((item) => item.id))
    )
    expect(shuffled).not.toBe(questions)
  })
})
