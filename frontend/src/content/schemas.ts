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

const sceneElementSchema = z.discriminatedUnion("kind", [
  z
    .object({
      id: contentIdSchema,
      kind: z.literal("node"),
      label: z.string().min(1).optional(),
      groupId: contentIdSchema.optional(),
      targetSceneId: contentIdSchema.optional(),
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
        z
          .object({
            id: contentIdSchema,
            label: z.string().min(1),
          })
          .strict()
      )
      .min(2),
    correctOptionId: contentIdSchema,
    explanation: z.string().min(1),
  })
  .strict()
  .superRefine((question, context) => {
    const optionIds = question.options.map(({ id }) => id)
    if (new Set(optionIds).size !== optionIds.length) {
      context.addIssue({
        code: "custom",
        path: ["options"],
        message: "Quiz option IDs must be unique within a question",
      })
    }
    if (!optionIds.includes(question.correctOptionId)) {
      context.addIssue({
        code: "custom",
        path: ["correctOptionId"],
        message: "Quiz correctOptionId must reference one of its options",
      })
    }
  })

const topicQuizSchema = z
  .object({
    questions: z.array(quizQuestionSchema).min(1),
  })
  .strict()
  .superRefine((quiz, context) => {
    const questionIds = quiz.questions.map(({ id }) => id)
    if (new Set(questionIds).size !== questionIds.length) {
      context.addIssue({
        code: "custom",
        path: ["questions"],
        message: "Quiz question IDs must be unique within a Topic",
      })
    }
  })

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
      type: z.enum(["related", "prerequisite", "used-by"]),
      sourceSceneId: contentIdSchema,
      targetSceneId: contentIdSchema,
      summary: z.string().min(1).optional(),
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
    ariaLabel: z.string().min(1),
    layoutHint: z.enum(["horizontal", "branch"]).optional(),
    elements: z.array(sceneElementSchema).default([]),
    contentRef: contentRefSchema,
    contexts: z.array(contextSchema).default([]),
    occurrences: z.array(occurrenceSchema).default([]),
    conceptRefs: z.array(conceptUsageSchema).default([]),
    quiz: topicQuizSchema.optional(),
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
