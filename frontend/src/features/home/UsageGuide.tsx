import { BookOpenText, MousePointerClick, ZoomIn } from "lucide-react"

export function UsageGuide() {
  return (
    <section aria-labelledby="how-to-use-title">
      <div className="text-left">
        <p className="font-medium text-muted-foreground">이렇게 탐색해보세요</p>
      </div>
      <ol className="mt-4 grid gap-3 sm:grid-cols-3">
        {usageSteps.map(({ icon: Icon, title, description }, index) => (
          <li
            key={title}
            className="items-center gap-4 rounded-xl border border-border bg-card p-4 text-left"
          >
            <div className="flex items-center gap-4">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted">
                <Icon
                  className="size-4 text-muted-foreground"
                  aria-hidden="true"
                />
              </div>
              <h3 className="font-semibold">
                {index + 1}. {title}
              </h3>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}

const usageSteps = [
  {
    icon: MousePointerClick,
    title: "전체 흐름을 살펴보세요",
    description: "요청이 처리되는 순서를 확인하세요.",
  },
  {
    icon: BookOpenText,
    title: "설명으로 연결하세요",
    description: "각 카드의 현재 흐름에서 맡은 역할을 설명에서 확인하세요.",
  },
  {
    icon: ZoomIn,
    title: "카드 안으로 들어가세요",
    description: "[내부 보기]가 있는 카드는 더 자세히 볼 수 있습니다.",
  },
]
