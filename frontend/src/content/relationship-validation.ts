import type {
  Concept,
  ContentId,
  Relationship,
  Scene,
} from "@/domain/content-types"

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
  const conceptsById = new Map(concepts.map((concept) => [concept.id, concept]))

  for (const id of findDuplicates([
    ...scenes.map(({ id }) => id),
    ...concepts.map(({ id }) => id),
    ...scenes.flatMap(({ contexts }) => contexts.map(({ id }) => id)),
    ...scenes.flatMap(({ occurrences }) => occurrences.map(({ id }) => id)),
  ])) {
    issues.push(makeIssue(id, "id", `Duplicate content ID: ${id}`))
  }
  for (const slug of findDuplicates(concepts.map(({ slug }) => slug))) {
    issues.push(makeIssue(undefined, "slug", `Duplicate concept slug: ${slug}`))
  }
  for (const pathKey of findDuplicates(
    scenes.map(({ parentId, slug }) => `${parentId ?? "root"}/${slug}`)
  )) {
    issues.push(
      makeIssue(undefined, "slug", `Duplicate scene path segment: ${pathKey}`)
    )
  }

  for (const scene of scenes) {
    validateScene(scene, scenesById, conceptsById, issues)
  }
  validateContainsCycles(scenes, issues)
  validateImplementationCycles(scenes, issues)

  return issues
}

function validateScene(
  scene: Scene,
  scenesById: ReadonlyMap<ContentId, Scene>,
  conceptsById: ReadonlyMap<ContentId, Concept>,
  issues: ContentValidationIssue[]
) {
  const elementsById = new Map(scene.elements.map((item) => [item.id, item]))
  const contextsById = new Map(scene.contexts.map((item) => [item.id, item]))
  const occurrencesById = new Map(
    scene.occurrences.map((item) => [item.id, item])
  )

  for (const [path, ids] of [
    ["elements", scene.elements.map(({ id }) => id)],
    ["contexts", scene.contexts.map(({ id }) => id)],
    ["occurrences", scene.occurrences.map(({ id }) => id)],
  ] as const) {
    for (const id of findDuplicates(ids)) {
      issues.push(makeIssue(scene.id, path, `Duplicate local ID: ${id}`))
    }
  }

  if (scene.parentId && !scenesById.has(scene.parentId)) {
    issues.push(
      makeIssue(scene.id, "parentId", `Unknown parent scene: ${scene.parentId}`)
    )
  }
  if (
    scene.status === "published" &&
    scene.parentId &&
    scenesById.get(scene.parentId)?.status !== "published"
  ) {
    issues.push(
      makeIssue(
        scene.id,
        "parentId",
        `Published scene requires a published parent: ${scene.parentId}`
      )
    )
  }
  if (
    scene.parentId &&
    scenesById.get(scene.parentId)?.scenarioId !== scene.scenarioId
  ) {
    issues.push(
      makeIssue(
        scene.id,
        "scenarioId",
        `Child scene must share its parent scenario: ${scene.scenarioId}`
      )
    )
  }

  for (const element of scene.elements) {
    if (element.conceptId && !conceptsById.has(element.conceptId)) {
      issues.push(
        makeIssue(
          scene.id,
          `elements.${element.id}.conceptId`,
          `Unknown concept: ${element.conceptId}`
        )
      )
    }
    if (element.status === "planned" && element.targetSceneId) {
      issues.push(
        makeIssue(
          scene.id,
          `elements.${element.id}.targetSceneId`,
          "Planned elements must not navigate to a scene"
        )
      )
      continue
    }
    if (element.targetSceneId) {
      const target = scenesById.get(element.targetSceneId)
      if (!target) {
        issues.push(
          makeIssue(
            scene.id,
            `elements.${element.id}.targetSceneId`,
            `Unknown target scene: ${element.targetSceneId}`
          )
        )
      } else {
        if (target.parentId !== scene.id) {
          issues.push(
            makeIssue(
              scene.id,
              `elements.${element.id}.targetSceneId`,
              `Target ${target.id} must declare parentId ${scene.id}`
            )
          )
        }
        if (scene.status === "published" && target.status !== "published") {
          issues.push(
            makeIssue(
              scene.id,
              `elements.${element.id}.targetSceneId`,
              `Published scene cannot navigate to ${target.status} scene ${target.id}`
            )
          )
        }
      }
    }
  }

  for (const occurrence of scene.occurrences) {
    checkReference(
      conceptsById,
      occurrence.conceptId,
      scene.id,
      `occurrences.${occurrence.id}.conceptId`,
      "concept",
      issues
    )
    checkReference(
      contextsById,
      occurrence.contextId,
      scene.id,
      `occurrences.${occurrence.id}.contextId`,
      "context",
      issues
    )
    if (occurrence.elementId) {
      checkReference(
        elementsById,
        occurrence.elementId,
        scene.id,
        `occurrences.${occurrence.id}.elementId`,
        "element",
        issues
      )
    }
    for (const targetId of occurrence.implementationSceneIds) {
      checkReference(
        scenesById,
        targetId,
        scene.id,
        `occurrences.${occurrence.id}.implementationSceneIds`,
        "implementation scene",
        issues
      )
      if (
        scene.status === "published" &&
        scenesById.get(targetId)?.status !== "published"
      ) {
        issues.push(
          makeIssue(
            scene.id,
            `occurrences.${occurrence.id}.implementationSceneIds`,
            `Published scene requires published implementation scene: ${targetId}`
          )
        )
      }
    }
  }

  for (const usage of scene.conceptRefs) {
    checkReference(
      conceptsById,
      usage.conceptId,
      scene.id,
      "conceptRefs",
      "concept",
      issues
    )
    const occurrence = occurrencesById.get(usage.occurrenceId)
    if (
      occurrence &&
      (occurrence.conceptId !== usage.conceptId ||
        occurrence.contextId !== usage.contextId)
    ) {
      issues.push(
        makeIssue(
          scene.id,
          "conceptRefs",
          `Usage ${usage.occurrenceId} must match its occurrence concept and context`
        )
      )
    }
    checkReference(
      occurrencesById,
      usage.occurrenceId,
      scene.id,
      "conceptRefs",
      "occurrence",
      issues
    )
    checkReference(
      contextsById,
      usage.contextId,
      scene.id,
      "conceptRefs",
      "context",
      issues
    )
  }

  for (const relationship of scene.relationships) {
    validateRelationship(
      relationship,
      scene,
      elementsById,
      occurrencesById,
      scenesById,
      conceptsById,
      issues
    )
  }

  if (scene.parentId) {
    const parent = scenesById.get(scene.parentId)
    const linked = parent?.elements.some(
      ({ targetSceneId }) => targetSceneId === scene.id
    )
    if (parent && !linked) {
      issues.push(
        makeIssue(
          scene.id,
          "parentId",
          `Parent ${parent.id} has no element targeting child ${scene.id}`
        )
      )
    }
  }
}

