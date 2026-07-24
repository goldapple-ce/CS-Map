import { z } from "zod"

import type { Concept, Scene } from "@/domain/content-types"

const contentIdSchema = z
  .string()
  .min(1)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)

const contentRefSchema = z
  .string()
  .min(1)
  .regex(/^(?!\/)(?!.*(?:^|\/)\.\.(?:\/|$))[a-zA-Z0-9._/-]+$/)

const statusSchema = z.enum(["draft", "review", "published", "planned"])

const contributorSchema = z
  .object({ id: contentIdSchema, displayName: z.string().min(1) })
  .strict()

const sourceSchema = z
  .object({
    title: z.string().min(1),
    url: z
      .url()
      .refine(
        (value) => ["http:", "https:"].includes(new URL(value).protocol),
        {
          message: "Source URL must use HTTP or HTTPS",
        }
      ),
    type: z.enum(["official", "primary", "secondary"]),
  })
  .strict()

const pointSchema = z
  .object({ x: z.number().finite(), y: z.number().finite() })
  .strict()

const geometrySchema = z
  .object({
    x: z.number().finite(),
    y: z.number().finite(),
    width: z.number().positive().optional(),
    height: z.number().positive().optional(),
    points: z.array(pointSchema).min(2).optional(),
  })
  .strict()

const sceneElementSchema = z
  .object({
    id: contentIdSchema,
    kind: z.enum(["node", "group", "edge", "annotation"]),
    label: z.string().min(1).optional(),
    geometry: geometrySchema,
    targetSceneId: contentIdSchema.optional(),
    conceptId: contentIdSchema.optional(),
    status: z.enum(["published", "planned"]).optional(),
  })
  .strict()

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

const relationshipSchema = z.discriminatedUnion("type", [
  z
    .object({
      type: z.literal("contains"),
      elementId: contentIdSchema,
      targetSceneId: contentIdSchema,
    })
    .strict(),
  z
    .object({
      type: z.literal("flows-to"),
      fromElementId: contentIdSchema,
      toElementId: contentIdSchema,
      label: z.string().min(1).optional(),
    })
    .strict(),
  z
    .object({
      type: z.literal("uses-concept"),
      occurrenceId: contentIdSchema,
    })
    .strict(),
  z
    .object({
      type: z.literal("related-to"),
      sourceConceptId: contentIdSchema,
      targetConceptId: contentIdSchema,
      summary: z.string().min(1),
    })
    .strict(),
  z
    .object({
      type: z.literal("implemented-by"),
      occurrenceId: contentIdSchema,
      targetSceneId: contentIdSchema,
    })
    .strict(),
])

export const sceneSchema = z
  .object({
    id: contentIdSchema,
    slug: contentIdSchema,
    scenarioId: contentIdSchema,
    parentId: contentIdSchema.optional(),
    title: z.string().min(1),
    summary: z.string().min(1),
    status: statusSchema,
    canvas: z
      .object({
        width: z.number().positive(),
        height: z.number().positive(),
        ariaLabel: z.string().min(1),
      })
      .strict(),
    elements: z.array(sceneElementSchema).default([]),
    contentRef: contentRefSchema,
    contexts: z.array(contextSchema).default([]),
    occurrences: z.array(occurrenceSchema).default([]),
    conceptRefs: z.array(conceptUsageSchema).default([]),
    relationships: z.array(relationshipSchema).default([]),
    sources: z.array(sourceSchema).min(1),
    author: contributorSchema,
    updatedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  })
  .strict()

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

export function parseScene(input: unknown): Scene {
  return sceneSchema.parse(input) as Scene
}

export function parseConcept(input: unknown): Concept {
  return conceptSchema.parse(input) as Concept
}
