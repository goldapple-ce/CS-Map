import type { Nodes, Parent, RootContent } from "mdast"

type ParentNode = Nodes & Parent

function isParent(node: Nodes): node is ParentNode {
  return "children" in node
}

/** Markdown text 안의 soft line break를 명시적인 break node로 바꾼다. */
function replaceSoftBreaks(parent: ParentNode) {
  const children: RootContent[] = []

  for (const child of parent.children) {
    if (isParent(child)) replaceSoftBreaks(child)

    if (child.type !== "text" || !child.value.includes("\n")) {
      children.push(child as RootContent)
      continue
    }

    const lines = child.value.split("\n")
    lines.forEach((line, index) => {
      if (index > 0) children.push({ type: "break" })
      if (line) children.push({ type: "text", value: line })
    })
  }

  parent.children = children as typeof parent.children
}

/** 문단 구조는 유지하면서 Enter 한 번도 화면 줄바꿈으로 렌더링하는 remark plugin이다. */
export function remarkSoftBreaks() {
  return (tree: Nodes) => {
    if (isParent(tree)) replaceSoftBreaks(tree)
  }
}
