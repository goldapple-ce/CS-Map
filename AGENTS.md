# Project rules

## Source of truth

- `REQUIREMENTS.md` is the product source of truth.
- `TECHNICAL_DESIGN.md` is the architecture source of truth.
- If documents conflict, stop and report the conflict before implementation.

## Product invariants

- Do not add fixed CS category navigation.
- Do not turn the product into a free-form node graph or unrestricted infinite canvas.
- Primary navigation is click-based semantic zoom inside one persistent viewport.
- The map and long-form explanation panel must coexist on desktop.
- Scene depth must not have a hard-coded maximum.
- Separate Scene, Concept, Context, and Occurrence data.
- Reuse common concepts; do not duplicate their core explanations per context.
- Context-specific implementations belong under their occurrence, such as server cache → distributed cache → Redis.
- Planned content must not navigate to an empty scene.

## Implementation discipline

- Work only on the stage marked `▶ 현재` in `PLAN.md`.
- Do not implement future features unless explicitly requested.
- Keep content data separate from rendering and navigation code.
- Do not bind the domain model to a graph-rendering library.
- Do not introduce a backend for the MVP without a demonstrated requirement.
- Preserve unrelated user changes.
- Do not run automated or manual tests; the user owns all test execution.
- Report changed files, note that tests were not run, and list unmet acceptance criteria after each task.
- Never run `git commit`, `git push`, create tags, or rewrite Git history. The user owns all Git operations.
- Update implementation checkboxes only after the implementation is complete. Do not update test-only checkboxes without the user's confirmation.

## Styling discipline

- Use Tailwind CSS and shadcn/ui for application UI.
- Do not add MUI, CSS Modules, Sass, styled-components, Emotion, or another styling system.
- Add only the shadcn/ui components required by the current commit.
- Treat `src/components/ui` as generated UI primitives; do not modify them without a concrete need.
- Put project-specific components outside `src/components/ui`.
- Use semantic theme utilities such as `bg-background`, `text-foreground`, `border-border`, and `text-muted-foreground`.
- Do not scatter raw palette utilities such as `bg-blue-500` through feature components.
- Use `cva` for repeated component states and variants.
- Use inline style only for runtime-calculated coordinates, dimensions, transform origins, and transforms.
- Keep global CSS limited to Tailwind/shadcn initialization, theme variables, and unavoidable document-level defaults.

## Content discipline

- If `CONTENT_GUIDE.md` is present, follow it for every new scene or concept.
- Distinguish verified facts, general architecture examples, and product-specific assumptions.
- Prefer primary or official sources.
- Never imply knowledge of private Google internals without a public source.
- Every published content item needs an author, review status, updated date, and sources.

## Interaction discipline

- Node body click moves and zooms the persistent world camera to its nested child scene; it must not replace the canvas.
- Hover or keyboard focus may show a short preview; essential content cannot exist only there.
- Long-form content belongs in the explanation panel.
- Back navigation restores scene, focus, panel state, and reading position.
- Honor `prefers-reduced-motion`.
- Keep all interactive nodes keyboard accessible.
