import { z } from "zod"

import type { Concept, Scene, SelfCheckQuestion } from "@/domain/content-types"

const contentIdSchema = z
  .string()
  .min(1)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)

const contentRefSchema = z
  .string()
  .min(1)
  .regex(/^(?!\/)(?!.*(?:^|\/)\.\.(?:\/|$))[a-zA-Z0-9._/-]+$/)
const topicContentRefSchema = z
  .string()
  .min(1)
  .regex(
    /^[a-zA-Z0-9][a-zA-Z0-9._-]*\.md$/,
    "Topic contentRef must be a Markdown file in the same Scene directory"
  )

const statusSchema = z.enum(["draft", "review", "published"])
const gridCoordinateSchema = z.number().int().min(1).max(5)
const portSideSchema = z.enum(["top", "right", "bottom", "left"])

export const scenarioDocumentSchema = z
  .object({
    id: contentIdSchema,
    rootSceneId: contentIdSchema,
  })
  .strict()

const contributorSchema = z
  .object({ id: contentIdSchema, displayName: z.string().min(1) })
  .strict()

const sourceSchema = z
  .object({
    title: z.string().min(1),
    url: z.url(),
    type: z.enum(["official", "primary", "secondary"]),
  })
  .strict()

const sceneNodeSchema = z
  .object({
    label: z.string().min(1),
    row: gridCoordinateSchema,
    col: gridCoordinateSchema,
    childSceneId: contentIdSchema.optional(),
    navigateToSceneId: contentIdSchema.optional(),
    description: z.string().min(1).optional(),
    contentRef: topicContentRefSchema.optional(),
  })
  .strict()
  .superRefine((node, context) => {
    if (node.childSceneId && node.navigateToSceneId) {
      context.addIssue({
        code: "custom",
        path: ["navigateToSceneId"],
        message: "Use either childSceneId or navigateToSceneId, not both",
      })
    }
    if (node.description && node.contentRef) {
      context.addIssue({
        code: "custom",
        path: ["contentRef"],
        message: "Use either description or contentRef, not both",
      })
    }
    if (
      (node.description || node.contentRef) &&
      (node.childSceneId || node.navigateToSceneId)
    ) {
      context.addIssue({
        code: "custom",
        path: [node.description ? "description" : "contentRef"],
        message: "Topic explanations are only supported on leaf nodes",
      })
    }
  })

const sceneEdgeSchema = z
  .object({
    from: contentIdSchema,
    to: contentIdSchema,
    label: z.string().min(1).optional(),
    variant: z.enum(["flow", "supporting", "return"]).optional(),
    fromSide: portSideSchema.optional(),
    toSide: portSideSchema.optional(),
    labelSide: portSideSchema.optional(),
  })
  .strict()

export const sceneDocumentSchema = z
  .object({
    id: contentIdSchema,
    title: z.string().min(1),
    summary: z.string().min(1),
    nodes: z.record(contentIdSchema, sceneNodeSchema),
    edges: z.array(sceneEdgeSchema).default([]),
  })
  .strict()
  .superRefine((scene, context) => {
    const occupiedCells = new Map<string, string>()
    for (const [nodeId, node] of Object.entries(scene.nodes)) {
      const cell = `${node.row},${node.col}`
      const occupant = occupiedCells.get(cell)
      if (occupant) {
        context.addIssue({
          code: "custom",
          path: ["nodes", nodeId],
          message: `Grid cell ${cell} is already occupied by ${occupant}`,
        })
      }
      occupiedCells.set(cell, nodeId)
    }
    scene.edges.forEach((edge, index) => {
      if (!scene.nodes[edge.from]) {
        context.addIssue({
          code: "custom",
          path: ["edges", index, "from"],
          message: `Unknown node: ${edge.from}`,
        })
      }
      if (!scene.nodes[edge.to]) {
        context.addIssue({
          code: "custom",
          path: ["edges", index, "to"],
          message: `Unknown node: ${edge.to}`,
        })
      }
    })
  })

export const sceneQuizSchema = z
  .array(
    z
      .object({
        question: z.string().min(1),
        answer: z.string().min(1),
      })
      .strict()
  )
  .min(1)

export type SceneDocument = z.infer<typeof sceneDocumentSchema>
export type ScenarioDocument = z.infer<typeof scenarioDocumentSchema>

export type SceneDerivedMetadata = {
  slug: string
  scenarioId: string
  parentId?: string
}

export function sceneDocumentChildren(document: SceneDocument) {
  return Object.entries(document.nodes).flatMap(([nodeId, node], order) =>
    node.childSceneId
      ? [{ nodeId, childSceneId: node.childSceneId, order }]
      : []
  )
}

export function normalizeSceneDocument(
  document: SceneDocument,
  metadata: SceneDerivedMetadata,
  selfCheckQuiz?: SelfCheckQuestion[]
): Scene {
  return {
    id: document.id,
    title: document.title,
    ...metadata,
    status: "published",
    summary: document.summary,
    ariaLabel: document.summary,
    layout: { type: "grid", columns: 5, rows: 5 },
    elements: [
      ...Object.entries(document.nodes).map(([id, node]) => ({
        id,
        kind: "node" as const,
        label: node.label,
        grid: { row: node.row, col: node.col },
        ...(node.childSceneId ? { targetSceneId: node.childSceneId } : {}),
        ...(node.navigateToSceneId
          ? { navigateToSceneId: node.navigateToSceneId }
          : {}),
        ...(node.description ? { description: node.description } : {}),
        ...(node.contentRef ? { contentRef: node.contentRef } : {}),
      })),
      ...document.edges.map((edge, index) => ({
        id: `edge-${edge.from}-${edge.to}-${index + 1}`,
        kind: "edge" as const,
        fromElementId: edge.from,
        toElementId: edge.to,
        ...(edge.label ? { label: edge.label } : {}),
        ...(edge.variant ? { variant: edge.variant } : {}),
        ...(edge.fromSide ? { fromSide: edge.fromSide } : {}),
        ...(edge.toSide ? { toSide: edge.toSide } : {}),
        ...(edge.labelSide ? { labelSide: edge.labelSide } : {}),
      })),
    ],
    contentRef: "content.ko.md",
    contexts: [],
    occurrences: [],
    conceptRefs: [],
    ...(selfCheckQuiz ? { selfCheckQuiz } : {}),
  }
}

export const conceptSchema = z
  .object({
    id: contentIdSchema,
    slug: contentIdSchema,
    title: z.string().min(1),
    aliases: z.array(z.string().min(1)).default([]),
    summary: z.string().min(1),
    status: statusSchema,
    contentRef: contentRefSchema,
    sources: z.array(sourceSchema).min(1),
    author: contributorSchema,
    updatedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  })
  .strict()

export function parseSceneDocument(input: unknown): SceneDocument {
  return sceneDocumentSchema.parse(input)
}

export function parseSceneQuiz(input: unknown): SelfCheckQuestion[] {
  return sceneQuizSchema.parse(input)
}

export function parseConcept(input: unknown): Concept {
  return conceptSchema.parse(input) as Concept
}
