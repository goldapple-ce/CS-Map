import type { ReactNode } from "react"

type ContentSectionProps = {
  title: string
  children: ReactNode
}

export function ContentSection({ title, children }: ContentSectionProps) {
  return (
    <section className="space-y-3 border-b border-border pb-8 last:border-b-0">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <div className="space-y-4 text-sm leading-7 text-muted-foreground">
        {children}
      </div>
    </section>
  )
}
