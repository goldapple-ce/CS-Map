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

Run `npm run content:build` after editing content. It validates schemas,
references, published dependencies, and contains cycles before regenerating the
lazy content and route indexes. Use `npm run content:validate` to check without
rewriting generated files.
