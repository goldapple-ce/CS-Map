import type { ReactNode } from "react"

type MarkdownBlock =
  | { type: "heading"; level: number; text: string }
  | { type: "paragraph"; text: string }
  | { type: "blockquote"; text: string }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "code"; language?: string; value: string }

function isBlockStart(line: string) {
  return (
    /^#{1,3}\s/u.test(line) ||
    /^>\s?/u.test(line) ||
    /^(?:[-*]|\d+\.)\s+/u.test(line) ||
    /^```/u.test(line)
  )
}

function parseMarkdown(markdown: string): MarkdownBlock[] {
  const lines = markdown.replace(/\r\n?/gu, "\n").split("\n")
  const blocks: MarkdownBlock[] = []
  let index = 0

  while (index < lines.length) {
    const line = lines[index] ?? ""
    if (!line.trim()) {
      index += 1
      continue
    }

    const fence = line.match(/^```([^\s`]*)\s*$/u)
    if (fence) {
      const code: string[] = []
      index += 1
      while (index < lines.length && !/^```\s*$/u.test(lines[index] ?? "")) {
        code.push(lines[index] ?? "")
        index += 1
      }
      index += 1
      blocks.push({
        type: "code",
        language: fence[1] || undefined,
        value: code.join("\n"),
      })
      continue
    }

    const heading = line.match(/^(#{1,3})\s+(.+)$/u)
    if (heading) {
      blocks.push({
        type: "heading",
        level: heading[1]?.length ?? 2,
        text: heading[2] ?? "",
      })
      index += 1
      continue
    }

    if (/^>\s?/u.test(line)) {
      const quote: string[] = []
      while (index < lines.length && /^>\s?/u.test(lines[index] ?? "")) {
        quote.push((lines[index] ?? "").replace(/^>\s?/u, ""))
        index += 1
      }
      blocks.push({ type: "blockquote", text: quote.join(" ") })
      continue
    }

    const listItem = line.match(/^([-*]|\d+\.)\s+(.+)$/u)
    if (listItem) {
      const ordered = /\d+\./u.test(listItem[1] ?? "")
      const items: string[] = []
      while (index < lines.length) {
        const item = (lines[index] ?? "").match(/^([-*]|\d+\.)\s+(.+)$/u)
        if (!item || /\d+\./u.test(item[1] ?? "") !== ordered) break
        items.push(item[2] ?? "")
        index += 1
      }
      blocks.push({ type: "list", ordered, items })
      continue
    }

    const paragraph = [line.trim()]
    index += 1
    while (
      index < lines.length &&
      (lines[index] ?? "").trim() &&
      !isBlockStart(lines[index] ?? "")
    ) {
      paragraph.push((lines[index] ?? "").trim())
      index += 1
    }
    blocks.push({ type: "paragraph", text: paragraph.join(" ") })
  }

  return blocks
}

function inlineContent(text: string): ReactNode[] {
  const tokens = text.split(
    /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\(https?:\/\/[^)\s]+\))/gu
  )
  return tokens.filter(Boolean).map((token, index) => {
    if (token.startsWith("**") && token.endsWith("**")) {
      return <strong key={index}>{token.slice(2, -2)}</strong>
    }
    if (token.startsWith("`") && token.endsWith("`")) {
      return (
        <code
          key={index}
          className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.9em] text-foreground"
        >
          {token.slice(1, -1)}
        </code>
      )
    }
    const link = token.match(/^\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)$/u)
    if (link) {
      return (
        <a
          key={index}
          href={link[2]}
          target="_blank"
          rel="noreferrer noopener"
          className="font-medium text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground"
        >
          {link[1]}
        </a>
      )
    }
    return token
  })
}

function headingId(text: string, used: Map<string, number>, idPrefix: string) {
  const base =
    text
      .normalize("NFKC")
      .toLowerCase()
      .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
      .replace(/^-|-$/gu, "") || "section"
  const count = used.get(base) ?? 0
  used.set(base, count + 1)
  return `${idPrefix}-${count === 0 ? base : `${base}-${count + 1}`}`
}

type MarkdownContentProps = {
  markdown: string
  idPrefix: string
  compact?: boolean
}

export function MarkdownContent({
  markdown,
  idPrefix,
  compact = false,
}: MarkdownContentProps) {
  const usedHeadingIds = new Map<string, number>()

  return (
    <div className={compact ? "space-y-4" : "space-y-6"}>
      {parseMarkdown(markdown).map((block, index) => {
        if (block.type === "heading") {
          const id = headingId(block.text, usedHeadingIds, idPrefix)
          if (block.level === 1) {
            return (
              <h3
                key={index}
                id={id}
                className="text-xl font-semibold tracking-tight"
              >
                {inlineContent(block.text)}
              </h3>
            )
          }
          return (
            <h3
              key={index}
              id={id}
              className="border-b border-border pb-2 text-lg font-semibold tracking-tight"
            >
              {inlineContent(block.text)}
            </h3>
          )
        }
        if (block.type === "paragraph") {
          return (
            <p key={index} className="text-sm leading-7 text-muted-foreground">
              {inlineContent(block.text)}
            </p>
          )
        }
        if (block.type === "blockquote") {
          return (
            <blockquote
              key={index}
              className="border-l-2 border-border pl-4 text-sm leading-7 text-muted-foreground"
            >
              {inlineContent(block.text)}
            </blockquote>
          )
        }
        if (block.type === "list") {
          const List = block.ordered ? "ol" : "ul"
          return (
            <List
              key={index}
              className={
                block.ordered
                  ? "list-decimal space-y-2 pl-5 text-sm leading-7 text-muted-foreground"
                  : "list-disc space-y-2 pl-5 text-sm leading-7 text-muted-foreground"
              }
            >
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>{inlineContent(item)}</li>
              ))}
            </List>
          )
        }
        return (
          <pre
            key={index}
            className="overflow-x-auto rounded-lg border border-border bg-muted/40 p-4 text-xs leading-6 text-foreground"
          >
            <code data-language={block.language}>{block.value}</code>
          </pre>
        )
      })}
    </div>
  )
}
