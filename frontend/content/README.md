# Content authoring

Content lives outside rendering and navigation code. Add scenes under
`content/scenes/<scenario>/<path>/` and concepts under
`content/concepts/<concept>/`.

Each scene directory contains `scene.yaml`, `content.ko.md`, and an optional
`quiz.ko.yaml`. The Scene title belongs only in `scene.yaml`; the Markdown file
contains the long-form explanation and does not repeat the title as an H1.

```yaml
id: google-search-root
title: google.com에 접속하는 전체 흐름
summary: 브라우저에서 목적지 서버까지 이어지는 흐름입니다.
nodes: {}
edges: []
```

Each concept directory follows its own `concept.yaml` and Markdown structure.
IDs use lowercase kebab-case.

`Scene`, `Concept`, `Context`, and `Occurrence` are separate records. A scene
uses `conceptRefs` to join a shared concept to one occurrence and one context.
Navigation depth is represented only through `parentId`; there is no numeric
level field.

A scene may include an optional `quiz.ko.yaml`:

```yaml
- question: 요청이 다음으로 이동하는 곳은 어디인가요?
  answer: 브라우저가 준비한 요청은 네트워크를 통해 전송됩니다.
```

Quizzes are static self-check content; scores, progress, and answer history are
not stored. During development, saving Scene content regenerates the content
and route indexes and refreshes the browser.
