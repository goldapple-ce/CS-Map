import type { Concept, Scene } from "@shared/content/types"

export type LoadedScene = {
  scene: Scene
  markdown: string
}

export type LoadedConcept = {
  concept: Concept
  markdown: string
}
