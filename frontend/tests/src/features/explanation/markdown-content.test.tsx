// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest"

import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"

import { MarkdownContent } from "../../../../src/features/explanation/MarkdownContent"

afterEach(cleanup)

describe("MarkdownContent", () => {
  it("soft line break와 빈 줄 문단을 구분하고 block Markdown을 유지한다", () => {
    const { container } = render(
      <MarkdownContent
        idPrefix="soft-break-test"
        markdown={[
          "첫 줄",
          "둘째 줄",
          "",
          "새 문단",
          "",
          "- 목록 첫 줄",
          "  목록 둘째 줄",
          "",
          "```text",
          "code line 1",
          "code line 2",
          "```",
          "",
          "| 열 1 | 열 2 |",
          "| --- | --- |",
          "| 값 1 | 값 2 |",
        ].join("\n")}
      />
    )

    const paragraphs = container.querySelectorAll("p")
    expect(paragraphs[0]?.querySelectorAll("br")).toHaveLength(1)
    expect(paragraphs[0]?.textContent).toBe("첫 줄\n둘째 줄")
    expect(paragraphs[1]).toHaveTextContent("새 문단")
    expect(container.querySelector("li br")).toBeInTheDocument()
    expect(container.querySelector("pre")?.textContent).toContain(
      "code line 1\ncode line 2"
    )
    expect(container.querySelector("pre br")).not.toBeInTheDocument()
    expect(container.querySelector("table")).toBeInTheDocument()
  })

  it("HTTPS와 public content 이미지를 설명 안에서 렌더링한다", () => {
    render(
      <MarkdownContent
        idPrefix="image-test"
        markdown={[
          "![외부 구조도](https://example.com/redis.png)",
          "![로컬 구조도](/content/redis/architecture.png)",
        ].join("\n\n")}
      />
    )

    const externalImage = screen.getByRole("img", { name: "외부 구조도" })
    expect(externalImage).toHaveAttribute(
      "src",
      "https://example.com/redis.png"
    )
    expect(externalImage).toHaveClass("h-auto", "max-w-full")
    expect(screen.getByRole("img", { name: "로컬 구조도" })).toHaveAttribute(
      "src",
      "/content/redis/architecture.png"
    )
  })

  it("위험하거나 허용되지 않은 이미지 URL은 렌더링하지 않는다", () => {
    render(
      <MarkdownContent
        idPrefix="unsafe-image-test"
        markdown={[
          "![데이터 이미지](data:image/png;base64,AAAA)",
          "![스크립트 이미지](javascript:alert(1))",
          "![평문 외부 이미지](http://example.com/redis.png)",
        ].join("\n\n")}
      />
    )

    expect(screen.queryByRole("img")).not.toBeInTheDocument()
  })

  it("기존 HTTP 링크의 새 창 보안 속성을 유지한다", () => {
    render(
      <MarkdownContent
        idPrefix="link-test"
        markdown="[Redis 문서](http://redis.io/docs/)"
      />
    )

    expect(screen.getByRole("link", { name: "Redis 문서" })).toMatchObject({
      target: "_blank",
      rel: "noreferrer noopener",
    })
  })

  it("위험한 링크 URL도 계속 차단한다", () => {
    render(
      <MarkdownContent
        idPrefix="unsafe-link-test"
        markdown="[위험한 링크](javascript:alert(1))"
      />
    )

    expect(screen.getByText("위험한 링크")).not.toHaveAttribute(
      "href",
      "javascript:alert(1)"
    )
  })
})
