# Content authoring

Content lives outside rendering and navigation code. Add scenes under
`content/scenes/<scenario>/<path>/` and concepts under
`content/concepts/<concept>/`.

Each scene directory contains `scene.yaml` and the Markdown file referenced by
its `contentRef`. Each concept directory follows the same pattern with
`concept.yaml`. IDs and slugs use lowercase kebab-case. Published items require
an author, an updated date, and at least one source.

`Scene`, `Concept`, `Context`, and `Occurrence` are separate records. A scene
uses `conceptRefs` to join a shared concept to one occurrence and one context.
Navigation depth is represented only through `parentId`; there is no numeric
level field.

A scene may include an optional Topic quiz in `scene.yaml`:

```yaml
quiz:
  questions:
    - id: request-order
      prompt: 요청이 다음으로 이동하는 곳은 어디인가요?
      options:
        - id: network
          label: 네트워크
        - id: rendering
          label: 브라우저 렌더링
      correctOptionId: network
      explanation: 브라우저가 준비한 요청은 네트워크를 통해 전송됩니다.
```

Question IDs must be unique within the Topic, option IDs must be unique within
the question, and `correctOptionId` must match one option. Quizzes are static
self-check content; scores, progress, and answer history are not stored.

Run `npm run content:build` after editing content. It validates schemas,
references, published dependencies, and contains cycles before regenerating the
lazy content and route indexes. Use `npm run content:validate` to check without
rewriting generated files.
