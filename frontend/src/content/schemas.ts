import { z } from "zod"

import type {
  Concept,
  Scene,
  SelfCheckQuestion,
} from "@/domain/content-types"

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

const legacySceneElementSchema = z.discriminatedUnion("kind", [
  z
    .object({
      id: contentIdSchema,
      kind: z.literal("node"),
      label: z.string().min(1).optional(),
      grid: z
        .object({ row: gridCoordinateSchema, col: gridCoordinateSchema })
        .strict()
        .optional(),
      groupId: contentIdSchema.optional(),
      targetSceneId: contentIdSchema.optional(),
      navigateToSceneId: contentIdSchema.optional(),
      conceptId: contentIdSchema.optional(),
      status: z.enum(["published", "planned"]).optional(),
    })
    .strict(),
  z
    .object({
      id: contentIdSchema,
      kind: z.literal("group"),
      label: z.string().min(1).optional(),
    })
    .strict(),
  z
    .object({
      id: contentIdSchema,
      kind: z.literal("edge"),
      label: z.string().min(1).optional(),
      fromElementId: contentIdSchema,
      toElementId: contentIdSchema,
      variant: z.enum(["flow", "supporting", "return"]).optional(),
      fromSide: portSideSchema.optional(),
      toSide: portSideSchema.optional(),
    })
    .strict(),
  z
    .object({
      id: contentIdSchema,
      kind: z.literal("annotation"),
      label: z.string().min(1).optional(),
    })
    .strict(),
])

const contextSchema = z
  .object({
    id: contentIdSchema,
    summary: z.string().min(1),
    contentRef: contentRefSchema.optional(),
  })
  .strict()

const occurrenceSchema = z
  .object({
    id: contentIdSchema,
    conceptId: contentIdSchema,
    contextId: contentIdSchema,
    elementId: contentIdSchema.optional(),
    implementationSceneIds: z.array(contentIdSchema).default([]),
  })
  .strict()

const conceptUsageSchema = z
  .object({
    conceptId: contentIdSchema,
    occurrenceId: contentIdSchema,
    contextId: contentIdSchema,
  })
  .strict()

const quizQuestionSchema = z
  .object({
    id: contentIdSchema,
    prompt: z.string().min(1),
    options: z
      .array(
        z.object({ id: contentIdSchema, label: z.string().min(1) }).strict()
      )
      .min(2),
    correctOptionId: contentIdSchema,
    explanation: z.string().min(1),
  })
  .strict()

const topicQuizSchema = z
  .object({ questions: z.array(quizQuestionSchema).min(1) })
  .strict()

const legacyRelationshipSchema = z.object({ type: z.string().min(1) }).passthrough()

const legacySceneSchema = z
  .object({
    id: contentIdSchema,
    slug: contentIdSchema,
    scenarioId: contentIdSchema,
    parentId: contentIdSchema.optional(),
    title: z.string().min(1),
    summary: z.string().min(1),
    status: statusSchema,
    ariaLabel: z.string().min(1),
    layoutHint: z.enum(["horizontal", "branch"]).optional(),
    layout: z
      .object({ type: z.literal("grid"), columns: z.literal(5), rows: z.literal(5) })
      .strict()
      .optional(),
    elements: z.array(legacySceneElementSchema).default([]),
    contentRef: contentRefSchema,
    contexts: z.array(contextSchema).default([]),
    occurrences: z.array(occurrenceSchema).default([]),
    conceptRefs: z.array(conceptUsageSchema).default([]),
    quiz: topicQuizSchema.optional(),
    relationships: z.array(legacyRelationshipSchema).default([]),
    sources: z.array(sourceSchema).default([]),
    author: contributorSchema.optional(),
    updatedAt: z.string().optional(),
  })
  .strict()

const sceneNodeSchema = z
  .object({
    label: z.string().min(1),
    row: gridCoordinateSchema,
    col: gridCoordinateSchema,
    childSceneId: contentIdSchema.optional(),
    navigateToSceneId: contentIdSchema.optional(),
  })
  .strict()
  .refine((node) => !(node.childSceneId && node.navigateToSceneId), {
    message: "Use either childSceneId or navigateToSceneId, not both",
  })

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

export const minimalSceneSchema = z
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
        context.addIssue({ code: "custom", path: ["edges", index, "from"], message: `Unknown node: ${edge.from}` })
      }
      if (!scene.nodes[edge.to]) {
        context.addIssue({ code: "custom", path: ["edges", index, "to"], message: `Unknown node: ${edge.to}` })
      }
    })
  })

export const sceneDocumentSchema = z.union([minimalSceneSchema, legacySceneSchema])

export const sceneQuizSchema = z
  .array(
    z.object({ question: z.string().min(1), answer: z.string().min(1) }).strict()
  )
  .min(1)

export type SceneDocument = z.infer<typeof sceneDocumentSchema>

export type SceneDerivedMetadata = {
  title: string
  slug: string
  scenarioId: string
  parentId?: string
  status?: Scene["status"]
}

export function isMinimalSceneDocument(
  document: SceneDocument
): document is z.infer<typeof minimalSceneSchema> {
  return "nodes" in document
}

export function sceneDocumentChildren(document: SceneDocument) {
  if (isMinimalSceneDocument(document)) {
    return Object.entries(document.nodes).flatMap(([nodeId, node], order) =>
      node.childSceneId ? [{ nodeId, childSceneId: node.childSceneId, order }] : []
    )
  }
  return document.elements.flatMap((element, order) =>
    element.kind === "node" && element.targetSceneId
      ? [{ nodeId: element.id, childSceneId: element.targetSceneId, order }]
      : []
  )
}

export function normalizeSceneDocument(
  document: SceneDocument,
  metadata: SceneDerivedMetadata,
  selfCheckQuiz?: SelfCheckQuestion[]
): Scene {
  if (isMinimalSceneDocument(document)) {
    return {
      id: document.id,
      ...metadata,
      status: metadata.status ?? "published",
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
          ...(node.navigateToSceneId ? { navigateToSceneId: node.navigateToSceneId } : {}),
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

  return {
    id: document.id,
    ...metadata,
    status: metadata.status ?? document.status,
    summary: document.summary,
    ariaLabel: document.summary,
    ...(document.layoutHint ? { layoutHint: document.layoutHint } : {}),
    ...(document.layout ? { layout: document.layout } : {}),
    elements: document.elements.flatMap((element) => {
      if (element.kind === "group" || element.kind === "annotation") return []
      if (element.kind === "edge") return [element]
      return [{
        id: element.id,
        kind: element.kind,
        ...(element.label ? { label: element.label } : {}),
        ...(element.grid ? { grid: element.grid } : {}),
        ...(element.targetSceneId ? { targetSceneId: element.targetSceneId } : {}),
        ...(element.navigateToSceneId ? { navigateToSceneId: element.navigateToSceneId } : {}),
        ...(element.status ? { status: element.status } : {}),
      }]
    }),
    contentRef: "content.ko.md",
    contexts: document.contexts,
    occurrences: document.occurrences,
    conceptRefs: document.conceptRefs,
    ...(document.quiz ? { quiz: document.quiz } : {}),
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
