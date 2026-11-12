// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest"

import { cleanup, render } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"

import { QuizMarkdown } from "../../../../src/features/quiz/QuizMarkdown"

afterEach(cleanup)

describe("QuizMarkdown", () => {
  it("plain string, soft line break와 빈 줄 문단을 구분한다", () => {
    const { container } = render(
      <QuizMarkdown markdown={"첫 줄\n둘째 줄\n\n새 문단"} variant="question" />
    )

    const paragraphs = container.querySelectorAll("p")
    expect(paragraphs).toHaveLength(2)
    expect(paragraphs[0]?.textContent).toBe("첫 줄\n둘째 줄")
    expect(paragraphs[0]?.querySelectorAll("br")).toHaveLength(1)
    expect(paragraphs[0]).not.toHaveClass("whitespace-pre-line")
    expect(paragraphs[1]).toHaveTextContent("새 문단")
  })

  it("목록, 강조, code와 blockquote를 의미에 맞는 element로 표시한다", () => {
    const { container } = render(
      <QuizMarkdown
        markdown={[
          "- **굵게**",
          "  이어지는 설명",
          "- *기울임*과 ~~취소선~~, `inline`",
          "",
          "1. 첫째",
          "2. 둘째",
          "",
          "> 인용",
          "",
          "```java",
          "int value = 1;",
          "```",
        ].join("\n")}
        variant="answer"
      />
    )

    expect(container.querySelector("ul")).toBeInTheDocument()
    expect(container.querySelector("ol")).toBeInTheDocument()
    expect(container.querySelector("strong")).toHaveTextContent("굵게")
    expect(container.querySelector("li br")).toBeInTheDocument()
    expect(container.querySelector("em")).toHaveTextContent("기울임")
    expect(container.querySelector("del")).toHaveTextContent("취소선")
    expect(container.querySelector("li code")).toHaveTextContent("inline")
    expect(container.querySelector("blockquote")).toHaveTextContent("인용")
    expect(container.querySelector("pre")).toHaveClass("overflow-x-auto")
    expect(container.querySelector("pre code")?.textContent).toContain(
      "int value = 1;\n"
    )
    expect(container.querySelector("pre code")).toHaveClass(
      "hljs",
      "language-java"
    )
    expect(container.querySelector("pre code .hljs-type")).toHaveTextContent(
      "int"
    )
    expect(container.querySelector("li code")).not.toHaveClass("hljs")
    expect(container.querySelector("pre br")).not.toBeInTheDocument()
  })

  it("지원하지 않는 element와 raw HTML을 Quiz UI로 렌더링하지 않는다", () => {
    const { container } = render(
      <QuizMarkdown
        markdown={[
          "# 제목",
          "[링크](javascript:alert(1))",
          "![이미지](https://example.com/image.png)",
          "",
          "| 열 |",
          "| --- |",
          "| 값 |",
          "",
          "- [x] 완료",
          "",
          "---",
          "",
          "<script>globalThis.quizHtmlExecuted = true</script>",
          '<img src=x onerror="globalThis.quizHtmlExecuted = true">',
        ].join("\n")}
        variant="question"
      />
    )

    expect(
      container.querySelector("h1, h2, h3, h4, h5, h6")
    ).not.toBeInTheDocument()
    expect(
      container.querySelector("a, img, table, input, hr, script")
    ).not.toBeInTheDocument()
    expect(
      (globalThis as typeof globalThis & { quizHtmlExecuted?: boolean })
        .quizHtmlExecuted
    ).toBeUndefined()
  })

  it("빈 문자열과 지원하지 않는 내용만 있어도 오류 없이 비어 있다", () => {
    const { container, rerender } = render(
      <QuizMarkdown markdown="" variant="question" />
    )
    expect(container.firstElementChild).toBeEmptyDOMElement()

    rerender(<QuizMarkdown markdown="# 지원하지 않는 제목" variant="answer" />)
    expect(container.firstElementChild).toBeEmptyDOMElement()
  })
})
