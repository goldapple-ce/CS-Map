/** 작성 label의 실제 줄바꿈과 `\n` 표기를 한 줄의 접근 가능한 이름으로 만든다. */
export function normalizedSceneNodeLabel(label: string) {
  return label
    .split(/\r?\n|\\n/u)
    .map((line) => line.trim())
    .filter(Boolean)
    .join(" ")
}