function checkReference(
  index: { has(id: string): boolean },
  id: string,
  ownerId: ContentId,
  path: string,
  label: string,
  issues: ContentValidationIssue[]
) {
  if (!index.has(id)) {
    issues.push(makeIssue(ownerId, path, `Unknown ${label}: ${id}`))
  }
}

function validateRelationship(
  relationship: Relationship,
  scene: Scene,
  elements: ReadonlyMap<ContentId, Scene["elements"][number]>,
  occurrences: ReadonlyMap<ContentId, unknown>,
  scenes: ReadonlyMap<ContentId, Scene>,
  concepts: ReadonlyMap<ContentId, Concept>,
  issues: ContentValidationIssue[]
) {
  const check = (
    index: { has(id: string): boolean },
    id: string,
    label: string
  ) => checkReference(index, id, scene.id, "relationships", label, issues)

  if (relationship.type === "contains") {
    check(elements, relationship.elementId, "element")
    check(scenes, relationship.targetSceneId, "scene")
    if (
      elements.get(relationship.elementId)?.targetSceneId !==
      relationship.targetSceneId
    ) {
      issues.push(
        makeIssue(
          scene.id,
          "relationships",
          `Contains relationship must match element ${relationship.elementId}`
        )
      )
    }
  } else if (relationship.type === "flows-to") {
    check(elements, relationship.fromElementId, "element")
    check(elements, relationship.toElementId, "element")
  } else if (relationship.type === "uses-concept") {
    check(occurrences, relationship.occurrenceId, "occurrence")
  } else if (relationship.type === "implemented-by") {
    check(occurrences, relationship.occurrenceId, "occurrence")
    check(scenes, relationship.targetSceneId, "scene")
  } else {
    check(concepts, relationship.sourceConceptId, "concept")
    check(concepts, relationship.targetConceptId, "concept")
  }
}

function validateContainsCycles(
  scenes: readonly Scene[],
  issues: ContentValidationIssue[]
) {
  const adjacency = new Map(
    scenes.map((scene) => [
      scene.id,
      scene.elements.flatMap(({ targetSceneId }) =>
        targetSceneId ? [targetSceneId] : []
      ),
    ])
  )
  const visiting = new Set<ContentId>()
  const visited = new Set<ContentId>()

  const visit = (id: ContentId, path: ContentId[]) => {
    if (visiting.has(id)) {
      issues.push(
        makeIssue(
          id,
          "elements.targetSceneId",
          `Contains cycle: ${[...path, id].join(" -> ")}`
        )
      )
      return
    }
    if (visited.has(id)) return
    visiting.add(id)
    for (const childId of adjacency.get(id) ?? []) visit(childId, [...path, id])
    visiting.delete(id)
    visited.add(id)
  }

  for (const scene of scenes) visit(scene.id, [])
}

function validateImplementationCycles(
  scenes: readonly Scene[],
  issues: ContentValidationIssue[]
) {
  const adjacency = new Map(
    scenes.map((scene) => [
      scene.id,
      [
        ...scene.occurrences.flatMap(
          ({ implementationSceneIds }) => implementationSceneIds
        ),
        ...scene.relationships.flatMap((relationship) =>
          relationship.type === "implemented-by"
            ? [relationship.targetSceneId]
            : []
        ),
      ],
    ])
  )
  const visiting = new Set<ContentId>()
  const visited = new Set<ContentId>()

  const visit = (id: ContentId, path: ContentId[]) => {
    if (visiting.has(id)) {
      issues.push(
        makeIssue(
          id,
          "occurrences.implementationSceneIds",
          `Implementation cycle: ${[...path, id].join(" -> ")}`
        )
      )
      return
    }
    if (visited.has(id)) return
    visiting.add(id)
    for (const childId of adjacency.get(id) ?? []) visit(childId, [...path, id])
    visiting.delete(id)
    visited.add(id)
  }

  for (const scene of scenes) visit(scene.id, [])
}
