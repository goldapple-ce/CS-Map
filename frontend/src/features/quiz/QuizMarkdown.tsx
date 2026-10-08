import ReactMarkdown, { type Components } from "react-markdown"
import remarkGfm from "remark-gfm"

import { cn } from "@/lib/utils"
import { remarkSoftBreaks } from "@/lib/remark-soft-breaks"

type QuizMarkdownProps = {
  markdown: string
  variant: "question" | "answer"
}

const allowedElements = [
  "p",
  "blockquote",
  "ul",
  "ol",
  "li",
  "strong",
  "em",
  "del",
  "code",
  "pre",
  "br",
]

const components: Components = {
  p: ({ children }) => <p>{children}</p>,
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-border pl-4 text-muted-foreground">
      {children}
    </blockquote>
  ),
  ul: ({ children }) => (
    <ul className="list-disc space-y-2 pl-5">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal space-y-2 pl-5">{children}</ol>
  ),
  li: ({ children }) => <li className="pl-1 [&>p]:inline">{children}</li>,
  code: ({ children, className }) => (
    <code
      className={`${className ?? ""} rounded bg-muted px-1.5 py-0.5 font-mono text-[0.9em] text-destructive`}
    >
      {children}
    </code>
  ),
  pre: ({ children }) => (
    <pre className="overflow-x-auto rounded-lg border border-border bg-muted/40 p-4 text-xs leading-6 [&>code]:bg-transparent [&>code]:p-0 [&>code]:text-foreground!">
      {children}
    </pre>
  ),
}

/** Quiz 문자열을 Explanation보다 좁은 허용 목록으로 안전하게 표시한다. */
export function QuizMarkdown({ markdown, variant }: QuizMarkdownProps) {
  return (
    <div
      className={cn(
        "[&>*+*]:mt-3",
        variant === "question"
          ? "text-base leading-7 text-foreground"
          : "text-sm leading-7 text-muted-foreground"
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkSoftBreaks]}
        components={components}
        allowedElements={allowedElements}
        skipHtml
      >
        {markdown}
      </ReactMarkdown>
    </div>
  )
}
