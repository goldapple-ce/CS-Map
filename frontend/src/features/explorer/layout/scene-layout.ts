import { contentData } from "@/content/generated/content-data"
import type { Scene } from "@shared/content/types"
import type {
  SceneLayout,
  SerializedSceneLayout,
} from "@shared/layout/scene-layout-contract"

const generatedLayoutCache = new Map<string, SceneLayout>()

/** 직렬화된 생성 Layout을 브라우저에서 조회하기 쉬운 Map 구조로 바꾼다. */
function deserializeSceneLayout(layout: SerializedSceneLayout): SceneLayout {
  return {
    width: layout.width,
    height: layout.height,
    nodes: new Map(Object.entries(layout.nodes)),
    edges: new Map(Object.entries(layout.edges)),
  }
}

/** Scene ID에 대응하는 생성 Layout을 조회하고 같은 인스턴스를 재사용한다. */
export function createSceneLayout(scene: Scene): SceneLayout {
  const cachedLayout = generatedLayoutCache.get(scene.id)
  if (cachedLayout) return cachedLayout

  const generatedLayout = contentData.layouts[scene.id]
  if (!generatedLayout) {
    throw new Error(`Generated layout is missing for Scene: ${scene.id}`)
  }

  const layout = deserializeSceneLayout(generatedLayout)
  generatedLayoutCache.set(scene.id, layout)
  return layout
}
