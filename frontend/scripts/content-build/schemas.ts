import { z } from "zod"

import type { Scene, SelfCheckQuestion } from "@shared/content/types"

const contentIdSchema = z
  .string()
  .min(1)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)

const topicContentRefSchema = z
  .string()
  .min(1)
  .regex(
    /^[a-zA-Z0-9][a-zA-Z0-9._-]*\.md$/,
    "Topic contentRef must be a Markdown file in the same Scene directory"
  )

const gridCoordinateSchema = z.number().int().min(1).max(5)
const gridSpanSchema = z.number().int().min(1).max(5)
const portSideSchema = z.enum(["top", "right", "bottom", "left"])

const sceneNodeSchema = z
  .object({
    label: z.string().min(1),
    row: gridCoordinateSchema,
    col: gridCoordinateSchema,
    rowSpan: gridSpanSchema.default(1),
    colSpan: gridSpanSchema.default(1),
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

const sceneAreaSchema = z
  .object({
    label: z.string().min(1),
    row: gridCoordinateSchema,
    col: gridCoordinateSchema,
    rowSpan: gridSpanSchema,
    colSpan: gridSpanSchema,
  })
  .strict()

export const sceneDocumentSchema = z
  .object({
    id: contentIdSchema,
    title: z.string().min(1),
    summary: z.string().min(1),
    areas: z.record(contentIdSchema, sceneAreaSchema).default({}),
    nodes: z.record(contentIdSchema, sceneNodeSchema),
    edges: z.array(sceneEdgeSchema).default([]),
  })
  .strict()
  .superRefine((scene, context) => {
    for (const [areaId, area] of Object.entries(scene.areas)) {
      if (area.row + area.rowSpan - 1 > 5) {
        context.addIssue({
          code: "custom",
          path: ["areas", areaId, "rowSpan"],
          message: `Area exceeds row 5: starts at ${area.row} with span ${area.rowSpan}`,
        })
      }
      if (area.col + area.colSpan - 1 > 5) {
        context.addIssue({
          code: "custom",
          path: ["areas", areaId, "colSpan"],
          message: `Area exceeds column 5: starts at ${area.col} with span ${area.colSpan}`,
        })
      }
    }
    const occupiedCells = new Map<string, string>()
    for (const [nodeId, node] of Object.entries(scene.nodes)) {
      if (node.row + node.rowSpan - 1 > 5) {
        context.addIssue({
          code: "custom",
          path: ["nodes", nodeId, "rowSpan"],
          message: `Topic exceeds row 5: starts at ${node.row} with span ${node.rowSpan}`,
        })
      }
      if (node.col + node.colSpan - 1 > 5) {
        context.addIssue({
          code: "custom",
          path: ["nodes", nodeId, "colSpan"],
          message: `Topic exceeds column 5: starts at ${node.col} with span ${node.colSpan}`,
        })
      }
      for (let row = node.row; row < node.row + node.rowSpan; row += 1) {
        for (let col = node.col; col < node.col + node.colSpan; col += 1) {
          const cell = `${row},${col}`
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
      }
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
  slug: string
  parentId?: string
}

/** Scene 문서에서 Child Scene 참조를 추출한다. */
export function sceneDocumentChildren(document: SceneDocument) {
  return Object.entries(document.nodes).flatMap(([nodeId, node]) =>
    node.childSceneId ? [{ nodeId, childSceneId: node.childSceneId }] : []
  )
}

/** 검증된 작성 문서와 파생 메타데이터를 런타임 Scene 모델로 변환한다. */
export function normalizeSceneDocument(
  document: SceneDocument,
  metadata: SceneDerivedMetadata,
  selfCheckQuiz?: SelfCheckQuestion[]
): Scene {
  return {
    id: document.id,
    title: document.title,
    ...metadata,
    layout: { columns: 5, rows: 5 },
    areas: Object.entries(document.areas).map(([id, area]) => ({
      id,
      label: area.label,
      grid: { row: area.row, col: area.col },
      rowSpan: area.rowSpan,
      colSpan: area.colSpan,
    })),
    elements: [
      ...Object.entries(document.nodes).map(([id, node]) => ({
        id,
        kind: "node" as const,
        label: node.label,
        grid: {
          row: node.row,
          col: node.col,
          rowSpan: node.rowSpan,
          colSpan: node.colSpan,
        },
        ...(node.childSceneId ? { targetSceneId: node.childSceneId } : {}),
        ...(node.navigateToSceneId
          ? { navigateToSceneId: node.navigateToSceneId }
          : {}),
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
    ...(selfCheckQuiz ? { selfCheckQuiz } : {}),
  }
}

/** 알 수 없는 입력을 검증된 Scene 작성 문서로 파싱한다. */
export function parseSceneDocument(input: unknown): SceneDocument {
  return sceneDocumentSchema.parse(input)
}

/** 알 수 없는 입력을 Scene 퀴즈 목록으로 검증한다. */
export function parseSceneQuiz(input: unknown): SelfCheckQuestion[] {
  return sceneQuizSchema.parse(input)
}
