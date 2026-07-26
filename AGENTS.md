# Project rules

## Source of truth

- `REQUIREMENTS.md` is the product source of truth.
- `TECHNICAL_DESIGN.md` is the architecture source of truth.
- `GLOSSARY.md` defines the preferred project terminology for user communication and documentation.
- If documents conflict, stop and report the conflict before implementation.

## Terminology discipline

- Use the preferred Korean and English terms from `GLOSSARY.md` when communicating with the user or updating project documents.
- Do not use page, slide, depth screen, or free-form canvas language for the persistent spatial navigation model unless describing an actual page, slide, or HTML canvas.
- When terminology conflicts with product behavior or architecture, follow `REQUIREMENTS.md` and `TECHNICAL_DESIGN.md` and update the glossary instead of redefining the product through terminology.

## Product invariants

- Do not add fixed CS category navigation.
- Do not turn the product into a free-form node graph or unrestricted infinite canvas.
- Primary navigation is click-based semantic zoom inside one persistent viewport.
- The map and long-form explanation panel must coexist on desktop.
- Scene depth must not have a hard-coded maximum.
- Reuse common concepts; do not duplicate their core explanations per context.
- Context-specific implementations belong under their occurrence, such as server cache → distributed cache → Redis.
- Planned content must not navigate to an empty scene.

## Implementation discipline

- If an unfinished `PLAN.md` exists, work only on that plan until its implementation and user-owned verification are complete.
- Do not interrupt or replace the current plan because of a new INBOX request unless the user explicitly asks to stop the current plan and prioritize that request.
- Do not implement future plan items or requests that are not included in the current plan.
- Keep content data separate from rendering and navigation code.
- Do not bind the domain model to a graph-rendering library.
- Do not introduce a backend for the MVP without a demonstrated requirement.
- Preserve unrelated user changes.
- Do not run automated or manual tests; the user owns all test execution.
- Report changed files, note that tests were not run, and list unmet acceptance criteria after each task.
- Never run `git commit`, `git push`, create tags, or rewrite Git history. The user owns all Git operations.
- Update implementation checkboxes only after the implementation is complete. Do not update test-only checkboxes without the user's confirmation.

## Work management

- Keep at most one `PLAN.md` in the repository.
- `INBOX.md` must keep exactly two request areas: `## 다음 PLAN 후보` and `## 메모`.
- The user may edit either INBOX area while a plan is running. Preserve concurrent additions and unrelated wording exactly.

### Current plan lifecycle

- Continue an existing unfinished `PLAN.md` before reviewing any INBOX request.
- New INBOX entries do not expand the active plan.
- When the active plan is implemented and the user-owned verification is complete, report the result and delete `PLAN.md`. Do not archive or copy completed plan contents elsewhere.
- Git history is the work history; the user owns commits and pushes.

### Next PLAN candidates

- Only `## 다음 PLAN 후보` may be reviewed when no unfinished `PLAN.md` exists.
- Analyze candidate priority and relatedness, then select only the requests appropriate for one coherent plan.
- A new plan must include its goal, selected INBOX requests, request-level completion criteria, implementation order, required requirement/design updates, verification methods, and current status.
- Show the new `PLAN.md` to the user and wait for approval before implementation.
- Remove only the exact candidate entries selected for that plan. Re-read `INBOX.md` immediately before editing it so later additions are preserved.
- Leave unselected candidates unchanged. Do not rewrite or delete them.
- If similar candidates are combined, explain the reason in the plan before removing them from INBOX.
- Ask the user before planning ambiguous or conflicting candidates.

### Notes

- Never automatically include `## 메모` entries in a plan.
- Do not implement, prioritize, promote, rewrite, delete, or combine notes.
- Do not use notes as justification to expand implementation scope.
- Treat a note as a work request only after the user moves it to `## 다음 PLAN 후보` or explicitly asks to implement it.

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
- Never imply knowledge of private Google internals without a public source.
- Keep Scene YAML limited to `id`, `summary`, `nodes`, and `edges`; derive display and navigation data during the content build.
- Do not require author, review status, updated date, or structured sources in Scene YAML. Put useful references in the Scene Markdown when needed.
- Do not add Annotation, Group, or a separate Relationship collection to Scene authoring data. Express containment on nodes and visible flow with edges.

## Interaction discipline

- Node body click moves and zooms the persistent world camera to its nested child scene; it must not replace the canvas.
- Hover or keyboard focus may show a short preview; essential content cannot exist only there.
- Long-form content belongs in the explanation panel.
- Back navigation restores scene, focus, panel state, and reading position.
- Honor `prefers-reduced-motion`.
- Keep all interactive nodes keyboard accessible.
