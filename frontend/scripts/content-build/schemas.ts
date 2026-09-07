import { z } from "zod"

import type { Scene, SelfCheckQuestion } from "@shared/content/types"

export const contentIdSchema = z
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
    id: contentIdSchema.optional(),
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

const lightFlowEdgeReferenceSchema = z.union([
  contentIdSchema,
  z.tuple([contentIdSchema, contentIdSchema]),
])

const sceneLightFlowSchema = z
  .object({
    label: z.string().trim().min(1).optional(),
    stages: z
      .array(
        z
          .object({
            edges: z.array(lightFlowEdgeReferenceSchema).min(1),
          })
          .strict()
      )
      .min(1),
  })
  .strict()

export const sceneDocumentSchema = z
  .object({
    title: z.string().min(1),
    summary: z.string().min(1),
    keywords: z.array(z.string().trim().min(1)).min(1).optional(),
    areas: z.record(contentIdSchema, sceneAreaSchema).default({}),
    nodes: z.record(contentIdSchema, sceneNodeSchema),
    edges: z.array(sceneEdgeSchema).default([]),
    lightFlows: z.record(contentIdSchema, sceneLightFlowSchema).optional(),
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

    const edgeIndexesByExplicitId = new Map<string, number[]>()
    const edgeIndexesByRuntimeId = new Map<string, number[]>()
    scene.edges.forEach((edge, index) => {
      if (edge.id) {
        const explicitIndexes = edgeIndexesByExplicitId.get(edge.id) ?? []
        explicitIndexes.push(index)
        edgeIndexesByExplicitId.set(edge.id, explicitIndexes)
      }

      const runtimeId = sceneEdgeRuntimeId(edge, index)
      if (scene.nodes[runtimeId]) {
        context.addIssue({
          code: "custom",
          path: edge.id ? ["edges", index, "id"] : ["edges", index],
          message: `Edge runtime ID conflicts with Node ID in this Scene: ${runtimeId}`,
        })
      }
      const runtimeIndexes = edgeIndexesByRuntimeId.get(runtimeId) ?? []
      runtimeIndexes.push(index)
      edgeIndexesByRuntimeId.set(runtimeId, runtimeIndexes)
    })

    for (const [edgeId, indexes] of edgeIndexesByExplicitId) {
      if (indexes.length < 2) continue
      for (const index of indexes) {
        context.addIssue({
          code: "custom",
          path: ["edges", index, "id"],
          message: `Edge ID is duplicated in this Scene: ${edgeId}`,
        })
      }
    }

    for (const [runtimeId, indexes] of edgeIndexesByRuntimeId) {
      if (indexes.length < 2) continue
      for (const index of indexes) {
        context.addIssue({
          code: "custom",
          path: ["edges", index, scene.edges[index].id ? "id" : "from"],
          message: `Edge runtime ID collides in this Scene: ${runtimeId}`,
        })
      }
    }

    const lightFlows = Object.entries(scene.lightFlows ?? {})
    if (lightFlows.length > 1) {
      const labels = new Map<string, string>()
      for (const [flowId, flow] of lightFlows) {
        if (!flow.label) {
          context.addIssue({
            code: "custom",
            path: ["lightFlows", flowId, "label"],
            message:
              "A label is required when a Scene has multiple Light Flows",
          })
          continue
        }
        const previousFlowId = labels.get(flow.label)
        if (previousFlowId) {
          context.addIssue({
            code: "custom",
            path: ["lightFlows", flowId, "label"],
            message: `Light Flow label is already used by ${previousFlowId}: ${flow.label}`,
          })
        } else {
          labels.set(flow.label, flowId)
        }
      }
    }

    const edgesByPair = new Map<string, number[]>()
    scene.edges.forEach((edge, index) => {
      const key = `${edge.from}\u0000${edge.to}`
      const indexes = edgesByPair.get(key) ?? []
      indexes.push(index)
      edgesByPair.set(key, indexes)
    })

    for (const [flowId, flow] of lightFlows) {
      flow.stages.forEach((stage, stageIndex) => {
        const resolvedStageEdgeIds = new Set<string>()
        stage.edges.forEach((reference, edgeIndex) => {
          const path = [
            "lightFlows",
            flowId,
            "stages",
            stageIndex,
            "edges",
            edgeIndex,
          ]
          if (typeof reference === "string") {
            const matches = edgeIndexesByExplicitId.get(reference) ?? []
            if (matches.length !== 1) {
              context.addIssue({
                code: "custom",
                path,
                message: `Light Flow references unknown Edge ID: ${reference}`,
              })
              return
            }

            const runtimeId = sceneEdgeRuntimeId(
              scene.edges[matches[0]],
              matches[0]
            )
            if (resolvedStageEdgeIds.has(runtimeId)) {
              context.addIssue({
                code: "custom",
                path,
                message: `Light Flow stage repeats Edge: ${runtimeId}`,
              })
            }
            resolvedStageEdgeIds.add(runtimeId)
            return
          }

          const [from, to] = reference
          const pair = `${from}\u0000${to}`

          const fromExists = Boolean(scene.nodes[from])
          const toExists = Boolean(scene.nodes[to])
          if (!fromExists) {
            context.addIssue({
              code: "custom",
              path: [...path, 0],
              message: `Light Flow references unknown node: ${from}`,
            })
          }
          if (!toExists) {
            context.addIssue({
              code: "custom",
              path: [...path, 1],
              message: `Light Flow references unknown node: ${to}`,
            })
          }
          if (!fromExists || !toExists) return

          const matches = edgesByPair.get(pair) ?? []
          if (matches.length === 0) {
            context.addIssue({
              code: "custom",
              path,
              message: `Light Flow references unknown Edge: ${from} -> ${to}`,
            })
          } else if (matches.length > 1) {
            context.addIssue({
              code: "custom",
              path,
              message: `Light Flow Edge reference is ambiguous: ${from} -> ${to}`,
            })
          } else {
            const runtimeId = sceneEdgeRuntimeId(
              scene.edges[matches[0]],
              matches[0]
            )
            if (resolvedStageEdgeIds.has(runtimeId)) {
              context.addIssue({
                code: "custom",
                path,
                message: `Light Flow stage repeats Edge: ${runtimeId}`,
              })
            }
            resolvedStageEdgeIds.add(runtimeId)
          }
        })
      })
    }
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

export type SceneSourceDocument = z.infer<typeof sceneDocumentSchema>

export type SceneDocument = SceneSourceDocument & {
  id: string
}

export type SceneDerivedMetadata = {
  slug: string
  parentId?: string
}

/** 명시적 작성 ID를 우선하고, 없으면 작성 순서를 포함한 runtime Edge ID를 만든다. */
function sceneEdgeRuntimeId(
  edge: Pick<SceneSourceDocument["edges"][number], "id" | "from" | "to">,
  index: number
) {
  return edge.id ?? `edge-${edge.from}-${edge.to}-${index + 1}`
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
  const edgeIdsByPair = new Map(
    document.edges.map((edge, index) => [
      `${edge.from}\u0000${edge.to}`,
      sceneEdgeRuntimeId(edge, index),
    ])
  )
  const edgeIdsByExplicitId = new Map(
    document.edges.flatMap((edge, index) =>
      edge.id ? [[edge.id, sceneEdgeRuntimeId(edge, index)] as const] : []
    )
  )

  return {
    id: document.id,
    title: document.title,
    summary: document.summary,
    ...(document.keywords ? { keywords: document.keywords } : {}),
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
        id: sceneEdgeRuntimeId(edge, index),
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
    ...(document.lightFlows
      ? {
          lightFlows: Object.entries(document.lightFlows).map(([id, flow]) => ({
            id,
            ...(flow.label ? { label: flow.label } : {}),
            stages: flow.stages.map((stage) => ({
              edgeIds: stage.edges.map((reference) => {
                const edgeId =
                  typeof reference === "string"
                    ? edgeIdsByExplicitId.get(reference)
                    : edgeIdsByPair.get(`${reference[0]}\u0000${reference[1]}`)
                if (!edgeId) {
                  throw new Error(
                    `Light Flow ${id} references unavailable Edge: ${typeof reference === "string" ? reference : `${reference[0]} -> ${reference[1]}`}`
                  )
                }
                return edgeId
              }),
            })),
          })),
        }
      : {}),
    ...(selfCheckQuiz ? { selfCheckQuiz } : {}),
  }
}

/** 알 수 없는 입력을 검증된 Scene 작성 문서로 파싱한다. */
export function parseSceneDocument(input: unknown): SceneSourceDocument {
  return sceneDocumentSchema.parse(input)
}

/** 알 수 없는 입력을 Scene 퀴즈 목록으로 검증한다. */
export function parseSceneQuiz(input: unknown): SelfCheckQuestion[] {
  return sceneQuizSchema.parse(input)
}
