import { isValidElement, type ReactNode } from "react"
import ReactMarkdown, {
  defaultUrlTransform,
  type Components,
} from "react-markdown"
import remarkGfm from "remark-gfm"

function textContent(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") {
    return String(node)
  }
  if (Array.isArray(node)) return node.map(textContent).join("")
  if (isValidElement<{ children?: ReactNode }>(node)) {
    return textContent(node.props.children)
  }
  return ""
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

function externalUrl(url: string) {
  return /^https?:\/\//u.test(url) ? defaultUrlTransform(url) : ""
}

type MarkdownContentProps = {
  markdown: string
  idPrefix: string
}

export function MarkdownContent({ markdown, idPrefix }: MarkdownContentProps) {
  const usedHeadingIds = new Map<string, number>()
  const heading = (children: ReactNode, prominent = false) => (
    <h3
      id={headingId(textContent(children), usedHeadingIds, idPrefix)}
      className={
        prominent
          ? "text-xl font-semibold tracking-tight"
          : "pt-4 text-lg font-semibold tracking-tight"
      }
    >
      {children}
    </h3>
  )
  const components: Components = {
    h1: ({ children }) => heading(children, true),
    h2: ({ children }) => heading(children),
    h3: ({ children }) => heading(children),
    h4: ({ children }) => heading(children),
    h5: ({ children }) => heading(children),
    h6: ({ children }) => heading(children),
    p: ({ children }) => <p className="text-sm leading-6">{children}</p>,
    blockquote: ({ children }) => (
      <blockquote className="border-l-2 border-border pl-4 text-sm leading-6">
        {children}
      </blockquote>
    ),
    ul: ({ children }) => (
      <ul className="list-disc space-y-2 pl-5 text-sm leading-6">{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal space-y-2 pl-5 text-sm leading-6">
        {children}
      </ol>
    ),
    li: ({ children }) => <li className="pl-1 [&>p]:inline">{children}</li>,
    a: ({ children, href }) => (
      <a
        href={href}
        target="_blank"
        rel="noreferrer noopener"
        className="font-medium underline decoration-border underline-offset-4 hover:decoration-foreground"
      >
        {children}
      </a>
    ),
    code: ({ children, className }) => (
      <code
        className={`${className ?? ""} rounded bg-muted px-1.5 py-0.5 font-mono text-[0.9em] text-destructive`}
      >
        {children}
      </code>
    ),
    pre: ({ children }) => (
      <pre className="overflow-x-auto rounded-lg border border-border bg-muted/40 p-4 text-xs leading-6 [&>code]:bg-transparent [&>code]:p-0">
        {children}
      </pre>
    ),
    table: ({ children }) => (
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full border-collapse text-left text-sm">
          {children}
        </table>
      </div>
    ),
    th: ({ children }) => (
      <th className="border-b border-border bg-muted/40 px-3 py-2 font-semibold">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="border-b border-border px-3 py-2">{children}</td>
    ),
    hr: () => <hr className="my-5 border-border" />,
  }

  return (
    <div className="space-y-3">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={components}
        allowedElements={[
          "h1",
          "h2",
          "h3",
          "h4",
          "h5",
          "h6",
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
          "a",
          "table",
          "thead",
          "tbody",
          "tr",
          "th",
          "td",
          "hr",
          "br",
          "input",
        ]}
        skipHtml
        urlTransform={externalUrl}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  )
}
