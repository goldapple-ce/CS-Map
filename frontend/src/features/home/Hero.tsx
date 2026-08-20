export function Hero() {
  return (
    <div className="flex flex-col items-center space-y-5 text-center">
      <p className="rounded-full border border-border bg-muted/40 px-4 py-1.5 text-sm text-muted-foreground">
        연결해서 이해하는 컴퓨터공학 지도
      </p>
      <h1 className="text-6xl font-bold">흩어진 CS 지식을 연결하세요.</h1>
      <p className="text-lg text-muted-foreground">
        CS Map은 새로운 페이지를 넘기는 대신 하나의 지식 공간을 확대하며
        탐색하는 서비스입니다. <br />큰 처리 흐름에서 시작해 네트워크, 운영체제,
        서버의 내부까지 자연스럽게 들어가 보세요.
      </p>
    </div>
  )
}
