import path from "node:path"

import {
  sceneDocumentChildren,
  type SceneDocument,
  type SceneDerivedMetadata,
} from "./schemas.ts"

type SceneDocumentFile = { filePath: string; value: SceneDocument }

export type SceneOwner = { parentId: string; nodeId: string }

/** Child Scene별 단일 소유자를 수집하고 중복 참조는 첫 소유자를 유지한다. */
export function collectSceneOwners(files: readonly SceneDocumentFile[]) {
  const owners = new Map<string, SceneOwner>()
  const errors: string[] = []
  for (const { value: document } of files) {
    for (const child of sceneDocumentChildren(document)) {
      const owner = owners.get(child.childSceneId)
      if (owner) {
        errors.push(
          `${document.id}:nodes.${child.nodeId}.childSceneId: Scene ${child.childSceneId} is already owned by ${owner.parentId}`
        )
      } else {
        owners.set(child.childSceneId, {
          parentId: document.id,
          nodeId: child.nodeId,
        })
      }
    }
  }
  return { owners, errors }
}

/** 고정 Root Scene이 Child로 소유된 경우 오류를 반환한다. */
export function rootOwnershipError(
  rootSceneId: string,
  owners: ReadonlyMap<string, SceneOwner>
) {
  const owner = owners.get(rootSceneId)
  return owner
    ? `${rootSceneId}: Root Scene cannot be a child of ${owner.parentId}`
    : undefined
}

/** 소유 관계를 캡처해 상위 Scene부터 파생 메타데이터를 해석하는 함수를 만든다. */
export function createSceneMetadataResolver(
  files: readonly SceneDocumentFile[],
  rootSceneId: string,
  owners: ReadonlyMap<string, SceneOwner>
) {
  const documentsById = new Map(files.map((file) => [file.value.id, file]))
  const metadataCache = new Map<string, SceneDerivedMetadata>()
  const resolving = new Set<string>()

  /** 진행 중인 ID로 순환과 캐시 적중을 구분하며 Scene 메타데이터를 해석한다. */
  function resolveMetadata(
    document: SceneDocument,
    filePath: string
  ): SceneDerivedMetadata {
    const cached = metadataCache.get(document.id)
    if (cached) return cached
    if (resolving.has(document.id)) {
      throw new Error(`Child Scene cycle detected at ${document.id}`)
    }
    resolving.add(document.id)

    if (document.id === rootSceneId) {
      const metadata: SceneDerivedMetadata = {
        slug: document.id,
      }
      metadataCache.set(document.id, metadata)
      resolving.delete(document.id)
      return metadata
    }

    const owner = owners.get(document.id)
    const parentFile = owner ? documentsById.get(owner.parentId) : undefined
    if (parentFile) resolveMetadata(parentFile.value, parentFile.filePath)
    const metadata: SceneDerivedMetadata = {
      slug: owner?.nodeId ?? path.basename(path.dirname(filePath)),
      ...(owner ? { parentId: owner.parentId } : {}),
    }
    metadataCache.set(document.id, metadata)
    resolving.delete(document.id)
    return metadata
  }

  return resolveMetadata
}

/** Root Scene에서 Child 소유 관계만 따라 게시 가능한 Scene ID를 수집한다. */
export function collectReachableSceneIds(
  rootSceneId: string,
  files: readonly SceneDocumentFile[]
) {
  const scenesById = new Map(files.map((file) => [file.value.id, file.value]))
  const reachable = new Set<string>()
  const errors: string[] = []

  if (!scenesById.has(rootSceneId)) {
    errors.push(
      `content/scenes/scene.yaml: Root Scene is unavailable: ${rootSceneId}`
    )
    return { reachable, errors }
  }

  /** Scene 간 이동 참조는 제외하고 Child Scene 계층을 깊이 우선으로 방문한다. */
  function visit(sceneId: string) {
    if (reachable.has(sceneId)) return
    const scene = scenesById.get(sceneId)
    if (!scene) return
    reachable.add(sceneId)
    for (const child of sceneDocumentChildren(scene)) {
      if (!scenesById.has(child.childSceneId)) {
        errors.push(
          `${scene.id}:nodes.${child.nodeId}.childSceneId: Unknown child Scene: ${child.childSceneId}`
        )
        continue
      }
      visit(child.childSceneId)
    }
  }

  visit(rootSceneId)
  return { reachable, errors }
}
