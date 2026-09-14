export type ExplanationSelection =
  | {
      kind: "topic"
      sceneId: string
      elementId: string
      label: string
    }
  | {
      kind: "area"
      sceneId: string
      areaId: string
      label: string
    }
