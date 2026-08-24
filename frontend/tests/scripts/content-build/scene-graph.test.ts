import { describe, expect, it } from "vitest"

import {
  sceneDocumentSchema,
  type SceneDocument,
} from "../../../scripts/content-build/schemas.ts"
import {
  collectReachableSceneIds,
  collectSceneOwners,
  createSceneMetadataResolver,
  rootOwnershipError,
} from "../../../scripts/content-build/scene-graph.ts"

/** 테스트용 Scene 문서를 스키마 기본값까지 적용해 만든다. */
function sceneDocument(
  id: string,
  children: Readonly<Record<string, string>> = {}
): SceneDocument {
  const source = sceneDocumentSchema.parse({
    title: id,
    summary: id,
    nodes: Object.fromEntries(
      Object.entries(children).map(([nodeId, childSceneId], index) => [
        nodeId,
        { label: nodeId, row: 1, col: index + 1, childSceneId },
      ])
    ),
  })
  return { ...source, id }
}

/** Scene 문서를 graph 함수가 받는 파일 형태로 감싼다. */
function sceneFile(document: SceneDocument) {
  return { filePath: `/content/${document.id}/scene.yaml`, value: document }
}

describe("Scene graph", () => {
  it("중복 Child owner와 Child인 Root를 기존 오류 형식으로 보고한다", () => {
    const files = [
      sceneFile(sceneDocument("parent-a", { first: "child" })),
      sceneFile(sceneDocument("parent-b", { second: "child" })),
      sceneFile(sceneDocument("child")),
    ]
    const ownership = collectSceneOwners(files)

    expect(ownership.errors).toEqual([
      "parent-b:nodes.second.childSceneId: Scene child is already owned by parent-a",
    ])
    expect(rootOwnershipError("child", ownership.owners)).toBe(
      "child: Root Scene cannot be a child of parent-a"
    )
  })

  it("Child Scene 순환을 메타데이터 해석 중 감지한다", () => {
    const files = [
      sceneFile(sceneDocument("a", { "to-b": "b" })),
      sceneFile(sceneDocument("b", { "to-a": "a" })),
    ]
    const ownership = collectSceneOwners(files)
    const resolve = createSceneMetadataResolver(
      files,
      "missing-root",
      ownership.owners
    )

    expect(() => resolve(files[0].value)).toThrow(
      "Child Scene cycle detected at a"
    )
  })

  it("계층형 Scene ID와 별개로 소유 Topic ID를 Route slug로 사용한다", () => {
    const files = [
      sceneFile(
        sceneDocument("scenes", { server: "server", dns: "network-dns" })
      ),
      sceneFile(sceneDocument("server", { spring: "server-spring" })),
      sceneFile(sceneDocument("server-spring")),
      sceneFile(sceneDocument("network-dns")),
    ]
    const ownership = collectSceneOwners(files)
    const resolve = createSceneMetadataResolver(
      files,
      "scenes",
      ownership.owners
    )

    expect(resolve(files[0].value)).toEqual({ slug: "scenes" })
    expect(resolve(files[1].value)).toEqual({
      slug: "server",
      parentId: "scenes",
    })
    expect(resolve(files[2].value)).toEqual({
      slug: "spring",
      parentId: "server",
    })
    expect(resolve(files[3].value)).toEqual({
      slug: "dns",
      parentId: "scenes",
    })
  })

  it("Root에서 도달 가능한 Scene과 unknown Child 오류만 수집한다", () => {
    const files = [
      sceneFile(sceneDocument("root", { child: "child", missing: "missing" })),
      sceneFile(sceneDocument("child")),
      sceneFile(sceneDocument("orphan")),
    ]

    const result = collectReachableSceneIds("root", files)

    expect([...result.reachable]).toEqual(["root", "child"])
    expect(result.errors).toEqual([
      "root:nodes.missing.childSceneId: Unknown child Scene: missing",
    ])
  })
})
