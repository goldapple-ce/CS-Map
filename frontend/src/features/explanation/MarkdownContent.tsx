import { isValidElement, type ReactNode } from "react"
import ReactMarkdown, {
  defaultUrlTransform,
  type Components,
  type UrlTransform,
} from "react-markdown"
import remarkGfm from "remark-gfm"

import { syntaxHighlightPlugins } from "@/lib/markdown-syntax-highlighting"
import { remarkSoftBreaks } from "@/lib/remark-soft-breaks"

/** React Node에서 제목 ID 생성에 사용할 평문 문자열을 재귀적으로 추출한다. */
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

/** 중복 제목을 구분하면서 패널 내부에서 고유한 heading ID를 만든다. */
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

/** 링크는 HTTP(S), 이미지는 HTTPS와 공개 content 경로만 허용한다. */
const safeUrl: UrlTransform = (url, _key, node) => {
  if (node.tagName === "img") {
    const isAllowedImage = /^https:\/\//u.test(url) || /^\/content\//u.test(url)
    return isAllowedImage ? defaultUrlTransform(url) : ""
  }
  return /^https?:\/\//u.test(url) ? defaultUrlTransform(url) : ""
}

type MarkdownContentProps = {
  markdown: string
  idPrefix: string
}

/** 허용된 Markdown 요소를 안전한 Explanation 스타일로 렌더링한다. */
export function MarkdownContent({ markdown, idPrefix }: MarkdownContentProps) {
  const usedHeadingIds = new Map<string, number>()
  /** 제목 깊이를 패널용 heading으로 통일하고 고유 ID를 부여한다. */
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
      <blockquote className="border-l-2 border-border pl-4 text-sm leading-6 text-muted-foreground">
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
    img: ({ src, alt, title }) =>
      src ? (
        <img
          src={src}
          alt={alt ?? ""}
          title={title}
          loading="lazy"
          decoding="async"
          className="block h-auto max-w-full rounded-lg"
        />
      ) : null,
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
    <div className="markdown-syntax space-y-3">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkSoftBreaks]}
        rehypePlugins={syntaxHighlightPlugins}
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
          "img",
          "table",
          "thead",
          "tbody",
          "tr",
          "th",
          "td",
          "hr",
          "br",
          "input",
          "span",
        ]}
        skipHtml
        urlTransform={safeUrl}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  )
}
