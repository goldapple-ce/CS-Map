import type { Concept, ContentId, Scene } from "@/content/types"

export type ContentValidationIssue = {
  contentId?: ContentId
  path: string
  message: string
}

const makeIssue = (
  contentId: ContentId | undefined,
  path: string,
  message: string
): ContentValidationIssue => ({ contentId, path, message })

function findDuplicates(values: readonly string[]) {
  const seen = new Set<string>()
  const duplicates = new Set<string>()
  for (const value of values) {
    if (seen.has(value)) duplicates.add(value)
    seen.add(value)
  }
  return [...duplicates]
}

export function validateContentGraph(
  scenes: readonly Scene[],
  concepts: readonly Concept[]
): ContentValidationIssue[] {
  const issues: ContentValidationIssue[] = []
  const scenesById = new Map(scenes.map((scene) => [scene.id, scene]))

  for (const id of findDuplicates([
    ...scenes.map(({ id }) => id),
    ...concepts.map(({ id }) => id),
  ])) {
    issues.push(makeIssue(id, "id", `Duplicate content ID: ${id}`))
  }
  for (const slug of findDuplicates(concepts.map(({ slug }) => slug))) {
    issues.push(makeIssue(undefined, "slug", `Duplicate concept slug: ${slug}`))
  }
  for (const pathKey of findDuplicates(
    scenes.map(({ parentId, slug }) => `${parentId ?? "root"}/${slug}`)
  )) {
    issues.push(makeIssue(undefined, "slug", `Duplicate scene path segment: ${pathKey}`))
  }

  for (const scene of scenes) {
    const nodes = scene.elements.filter((element) => element.kind === "node")
    const edges = scene.elements.filter((element) => element.kind === "edge")
    const nodesById = new Map(nodes.map((node) => [node.id, node]))

    for (const id of findDuplicates(scene.elements.map(({ id }) => id))) {
      issues.push(makeIssue(scene.id, "elements", `Duplicate local ID: ${id}`))
    }
    for (const edge of edges) {
      if (!nodesById.has(edge.fromElementId)) {
        issues.push(makeIssue(scene.id, `elements.${edge.id}.fromElementId`, `Unknown node: ${edge.fromElementId}`))
      }
      if (!nodesById.has(edge.toElementId)) {
        issues.push(makeIssue(scene.id, `elements.${edge.id}.toElementId`, `Unknown node: ${edge.toElementId}`))
      }
    }
    for (const node of nodes) {
      if (node.targetSceneId && node.navigateToSceneId) {
        issues.push(makeIssue(scene.id, `elements.${node.id}`, "Node must use either childSceneId or navigateToSceneId, not both"))
      }
      if (node.targetSceneId) {
        const target = scenesById.get(node.targetSceneId)
        if (!target) {
          issues.push(makeIssue(scene.id, `elements.${node.id}.childSceneId`, `Unknown child Scene: ${node.targetSceneId}`))
        } else if (target.parentId !== scene.id) {
          issues.push(makeIssue(scene.id, `elements.${node.id}.childSceneId`, `Child ${target.id} must derive parent ${scene.id}`))
        }
      }
      if (node.navigateToSceneId && !scenesById.has(node.navigateToSceneId)) {
        issues.push(makeIssue(scene.id, `elements.${node.id}.navigateToSceneId`, `Unknown navigation target Scene: ${node.navigateToSceneId}`))
      }
    }
  }

  const adjacency = new Map(
    scenes.map((scene) => [
      scene.id,
      scene.elements.flatMap((element) =>
        element.kind === "node" && element.targetSceneId ? [element.targetSceneId] : []
      ),
    ])
  )
  const visiting = new Set<string>()
  const visited = new Set<string>()
  const visit = (sceneId: string) => {
    if (visiting.has(sceneId)) {
      issues.push(makeIssue(sceneId, "nodes.childSceneId", "Child Scene cycle detected"))
      return
    }
    if (visited.has(sceneId)) return
    visiting.add(sceneId)
    for (const childId of adjacency.get(sceneId) ?? []) visit(childId)
    visiting.delete(sceneId)
    visited.add(sceneId)
  }
  for (const scene of scenes) visit(scene.id)

  return issues
}
