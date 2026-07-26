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

const statusSchema = z.enum(["draft", "review", "published", "planned"])
const gridCoordinateSchema = z.number().int().min(1).max(5)
const portSideSchema = z.enum(["top", "right", "bottom", "left"])

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
    planned: z.literal(true).optional(),
  })
  .strict()
  .refine(
    (node) =>
      !(node.childSceneId && node.navigateToSceneId) &&
      !(node.planned && (node.childSceneId || node.navigateToSceneId)),
    {
      message:
        "Use one navigation target, or planned: true without a navigation target",
    }
  )

const sceneEdgeSchema = z
  .object({
    from: contentIdSchema,
    to: contentIdSchema,
    label: z.string().min(1).optional(),
    variant: z.enum(["flow", "supporting", "return"]).optional(),
    fromSide: portSideSchema.optional(),
    toSide: portSideSchema.optional(),
  })
  .strict()

export const sceneDocumentSchema = z
  .object({
    id: contentIdSchema,
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

export type SceneDerivedMetadata = {
  title: string
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
        ...(node.planned ? { status: "planned" as const } : {}),
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
