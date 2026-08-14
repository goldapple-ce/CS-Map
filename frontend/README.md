# Frontend

CS Map의 화면, 탐색과 콘텐츠 표시 기능을 구현하는 React 애플리케이션이다.

## 실행

`frontend` 디렉터리에서 다음 순서로 실행한다.

1. `npm install`: 필요한 패키지 설치
2. `npm run dev`: 콘텐츠 생성 후 개발 서버 실행

배포 파일은 `npm run build`, 생성 결과 확인은 `npm run preview`를 사용한다. 콘텐츠 형식만 확인하려면 `npm run content:validate`를 실행한다.

## 주요 디렉터리

- `content`: Scene, Topic, Concept와 퀴즈
- `scripts`: 콘텐츠 검증, Layout과 Index 생성
- `src/app`: Route와 애플리케이션 조립
- `src/domain`: 콘텐츠와 탐색 타입
- `src/content`: Content Repository와 생성된 Index
- `src/features`: Explorer와 Explanation Panel
- `src/components`: 공통 UI와 Scene 렌더링

## 관련 문서

- [제품 요구사항](../docs/REQUIREMENTS.md)
- [기술 설계](../docs/TECHNICAL_DESIGN.md)
- [코드 작성 가이드](../docs/CODE_GUIDE.md)
- [콘텐츠 작성 가이드](../docs/CONTENT_GUIDE.md)
