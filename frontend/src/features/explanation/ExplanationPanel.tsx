import { useEffect, useRef } from "react"
import { BookOpen, Columns2, PanelRightClose } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ContentSection } from "@/features/explanation/ContentSection"

type ExplanationPanelProps = {
  sceneId?: string
  title: string
  readingMode: boolean
  restoreScrollTop: number
  onScrollTopChange: (scrollTop: number) => void
  onCollapse: () => void
  onToggleReadingMode: () => void
}

export function ExplanationPanel({
  sceneId,
  title,
  readingMode,
  restoreScrollTop,
  onScrollTopChange,
  onCollapse,
  onToggleReadingMode,
}: ExplanationPanelProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const viewport = scrollAreaRef.current?.querySelector<HTMLElement>(
      '[data-slot="scroll-area-viewport"]'
    )
    if (!viewport) return

    viewport.scrollTop = restoreScrollTop
    const handleScroll = () => onScrollTopChange(viewport.scrollTop)
    viewport.addEventListener("scroll", handleScroll, { passive: true })
    return () => viewport.removeEventListener("scroll", handleScroll)
  }, [onScrollTopChange, restoreScrollTop, sceneId])

  return (
    <aside
      aria-labelledby="explanation-title"
      className="flex size-full min-h-0 flex-col bg-background"
    >
      <div className="flex shrink-0 items-start gap-3 border-b border-border px-5 py-4">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Explanation
          </p>
          <h2 id="explanation-title" className="truncate text-lg font-semibold">
            {title}
          </h2>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={readingMode ? "분할 화면으로 돌아가기" : "읽기 모드 열기"}
          onClick={onToggleReadingMode}
        >
          {readingMode ? (
            <Columns2 aria-hidden="true" />
          ) : (
            <BookOpen aria-hidden="true" />
          )}
        </Button>
        {!readingMode ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="설명 패널 접기"
            onClick={onCollapse}
          >
            <PanelRightClose aria-hidden="true" />
          </Button>
        ) : null}
      </div>

      <div ref={scrollAreaRef} className="min-h-0 flex-1">
        <ScrollArea className="size-full">
          <article className="mx-auto max-w-3xl space-y-8 px-6 py-7">
            <p className="text-base leading-8 text-foreground">
              사용자가 검색어를 입력한 순간부터 결과가 화면에 나타나기까지 여러
              시스템이 하나의 흐름으로 이어집니다. 이 임시 설명은 지도와 긴 글이
              같은 화면에서 독립적으로 동작하는지 확인하기 위한 내용입니다.
            </p>

            <ContentSection title="개요">
              <p>
                브라우저는 입력을 해석하고 네트워크 요청을 준비합니다. 이후 이름
                확인, 연결 수립, 요청 전송, 서버 처리와 응답 렌더링이 순서대로
                이어집니다.
              </p>
              <p>
                지도는 이 과정의 위치와 흐름을 보여주고, 설명 패널은 현재
                장면에서 무엇을 봐야 하는지 충분한 맥락을 제공합니다.
              </p>
            </ContentSection>

            <ContentSection title="왜 필요한가">
              <p>
                개별 기술 용어만 학습하면 서로 다른 계층이 실제 요청에서 어떻게
                연결되는지 놓치기 쉽습니다. 하나의 사건을 따라가면 네트워크,
                운영체제, 서버와 데이터 처리의 경계를 자연스럽게 비교할 수
                있습니다.
              </p>
            </ContentSection>

            <ContentSection title="전체 동작 과정">
              <p>
                입력 이벤트가 브라우저에 전달되고, 브라우저는 목적지를 확인한 뒤
                연결을 준비합니다. 요청은 여러 네트워크 구간을 지나 서비스
                인프라에 도착하며, 서버가 만든 응답은 반대 방향으로 돌아옵니다.
              </p>
              <p>
                각 단계는 이후 별도의 장면으로 확장될 수 있지만, 아직 제작되지
                않은 장면으로 이동하는 동작은 이 단계에서 구현하지 않습니다.
              </p>
            </ContentSection>

            <ContentSection title="실패 상황">
              <p>
                주소 확인 실패, 연결 시간 초과, 서버 오류처럼 서로 다른 계층에서
                문제가 발생할 수 있습니다. 현재 장면의 설명은 이런 실패가 전체
                흐름의 어느 지점에 해당하는지 함께 다룰 수 있어야 합니다.
              </p>
            </ContentSection>

            <ContentSection title="읽는 방법">
              <p>
                패널 경계를 드래그해 지도와 설명의 비율을 바꿀 수 있습니다. 읽기
                모드는 같은 페이지 안에서 설명을 넓히며, 분할 화면으로 돌아오면
                지도 Viewport가 다시 나타납니다.
              </p>
            </ContentSection>
          </article>
        </ScrollArea>
      </div>
    </aside>
  )
}
